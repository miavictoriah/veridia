/**
 * Risk Scoring Algorithm for Veridia
 *
 * Calculates a Compliance Risk Score (0-100) based on:
 * - Time to EPC C deadline (October 2030)
 * - Current EPC rating distance from target
 * - Estimated remediation cost
 * - Property type (residential = higher regulation)
 * - MEES compliance status
 * - Building Safety Act applicability
 *
 * Risk Bands:
 * - 0-25: Low Risk (compliant, 5+ years to deadline)
 * - 26-50: Moderate Risk (compliant, 2-5 years to deadline)
 * - 51-75: High Risk (non-compliant or <2 years to deadline)
 * - 76-100: Critical Risk (immediate action required)
 */

// EPC C deadline: October 2030
const EPC_C_DEADLINE = new Date("2030-10-01");

// EPC rating numeric values (lower = worse)
const EPC_RATING_VALUES: Record<string, number> = {
  A: 92,
  B: 81,
  C: 69,
  D: 55,
  E: 39,
  F: 21,
  G: 1,
};

// Target rating for compliance
const TARGET_RATING = "C";
const TARGET_VALUE = EPC_RATING_VALUES[TARGET_RATING];

export interface RiskScoreInput {
  epcRating: string | null;
  epcScore: number | null;
  propertyType: string;
  units: number;
  storeys: number | null;
  estimatedRetrofitCost: number | null;
  ownershipType: string;
}

export interface RiskScoreResult {
  riskScore: number; // 0-100
  riskBand: "low" | "moderate" | "high" | "critical";
  riskLevel: "low" | "medium" | "high";
  complianceStatus: "compliant" | "at_risk" | "non_compliant";
  lettable: boolean;
  meesCompliant: boolean;
  buildingSafetyAct: boolean;
  yearsToDeadline: number;
  forecast6m: string;
  forecast12m: string;
  forecast24m: string;
  capexPriority: number; // 1-10
  estimatedPaybackYears: number;
}

/**
 * Calculate comprehensive risk score for a property
 */
export function calculateRiskScore(input: RiskScoreInput): RiskScoreResult {
  const now = new Date();
  const yearsToDeadline = Math.max(0, (EPC_C_DEADLINE.getTime() - now.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  const roundedYears = Math.round(yearsToDeadline * 10) / 10;

  // Determine current EPC compliance
  const epcRating = input.epcRating?.toUpperCase() || "Unknown";
  const epcValue = EPC_RATING_VALUES[epcRating] || 0;
  const isAboveTarget = epcValue >= TARGET_VALUE;

  // MEES compliance (currently E minimum for rentals)
  const meesMinValue = EPC_RATING_VALUES["E"];
  const meesCompliant = epcValue >= meesMinValue || epcRating === "Unknown";

  // Building Safety Act (applies to 7+ storey residential buildings)
  const buildingSafetyAct =
    (input.storeys !== null && input.storeys >= 7) ||
    (input.units >= 21 && input.propertyType === "residential");

  // --- Calculate Risk Score Components ---

  // 1. Time to deadline factor (0-35 points)
  // More points = more risk (less time)
  let timeScore = 0;
  if (roundedYears <= 1) timeScore = 35;
  else if (roundedYears <= 2) timeScore = 30;
  else if (roundedYears <= 3) timeScore = 25;
  else if (roundedYears <= 4) timeScore = 18;
  else if (roundedYears <= 5) timeScore = 12;
  else timeScore = 5;

  // 2. EPC rating distance factor (0-30 points)
  let ratingScore = 0;
  if (epcRating === "Unknown") {
    ratingScore = 15; // Unknown = moderate risk
  } else if (isAboveTarget) {
    ratingScore = 0; // Already compliant
  } else {
    const gap = TARGET_VALUE - epcValue;
    ratingScore = Math.min(30, Math.round(gap * 0.6));
  }

  // 3. Cost factor (0-15 points)
  let costScore = 0;
  const cost = input.estimatedRetrofitCost || 0;
  if (cost > 50000) costScore = 15;
  else if (cost > 30000) costScore = 12;
  else if (cost > 15000) costScore = 8;
  else if (cost > 5000) costScore = 4;
  else costScore = 0;

  // 4. Property type factor (0-10 points)
  let typeScore = 0;
  if (input.propertyType === "residential") typeScore = 8;
  else if (input.propertyType === "mixed") typeScore = 6;
  else typeScore = 4; // commercial

  // 5. MEES non-compliance (0-10 points)
  let meesScore = meesCompliant ? 0 : 10;

  // 6. Building Safety Act (0-5 bonus)
  let bsaScore = buildingSafetyAct ? 5 : 0;

  // Already compliant bonus (reduce score significantly)
  let complianceBonus = isAboveTarget ? -20 : 0;

  // Total risk score (clamped 0-100)
  const rawScore = timeScore + ratingScore + costScore + typeScore + meesScore + bsaScore + complianceBonus;
  const riskScore = Math.max(0, Math.min(100, rawScore));

  // Determine risk band
  let riskBand: "low" | "moderate" | "high" | "critical";
  if (riskScore <= 25) riskBand = "low";
  else if (riskScore <= 50) riskBand = "moderate";
  else if (riskScore <= 75) riskBand = "high";
  else riskBand = "critical";

  // Map to 3-level risk
  let riskLevel: "low" | "medium" | "high";
  if (riskScore <= 33) riskLevel = "low";
  else if (riskScore <= 66) riskLevel = "medium";
  else riskLevel = "high";

  // Compliance status
  let complianceStatus: "compliant" | "at_risk" | "non_compliant";
  if (!meesCompliant) complianceStatus = "non_compliant";
  else if (isAboveTarget) complianceStatus = "compliant";
  else complianceStatus = "at_risk";

  // Lettable status
  const lettable = meesCompliant;

  // Generate forecasts
  const forecast6m = generateForecast(epcRating, isAboveTarget, roundedYears, 0.5);
  const forecast12m = generateForecast(epcRating, isAboveTarget, roundedYears, 1);
  const forecast24m = generateForecast(epcRating, isAboveTarget, roundedYears, 2);

  // Capex priority (1-10, higher = more urgent)
  const capexPriority = Math.min(10, Math.max(1, Math.round(riskScore / 10)));

  // Estimated payback years
  const estimatedPaybackYears = cost > 0 ? Math.round(cost / 1500) : 0; // rough estimate based on energy savings

  return {
    riskScore,
    riskBand,
    riskLevel,
    complianceStatus,
    lettable,
    meesCompliant,
    buildingSafetyAct,
    yearsToDeadline: roundedYears,
    forecast6m,
    forecast12m,
    forecast24m,
    capexPriority,
    estimatedPaybackYears,
  };
}

/**
 * Generate compliance forecast for a given time horizon
 */
function generateForecast(
  epcRating: string,
  isAboveTarget: boolean,
  yearsToDeadline: number,
  yearsAhead: number
): string {
  const remainingYears = yearsToDeadline - yearsAhead;

  if (isAboveTarget) {
    if (remainingYears > 3) {
      return `Compliant. EPC ${epcRating} meets EPC C target. No action required.`;
    } else if (remainingYears > 1) {
      return `Compliant. EPC ${epcRating} meets target. Monitor for regulatory changes.`;
    } else {
      return `Compliant. EPC ${epcRating} meets target. Verify certificate is current.`;
    }
  }

  // Not yet compliant
  if (remainingYears > 4) {
    return `At risk. EPC ${epcRating} below target C. ${Math.round(remainingYears)} years to deadline. Begin planning upgrades.`;
  } else if (remainingYears > 2) {
    return `High risk. EPC ${epcRating} below target C. ${Math.round(remainingYears)} years remaining. Schedule capex urgently.`;
  } else if (remainingYears > 0.5) {
    return `Critical. EPC ${epcRating} below target C. Only ${Math.round(remainingYears * 12)} months remaining. Immediate action required.`;
  } else {
    return `Non-compliant. EPC ${epcRating} fails EPC C requirement. Property may become non-lettable. Upgrade immediately.`;
  }
}

/**
 * Calculate portfolio-level risk summary
 */
export function calculatePortfolioRisk(properties: RiskScoreResult[]): {
  averageRiskScore: number;
  highRiskCount: number;
  criticalCount: number;
  compliantCount: number;
  atRiskCount: number;
  nonCompliantCount: number;
  totalCapex: number;
  portfolioRiskBand: string;
} {
  if (properties.length === 0) {
    return {
      averageRiskScore: 0,
      highRiskCount: 0,
      criticalCount: 0,
      compliantCount: 0,
      atRiskCount: 0,
      nonCompliantCount: 0,
      totalCapex: 0,
      portfolioRiskBand: "low",
    };
  }

  const totalScore = properties.reduce((sum, p) => sum + p.riskScore, 0);
  const averageRiskScore = Math.round(totalScore / properties.length);

  return {
    averageRiskScore,
    highRiskCount: properties.filter((p) => p.riskBand === "high" || p.riskBand === "critical").length,
    criticalCount: properties.filter((p) => p.riskBand === "critical").length,
    compliantCount: properties.filter((p) => p.complianceStatus === "compliant").length,
    atRiskCount: properties.filter((p) => p.complianceStatus === "at_risk").length,
    nonCompliantCount: properties.filter((p) => p.complianceStatus === "non_compliant").length,
    totalCapex: 0, // will be calculated from actual property data
    portfolioRiskBand: averageRiskScore <= 25 ? "low" : averageRiskScore <= 50 ? "moderate" : averageRiskScore <= 75 ? "high" : "critical",
  };
}

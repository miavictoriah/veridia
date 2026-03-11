/**
 * EPC Register API Integration
 * Fetches real EPC data from the UK EPC Register
 * API Documentation: https://epc.opendatacommunities.org/
 */

const EPC_EMAIL = process.env.EPC_EMAIL;
const EPC_API_KEY = process.env.EPC_API_KEY;

function getEpcAuthHeader(): Record<string, string> {
  if (!EPC_EMAIL || !EPC_API_KEY) {
    return {};
  }

  const credentials = Buffer.from(`${EPC_EMAIL}:${EPC_API_KEY}`).toString("base64");
  return {
    Authorization: `Basic ${credentials}`,
  };
}

interface EPCProperty {
  addressLine1: string;
  addressLine2: string;
  postcode: string;
  currentEnergyEfficiencyRating: string;
  potentialEnergyEfficiencyRating: string;
  currentEnergyEfficiencyBand: string;
  potentialEnergyEfficiencyBand: string;
  buildingReferenceNumber: string;
  inspectionDate: string;
  lodgementDate: string;
}

interface EPCLookupResult {
  success: boolean;
  data?: EPCProperty;
  error?: string;
}

/**
 * Lookup property EPC data by postcode and address
 * Uses the public EPC Register API
 */
export async function lookupEPCByAddress(
  postcode: string,
  addressLine1: string
): Promise<EPCLookupResult> {
  try {
    // EPC Register API endpoint
    const apiUrl = "https://epc.opendatacommunities.org/api/v2/properties";
    
    // Build query parameters
    const params = new URLSearchParams({
      postcode: postcode.replace(/\s/g, ""),
      address: addressLine1,
      size: "1",
    });

    const response = await fetch(`${apiUrl}?${params.toString()}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        ...getEpcAuthHeader(),
      },
    });

    if (!response.ok) {
      return {
        success: false,
        error: `EPC API returned status ${response.status}`,
      };
    }

    const result = await response.json();

    if (!result.data || result.data.length === 0) {
      return {
        success: false,
        error: "No EPC data found for this property",
      };
    }

    const property = result.data[0];
    return {
      success: true,
      data: {
        addressLine1: property.address_line_1 || "",
        addressLine2: property.address_line_2 || "",
        postcode: property.postcode || "",
        currentEnergyEfficiencyRating: property.current_energy_efficiency_rating || "Unknown",
        potentialEnergyEfficiencyRating: property.potential_energy_efficiency_rating || "Unknown",
        currentEnergyEfficiencyBand: property.current_energy_efficiency_band || "Unknown",
        potentialEnergyEfficiencyBand: property.potential_energy_efficiency_band || "Unknown",
        buildingReferenceNumber: property.building_reference_number || "",
        inspectionDate: property.inspection_date || "",
        lodgementDate: property.lodgement_date || "",
      },
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to fetch EPC data: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

/**
 * Lookup property EPC data by building reference number
 * More precise than address-based lookup
 */
export async function lookupEPCByBuildingRef(
  buildingRef: string
): Promise<EPCLookupResult> {
  try {
    const apiUrl = "https://epc.opendatacommunities.org/api/v2/properties";
    
    const params = new URLSearchParams({
      building_reference_number: buildingRef,
      size: "1",
    });

    const response = await fetch(`${apiUrl}?${params.toString()}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        ...getEpcAuthHeader(),
      },
    });

    if (!response.ok) {
      return {
        success: false,
        error: `EPC API returned status ${response.status}`,
      };
    }

    const result = await response.json();

    if (!result.data || result.data.length === 0) {
      return {
        success: false,
        error: "No EPC data found for this building reference",
      };
    }

    const property = result.data[0];
    return {
      success: true,
      data: {
        addressLine1: property.address_line_1 || "",
        addressLine2: property.address_line_2 || "",
        postcode: property.postcode || "",
        currentEnergyEfficiencyRating: property.current_energy_efficiency_rating || "Unknown",
        potentialEnergyEfficiencyRating: property.potential_energy_efficiency_rating || "Unknown",
        currentEnergyEfficiencyBand: property.current_energy_efficiency_band || "Unknown",
        potentialEnergyEfficiencyBand: property.potential_energy_efficiency_band || "Unknown",
        buildingReferenceNumber: property.building_reference_number || "",
        inspectionDate: property.inspection_date || "",
        lodgementDate: property.lodgement_date || "",
      },
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to fetch EPC data: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

/**
 * Convert EPC rating letter to numeric score (A=100, F=20)
 */
export function epcRatingToScore(rating: string): number {
  const scores: Record<string, number> = {
    "A": 100,
    "B": 85,
    "C": 70,
    "D": 55,
    "E": 40,
    "F": 20,
  };
  return scores[rating] || 0;
}

/**
 * Determine if property is lettable based on EPC rating
 * Current UK regulations (2025): Minimum D rating required
 */
export function isPropertyLettable(epcRating: string): boolean {
  const nonLettableRatings = ["E", "F"];
  return !nonLettableRatings.includes(epcRating);
}

/**
 * Calculate retrofit urgency based on EPC rating and deadline
 * Returns priority level: critical, high, medium, low
 */
export function calculateRetrofitUrgency(
  currentRating: string,
  targetRating: string,
  deadline: Date
): "critical" | "high" | "medium" | "low" {
  const now = new Date();
  const monthsUntilDeadline = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30);
  
  const currentScore = epcRatingToScore(currentRating);
  const targetScore = epcRatingToScore(targetRating);
  const ratingGap = currentScore - targetScore;

  if (monthsUntilDeadline < 6 && ratingGap > 0) return "critical";
  if (monthsUntilDeadline < 12 && ratingGap > 15) return "high";
  if (monthsUntilDeadline < 24 && ratingGap > 0) return "medium";
  return "low";
}

/**
 * Estimate retrofit cost based on property type and EPC rating gap
 * Returns estimated cost in GBP
 */
export function estimateRetrofitCost(
  propertyType: string,
  currentRating: string,
  targetRating: string
): number {
  const currentScore = epcRatingToScore(currentRating);
  const targetScore = epcRatingToScore(targetRating);
  const ratingGap = currentScore - targetScore;

  // Base costs by property type (per rating point)
  const baseCosts: Record<string, number> = {
    "office": 15000,
    "retail": 12000,
    "industrial": 10000,
    "mixed-use": 18000,
    "residential": 8000,
  };

  const baseCost = baseCosts[propertyType.toLowerCase()] || 12000;
  return Math.max(0, ratingGap * baseCost);
}

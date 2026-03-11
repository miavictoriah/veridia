import { describe, it, expect } from "vitest";
import { calculateRiskScore } from "./riskScoring";

describe("Risk Scoring Algorithm", () => {
  it("should return low risk for EPC A rating", () => {
    const result = calculateRiskScore({
      epcRating: "A",
      epcScore: 92,
      propertyType: "residential",
      units: 1,
      storeys: 2,
      estimatedRetrofitCost: 0,
      ownershipType: "owned",
    });
    expect(result.riskScore).toBeLessThan(30);
    expect(result.riskLevel).toBe("low");
    expect(result.meesCompliant).toBe(true);
    expect(result.lettable).toBe(true);
    expect(result.complianceStatus).toBe("compliant");
  });

  it("should return high risk for EPC F rating", () => {
    const result = calculateRiskScore({
      epcRating: "F",
      epcScore: 20,
      propertyType: "residential",
      units: 1,
      storeys: 2,
      estimatedRetrofitCost: 50000,
      ownershipType: "owned",
    });
    expect(result.riskScore).toBeGreaterThan(60);
    expect(result.riskLevel).toBe("high");
    expect(result.meesCompliant).toBe(false);
    expect(result.lettable).toBe(false);
    expect(result.complianceStatus).toBe("non_compliant");
  });

  it("should return at_risk compliance for EPC D rating", () => {
    const result = calculateRiskScore({
      epcRating: "D",
      epcScore: 55,
      propertyType: "residential",
      units: 1,
      storeys: 2,
      estimatedRetrofitCost: 15000,
      ownershipType: "owned",
    });
    // D is above MEES minimum (E) but below target (C)
    expect(result.meesCompliant).toBe(true);
    expect(result.complianceStatus).toBe("at_risk");
    expect(result.riskScore).toBeGreaterThan(0);
  });

  it("should flag building safety act for 7+ storey buildings", () => {
    const result = calculateRiskScore({
      epcRating: "C",
      epcScore: 70,
      propertyType: "residential",
      units: 20,
      storeys: 8,
      estimatedRetrofitCost: 0,
      ownershipType: "owned",
    });
    expect(result.buildingSafetyAct).toBe(true);
  });

  it("should not flag building safety act for low-rise buildings", () => {
    const result = calculateRiskScore({
      epcRating: "C",
      epcScore: 70,
      propertyType: "residential",
      units: 4,
      storeys: 3,
      estimatedRetrofitCost: 0,
      ownershipType: "owned",
    });
    expect(result.buildingSafetyAct).toBe(false);
  });

  it("should calculate years to EPC C deadline correctly", () => {
    const result = calculateRiskScore({
      epcRating: "D",
      epcScore: 55,
      propertyType: "residential",
      units: 1,
      storeys: 2,
      estimatedRetrofitCost: 10000,
      ownershipType: "owned",
    });
    // EPC C deadline is October 2030, so years should be positive
    expect(result.yearsToDeadline).toBeGreaterThan(0);
    expect(result.yearsToDeadline).toBeLessThan(10);
  });

  it("should handle null EPC data gracefully", () => {
    const result = calculateRiskScore({
      epcRating: null,
      epcScore: null,
      propertyType: "residential",
      units: 1,
      storeys: null,
      estimatedRetrofitCost: null,
      ownershipType: "owned",
    });
    expect(result.riskScore).toBeGreaterThanOrEqual(0);
    expect(result.riskScore).toBeLessThanOrEqual(100);
    expect(result.riskLevel).toBeDefined();
    expect(result.complianceStatus).toBeDefined();
  });

  it("should provide forecast ratings", () => {
    const result = calculateRiskScore({
      epcRating: "D",
      epcScore: 55,
      propertyType: "residential",
      units: 1,
      storeys: 2,
      estimatedRetrofitCost: 15000,
      ownershipType: "owned",
    });
    expect(result.forecast6m).toBeDefined();
    expect(result.forecast12m).toBeDefined();
    expect(result.forecast24m).toBeDefined();
  });

  it("should calculate capex priority as numeric value 1-10", () => {
    const result = calculateRiskScore({
      epcRating: "E",
      epcScore: 38,
      propertyType: "commercial",
      units: 5,
      storeys: 3,
      estimatedRetrofitCost: 30000,
      ownershipType: "investment",
    });
    expect(result.capexPriority).toBeDefined();
    expect(result.capexPriority).toBeGreaterThanOrEqual(1);
    expect(result.capexPriority).toBeLessThanOrEqual(10);
  });
});

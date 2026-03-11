import { describe, it, expect, vi } from "vitest";

// Test the helper functions by importing and testing the module
describe("EPC API Service", () => {
  it("should export lookupEPCByPostcode function", async () => {
    const mod = await import("./epcApi");
    expect(typeof mod.lookupEPCByPostcode).toBe("function");
  });

  it("should export lookupEPCByAddress function", async () => {
    const mod = await import("./epcApi");
    expect(typeof mod.lookupEPCByAddress).toBe("function");
  });

  it("should return empty array for invalid postcode", async () => {
    const mod = await import("./epcApi");
    const results = await mod.lookupEPCByPostcode("INVALID");
    expect(results).toEqual([]);
  });

  it("should return empty array for non-residential postcode", async () => {
    const mod = await import("./epcApi");
    // SW1A 1AA is Buckingham Palace - no residential EPCs
    const results = await mod.lookupEPCByPostcode("SW1A 1AA");
    expect(results).toEqual([]);
  });

  it("should return certificates for a valid residential postcode", async () => {
    const mod = await import("./epcApi");
    // E1 6AN has known EPC data
    const results = await mod.lookupEPCByPostcode("E1 6AN");
    expect(results.length).toBeGreaterThan(0);

    const cert = results[0];
    expect(cert.address).toBeTruthy();
    expect(cert.epcRating).toMatch(/^[A-G]$/);
    expect(cert.epcScore).toBeGreaterThan(0);
    expect(cert.epcScore).toBeLessThanOrEqual(100);
    expect(cert.potentialRating).toMatch(/^[A-G]$/);
    expect(cert.propertyType).toBeTruthy();
    expect(cert.floorArea).toBeGreaterThan(0);
    expect(cert.energyCostsAnnual).toBeGreaterThan(0);
    expect(cert.co2Emissions).toBeGreaterThan(0);
    expect(cert.certificateNumber).toBeTruthy();
    expect(cert.expiryDate).toBeTruthy();
  }, 30000);

  it("should parse improvement recommendations", async () => {
    const mod = await import("./epcApi");
    const results = await mod.lookupEPCByPostcode("E1 6AN");
    expect(results.length).toBeGreaterThan(0);

    const cert = results[0];
    // E1 6AN property (rating D) should have recommendations
    if (cert.recommendations.length > 0) {
      const rec = cert.recommendations[0];
      expect(rec.improvement).toBeTruthy();
      expect(rec.indicativeCost).toContain("£");
      expect(rec.typicalSaving).toContain("£");
    }
  }, 30000);

  it("should calculate total upgrade cost", async () => {
    const mod = await import("./epcApi");
    const results = await mod.lookupEPCByPostcode("E1 6AN");
    expect(results.length).toBeGreaterThan(0);

    const cert = results[0];
    expect(cert.totalUpgradeCost).toBeGreaterThan(0);
  }, 30000);

  it("should handle postcode with no spaces", async () => {
    const mod = await import("./epcApi");
    const results = await mod.lookupEPCByPostcode("E16AN");
    expect(results.length).toBeGreaterThan(0);
  }, 30000);

  it("should find best address match", async () => {
    const mod = await import("./epcApi");
    const result = await mod.lookupEPCByAddress("E1 6AN", "6 Brushfield Street");
    expect(result).not.toBeNull();
    if (result) {
      expect(result.address.toLowerCase()).toContain("brushfield");
    }
  }, 30000);
});

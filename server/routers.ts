import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { lookupEPCByPostcode, lookupEPCByAddress } from "./epcApi";
import { calculateRiskScore } from "./riskScoring";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  properties: router({
    list: protectedProcedure.query(({ ctx }) => db.getUserProperties(ctx.user.id)),
    byId: protectedProcedure.input(z.object({ id: z.number() })).query(({ input }) => db.getPropertyById(input.id)),

    /**
     * Create property with optional EPC auto-enrichment
     * If postcode is provided, automatically looks up EPC data and calculates risk score
     */
    create: protectedProcedure.input(z.object({
      name: z.string(),
      address: z.string(),
      postcode: z.string().optional(),
      propertyType: z.string(),
      units: z.number().optional(),
      ownershipType: z.string().optional(),
      yearBuilt: z.number().optional(),
      floorArea: z.number().optional(),
      storeys: z.number().optional(),
      notes: z.string().optional(),
      // Allow manual EPC input
      epcRating: z.string().optional(),
      // Flag to skip EPC lookup
      skipEpcLookup: z.boolean().optional(),
    })).mutation(async ({ ctx, input }) => {
      let epcData: any = {};
      let riskData: any = {};

      // Auto-lookup EPC data if postcode provided and not skipping
      if (input.postcode && !input.skipEpcLookup) {
        try {
          const epcResult = await lookupEPCByAddress(input.postcode, input.address);
          if (epcResult) {
            epcData = {
              epcRating: epcResult.epcRating,
              epcScore: epcResult.epcScore,
              epcDate: epcResult.inspectionDate,
              epcExpiry: epcResult.expiryDate,
              epcCertificateNumber: epcResult.certificateNumber,
              energyCostsAnnual: epcResult.energyCostsAnnual,
              co2Emissions: Math.round(epcResult.co2Emissions),
              epcRecommendations: epcResult.recommendations,
              floorArea: epcResult.floorArea || input.floorArea,
              estimatedRetrofitCost: epcResult.totalUpgradeCost,
              epcDataSource: "api",
            };
          }
        } catch (error) {
          console.error("EPC lookup failed:", error);
        }
      }

      // Calculate risk score
      const effectiveEpcRating = epcData.epcRating || input.epcRating || null;
      const riskResult = calculateRiskScore({
        epcRating: effectiveEpcRating,
        epcScore: epcData.epcScore || null,
        propertyType: input.propertyType,
        units: input.units || 1,
        storeys: input.storeys || null,
        estimatedRetrofitCost: epcData.estimatedRetrofitCost || null,
        ownershipType: input.ownershipType || "owned",
      });

      riskData = {
        riskScore: riskResult.riskScore,
        riskLevel: riskResult.riskLevel,
        riskBand: riskResult.riskBand,
        complianceStatus: riskResult.complianceStatus,
        lettable: riskResult.lettable,
        meesCompliant: riskResult.meesCompliant,
        buildingSafetyAct: riskResult.buildingSafetyAct,
        yearsToDeadline: Math.round(riskResult.yearsToDeadline),
        forecast6m: riskResult.forecast6m,
        forecast12m: riskResult.forecast12m,
        forecast24m: riskResult.forecast24m,
        capexPriority: riskResult.capexPriority,
        estimatedPaybackYears: riskResult.estimatedPaybackYears,
      };

      // Merge all data and create property
      const propertyData = {
        ...input,
        ...epcData,
        ...riskData,
      };

      const result = await db.createProperty(ctx.user.id, propertyData);
      return { success: true, result, epcFound: !!epcData.epcRating, riskScore: riskResult.riskScore };
    }),

    update: protectedProcedure.input(z.object({
      id: z.number(),
      name: z.string().optional(),
      address: z.string().optional(),
      postcode: z.string().optional(),
      propertyType: z.string().optional(),
      units: z.number().optional(),
      ownershipType: z.string().optional(),
      yearBuilt: z.number().optional(),
      floorArea: z.number().optional(),
      storeys: z.number().optional(),
      epcRating: z.string().optional(),
      notes: z.string().optional(),
      estimatedRetrofitCost: z.number().optional(),
    })).mutation(({ input }) => db.updateProperty(input.id, input)),

    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(({ input }) => db.deleteProperty(input.id)),

    /**
     * Look up EPC data for a postcode (returns all certificates)
     */
    lookupEPC: protectedProcedure.input(z.object({
      postcode: z.string(),
      address: z.string().optional(),
    })).query(async ({ input }) => {
      if (input.address) {
        const result = await lookupEPCByAddress(input.postcode, input.address);
        return result ? [result] : [];
      }
      return lookupEPCByPostcode(input.postcode);
    }),

    /**
     * Re-calculate risk score for an existing property
     */
    recalculateRisk: protectedProcedure.input(z.object({
      id: z.number(),
    })).mutation(async ({ input }) => {
      const property = await db.getPropertyById(input.id);
      if (!property) return { success: false, error: "Property not found" };

      const riskResult = calculateRiskScore({
        epcRating: property.epcRating,
        epcScore: property.epcScore,
        propertyType: property.propertyType,
        units: property.units || 1,
        storeys: property.storeys || null,
        estimatedRetrofitCost: property.estimatedRetrofitCost,
        ownershipType: property.ownershipType || "owned",
      });

      await db.updateProperty(input.id, {
        riskScore: riskResult.riskScore,
        riskLevel: riskResult.riskLevel,
        riskBand: riskResult.riskBand,
        complianceStatus: riskResult.complianceStatus,
        lettable: riskResult.lettable ? 1 : 0,
        meesCompliant: riskResult.meesCompliant ? 1 : 0,
        buildingSafetyAct: riskResult.buildingSafetyAct ? 1 : 0,
        yearsToDeadline: Math.round(riskResult.yearsToDeadline),
        forecast6m: riskResult.forecast6m,
        forecast12m: riskResult.forecast12m,
        forecast24m: riskResult.forecast24m,
        capexPriority: riskResult.capexPriority,
        estimatedPaybackYears: riskResult.estimatedPaybackYears,
      });

      return { success: true, riskScore: riskResult.riskScore, riskBand: riskResult.riskBand };
    }),

    /**
     * Refresh EPC data from API for an existing property
     */
    refreshEPC: protectedProcedure.input(z.object({
      id: z.number(),
    })).mutation(async ({ input }) => {
      const property = await db.getPropertyById(input.id);
      if (!property || !property.postcode) return { success: false, error: "Property not found or no postcode" };

      const epcResult = await lookupEPCByAddress(property.postcode, property.address);
      if (!epcResult) return { success: false, error: "No EPC data found" };

      // Update property with fresh EPC data
      await db.updateProperty(input.id, {
        epcRating: epcResult.epcRating,
        epcScore: epcResult.epcScore,
        epcDate: epcResult.inspectionDate,
        epcExpiry: epcResult.expiryDate,
        epcCertificateNumber: epcResult.certificateNumber,
        energyCostsAnnual: epcResult.energyCostsAnnual,
        co2Emissions: Math.round(epcResult.co2Emissions),
        epcRecommendations: epcResult.recommendations,
        floorArea: epcResult.floorArea,
        estimatedRetrofitCost: epcResult.totalUpgradeCost,
        epcDataSource: "api",
        lastEpcLookup: new Date(),
      });

      // Recalculate risk score with new data
      const riskResult = calculateRiskScore({
        epcRating: epcResult.epcRating,
        epcScore: epcResult.epcScore,
        propertyType: property.propertyType,
        units: property.units || 1,
        storeys: property.storeys || null,
        estimatedRetrofitCost: epcResult.totalUpgradeCost,
        ownershipType: property.ownershipType || "owned",
      });

      await db.updateProperty(input.id, {
        riskScore: riskResult.riskScore,
        riskLevel: riskResult.riskLevel,
        riskBand: riskResult.riskBand,
        complianceStatus: riskResult.complianceStatus,
        lettable: riskResult.lettable ? 1 : 0,
        meesCompliant: riskResult.meesCompliant ? 1 : 0,
        buildingSafetyAct: riskResult.buildingSafetyAct ? 1 : 0,
        forecast6m: riskResult.forecast6m,
        forecast12m: riskResult.forecast12m,
        forecast24m: riskResult.forecast24m,
        capexPriority: riskResult.capexPriority,
        estimatedPaybackYears: riskResult.estimatedPaybackYears,
      });

      return { success: true, epcRating: epcResult.epcRating, riskScore: riskResult.riskScore };
    }),
  }),

  portfolio: router({
    riskSummary: protectedProcedure.query(({ ctx }) => db.getPortfolioRiskSummary(ctx.user.id)),
    capexSummary: protectedProcedure.query(({ ctx }) => db.getPortfolioCapexSummary(ctx.user.id)),
  }),

  compliance: router({
    violations: protectedProcedure.input(z.object({ propertyId: z.number() })).query(({ input }) => db.getPropertyViolations(input.propertyId)),
    tasks: protectedProcedure.input(z.object({ propertyId: z.number() })).query(({ input }) => db.getPropertyComplianceTasks(input.propertyId)),
  }),

  capex: router({
    items: protectedProcedure.input(z.object({ propertyId: z.number() })).query(({ input }) => db.getPropertyCapexItems(input.propertyId)),
  }),

  forecasting: router({
    forecasts: protectedProcedure.input(z.object({ propertyId: z.number() })).query(({ input }) => db.getPropertyForecasts(input.propertyId)),
  }),

  analytics: router({
    predictiveMetrics: protectedProcedure.input(z.object({ propertyId: z.number() })).query(({ input }) => db.getPredictiveMetrics(input.propertyId)),
    riskScoring: protectedProcedure.query(async ({ ctx }) => {
      const props = await db.getUserProperties(ctx.user.id);
      if (props.length === 0) return { avgRiskScore: 0, criticalProperties: 0, trend: "stable" };
      const avgRisk = Math.round(props.reduce((sum, p) => sum + (p.riskScore || 0), 0) / props.length);
      const critical = props.filter(p => p.riskBand === "critical" || p.riskBand === "high").length;
      return { avgRiskScore: avgRisk, criticalProperties: critical, trend: "stable" };
    }),
  }),

  scenarios: router({
    list: protectedProcedure.query(({ ctx }) => db.getUserScenarios(ctx.user.id)),
    create: protectedProcedure.input(z.object({
      name: z.string(),
      description: z.string().optional(),
      scenarioType: z.string(),
      parameters: z.record(z.string(), z.any()),
    })).mutation(async ({ ctx, input }) => {
      return { id: 1, ...input, userId: ctx.user.id, createdAt: new Date() };
    }),
  }),

  timeline: router({
    tasks: protectedProcedure.input(z.object({ propertyId: z.number() })).query(({ input }) => db.getPropertyComplianceTasks(input.propertyId)),
    criticalPath: protectedProcedure.query(({ ctx }) => {
      return [];
    }),
  }),

  communications: router({
    list: protectedProcedure.input(z.object({ propertyId: z.number() })).query(({ input }) => db.getPropertyCommunications(input.propertyId)),
    templates: protectedProcedure.query(() => {
      return [
        { id: 1, name: "EPC Alert", type: "compliance_notice" },
        { id: 2, name: "Retrofit Update", type: "retrofit_update" },
        { id: 3, name: "Compliance Notice", type: "compliance_notice" },
      ];
    }),
  }),

  benchmarks: router({
    get: protectedProcedure.input(z.object({ region: z.string(), propertyType: z.string() })).query(({ input }) => db.getMarketBenchmark(input.region, input.propertyType)),
    portfolio: protectedProcedure.query(async ({ ctx }) => {
      const props = await db.getUserProperties(ctx.user.id);
      if (props.length === 0) {
        return {
          yourAvgEpc: "N/A",
          marketAvgEpc: "C",
          yourComplianceRate: 0,
          marketComplianceRate: 82,
          competitivePosition: "No data yet",
        };
      }
      const epcValues: Record<string, number> = { A: 7, B: 6, C: 5, D: 4, E: 3, F: 2, G: 1 };
      const epcLabels = ["G", "F", "E", "D", "C", "B", "A"];
      const propsWithEpc = props.filter(p => p.epcRating);
      const avgEpcValue = propsWithEpc.length > 0
        ? Math.round(propsWithEpc.reduce((sum, p) => sum + (epcValues[p.epcRating!] || 0), 0) / propsWithEpc.length)
        : 0;
      const yourAvgEpc = avgEpcValue > 0 ? epcLabels[avgEpcValue - 1] || "D" : "N/A";
      const compliant = props.filter(p => p.complianceStatus === "compliant").length;
      const yourComplianceRate = Math.round((compliant / props.length) * 100);
      const position = yourComplianceRate >= 82 ? "Above market average" : yourComplianceRate >= 70 ? "Near market average" : "Below market average";
      return {
        yourAvgEpc,
        marketAvgEpc: "C",
        yourComplianceRate,
        marketComplianceRate: 82,
        competitivePosition: position,
      };
    }),
  }),

  shareLinks: router({
    create: protectedProcedure.input(z.object({
      expiryHours: z.number().default(24),
      accessType: z.enum(["dashboard", "specific_property", "report"]).default("dashboard"),
      propertyId: z.number().optional(),
    })).mutation(async ({ ctx, input }) => {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + input.expiryHours);
      const token = await db.createShareLink(ctx.user.id, expiresAt, input.accessType, input.propertyId);
      return { token, expiresAt };
    }),
    list: protectedProcedure.query(({ ctx }) => db.getUserShareLinks(ctx.user.id)),
    revoke: protectedProcedure.input(z.object({ token: z.string() })).mutation(({ input }) => db.revokeShareLink(input.token)),
    getByToken: publicProcedure.input(z.object({ token: z.string() })).query(async ({ input }) => {
      const link = await db.getShareLinkByToken(input.token);
      if (!link) return null;
      await db.updateShareLinkAccess(input.token);
      return link;
     }),
  }),

  earlyAccess: router({
    create: publicProcedure.input(z.object({
      fullName: z.string(),
      workEmail: z.string().email(),
      companyName: z.string(),
      role: z.string(),
      portfolioSize: z.string(),
    })).mutation(async ({ input }) => {
      return await db.createEarlyAccessSignup(input);
    }),
  }),
});
export type AppRouter = typeof appRouter;

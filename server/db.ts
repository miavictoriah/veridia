import { drizzle } from "drizzle-orm/mysql2";
import { eq, inArray, desc, and } from "drizzle-orm";
import { InsertUser, users, properties, complianceViolations, capexItems, regulatoryForecasts, predictiveMetrics, scenarios, complianceTasks, tenantCommunications, marketBenchmarks, shareLinks, InsertShareLink, earlyAccess } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Property queries
 */
export async function getUserProperties(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(properties).where(eq(properties.userId, userId));
}

export async function getPropertyById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(properties).where(eq(properties.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/**
 * Compliance queries
 */
export async function getPropertyViolations(propertyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(complianceViolations).where(eq(complianceViolations.propertyId, propertyId));
}

export async function getPortfolioRiskSummary(userId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const props = await db.select().from(properties).where(eq(properties.userId, userId));
  const total = props.length;
  const highRisk = props.filter(p => p.riskLevel === 'high').length;
  const mediumRisk = props.filter(p => p.riskLevel === 'medium').length;
  const lowRisk = props.filter(p => p.riskLevel === 'low').length;
  const nonLettable = props.filter(p => !p.lettable).length;
  const totalRetrofitCost = props.reduce((sum, p) => sum + (p.estimatedRetrofitCost || 0), 0);
  
  return {
    total,
    highRisk,
    mediumRisk,
    lowRisk,
    nonLettable,
    totalRetrofitCost,
    compliancePercentage: total > 0 ? Math.round(((total - nonLettable) / total) * 100) : 100,
  };
}

/**
 * Capex queries
 */
export async function getPropertyCapexItems(propertyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(capexItems).where(eq(capexItems.propertyId, propertyId));
}

export async function getPortfolioCapexSummary(userId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const props = await db.select().from(properties).where(eq(properties.userId, userId));
  const propIds = props.map(p => p.id);
  
  if (propIds.length === 0) {
    return { totalCapex: 0, plannedCapex: 0, completedCapex: 0, inProgressCapex: 0 };
  }
  
  const capex = await db.select().from(capexItems).where(
    inArray(capexItems.propertyId, propIds)
  );
  
  const totalCapex = capex.reduce((sum, item) => sum + item.estimatedCost, 0);
  const plannedCapex = capex.filter(c => c.status === 'planned').reduce((sum, c) => sum + c.estimatedCost, 0);
  const inProgressCapex = capex.filter(c => c.status === 'in_progress').reduce((sum, c) => sum + c.estimatedCost, 0);
  const completedCapex = capex.filter(c => c.status === 'completed').reduce((sum, c) => sum + c.estimatedCost, 0);
  
  return { totalCapex, plannedCapex, inProgressCapex, completedCapex };
}

/**
 * Forecasting queries
 */
export async function getPropertyForecasts(propertyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(regulatoryForecasts).where(eq(regulatoryForecasts.propertyId, propertyId));
}

/**
 * AI Predictive Metrics queries
 */
export async function getPredictiveMetrics(propertyId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(predictiveMetrics).where(eq(predictiveMetrics.propertyId, propertyId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/**
 * Scenario queries
 */
export async function getUserScenarios(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(scenarios).where(eq(scenarios.userId, userId)).orderBy(desc(scenarios.createdAt));
}

/**
 * Compliance tasks queries
 */
export async function getPropertyComplianceTasks(propertyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(complianceTasks).where(eq(complianceTasks.propertyId, propertyId)).orderBy(complianceTasks.dueDate);
}

/**
 * Tenant communications queries
 */
export async function getPropertyCommunications(propertyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tenantCommunications).where(eq(tenantCommunications.propertyId, propertyId)).orderBy(desc(tenantCommunications.createdAt));
}

/**
 * Market benchmarks queries
 */
export async function getMarketBenchmark(region: string, propertyType: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(marketBenchmarks).where(
    and(eq(marketBenchmarks.region, region), eq(marketBenchmarks.propertyType, propertyType))
  ).limit(1);
  return result.length > 0 ? result[0] : undefined;
}


/**
 * Share links queries
 */
export async function createShareLink(userId: number, expiresAt: Date, accessType: "dashboard" | "specific_property" | "report", propertyId?: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  // Generate unique token
  const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  
  const result = await db.insert(shareLinks).values({
    userId,
    token,
    expiresAt,
    accessType,
    propertyId,
  });
  
  return token;
}

export async function getShareLinkByToken(token: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(shareLinks).where(
    and(eq(shareLinks.token, token), eq(shareLinks.isRevoked, 0))
  ).limit(1);
  
  if (result.length === 0) return undefined;
  const link = result[0];
  
  // Check if expired
  if (new Date() > link.expiresAt) return undefined;
  
  return link;
}

export async function updateShareLinkAccess(token: string) {
  const db = await getDb();
  if (!db) return;
  
  const result = await db.select().from(shareLinks).where(eq(shareLinks.token, token)).limit(1);
  if (result.length === 0) return;
  
  const link = result[0];
  await db.update(shareLinks).set({
    viewCount: (link.viewCount || 0) + 1,
    lastAccessedAt: new Date(),
  }).where(eq(shareLinks.token, token));
}

export async function getUserShareLinks(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(shareLinks).where(eq(shareLinks.userId, userId)).orderBy(desc(shareLinks.createdAt));
}

export async function revokeShareLink(token: string) {
  const db = await getDb();
  if (!db) return;
  
  await db.update(shareLinks).set({ isRevoked: 1 }).where(eq(shareLinks.token, token));
}


/**
 * Property CRUD operations
 */
export async function createProperty(userId: number, data: any) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.insert(properties).values({
    userId,
    name: data.name,
    address: data.address,
    postcode: data.postcode,
    propertyType: data.propertyType,
    units: data.units || 1,
    ownershipType: data.ownershipType || "owned",
    yearBuilt: data.yearBuilt,
    floorArea: data.floorArea,
    storeys: data.storeys,
    // EPC data
    epcRating: data.epcRating,
    epcScore: data.epcScore,
    epcDate: data.epcDate,
    epcExpiry: data.epcExpiry,
    epcCertificateNumber: data.epcCertificateNumber,
    energyCostsAnnual: data.energyCostsAnnual,
    co2Emissions: data.co2Emissions,
    epcRecommendations: data.epcRecommendations ? JSON.stringify(data.epcRecommendations) : null,
    // Risk scoring
    riskScore: data.riskScore || 0,
    riskLevel: data.riskLevel || "low",
    riskBand: data.riskBand || "low",
    complianceStatus: data.complianceStatus || "compliant",
    lettable: data.lettable !== undefined ? (data.lettable ? 1 : 0) : 1,
    meesCompliant: data.meesCompliant !== undefined ? (data.meesCompliant ? 1 : 0) : 1,
    buildingSafetyAct: data.buildingSafetyAct !== undefined ? (data.buildingSafetyAct ? 1 : 0) : 0,
    // Forecasting
    forecast6m: data.forecast6m,
    forecast12m: data.forecast12m,
    forecast24m: data.forecast24m,
    yearsToDeadline: data.yearsToDeadline,
    // Capex
    estimatedRetrofitCost: data.estimatedRetrofitCost || 0,
    capexPriority: data.capexPriority,
    estimatedPaybackYears: data.estimatedPaybackYears,
    // Metadata
    epcDataSource: data.epcDataSource || "manual",
    notes: data.notes,
  });
  
  return result;
}

export async function updateProperty(propertyId: number, data: any) {
  const db = await getDb();
  if (!db) return undefined;
  
  const updateData: Record<string, any> = {};
  
  // Copy all provided fields
  const fields = [
    'name', 'address', 'postcode', 'propertyType', 'units', 'ownershipType',
    'yearBuilt', 'floorArea', 'storeys',
    'epcRating', 'epcScore', 'epcDate', 'epcExpiry', 'epcCertificateNumber',
    'energyCostsAnnual', 'co2Emissions', 'epcRecommendations',
    'riskScore', 'riskLevel', 'riskBand', 'complianceStatus',
    'lettable', 'meesCompliant', 'buildingSafetyAct',
    'forecast6m', 'forecast12m', 'forecast24m', 'yearsToDeadline',
    'estimatedRetrofitCost', 'capexPriority', 'estimatedPaybackYears',
    'epcDataSource', 'lastEpcLookup', 'notes',
  ];
  
  for (const field of fields) {
    if (data[field] !== undefined) {
      if (field === 'epcRecommendations' && typeof data[field] === 'object') {
        updateData[field] = JSON.stringify(data[field]);
      } else {
        updateData[field] = data[field];
      }
    }
  }
  
  const result = await db.update(properties).set(updateData).where(eq(properties.id, propertyId));
  
  return result;
}

export async function deleteProperty(propertyId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.delete(properties).where(eq(properties.id, propertyId));
  
  return result;
}


export async function createEarlyAccessSignup(data: {
  fullName: string;
  workEmail: string;
  companyName: string;
  role: string;
  portfolioSize: string;
}) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.insert(earlyAccess).values({
    fullName: data.fullName,
    workEmail: data.workEmail,
    companyName: data.companyName,
    role: data.role,
    portfolioSize: data.portfolioSize,
  });

  return { success: true };
}

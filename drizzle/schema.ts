import { bigint, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Properties table - Commercial real estate assets
 */
export const properties = mysqlTable("properties", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  address: text("address").notNull(),
  postcode: varchar("postcode", { length: 20 }),
  propertyType: varchar("propertyType", { length: 50 }).notNull(), // residential, commercial, mixed
  units: int("units").default(1), // number of units
  ownershipType: varchar("ownershipType", { length: 50 }).default("owned"), // owned, leasehold, freehold, investment
  yearBuilt: int("yearBuilt"),
  floorArea: int("floorArea"), // in sqm
  storeys: int("storeys"), // building height
  // EPC data (from government API)
  epcRating: varchar("epcRating", { length: 1 }), // A-G
  epcScore: int("epcScore"), // 0-100 (SAP score)
  epcDate: varchar("epcDate", { length: 20 }), // date of last EPC assessment
  epcExpiry: varchar("epcExpiry", { length: 20 }), // EPC expiry date
  epcCertificateNumber: varchar("epcCertificateNumber", { length: 50 }),
  energyCostsAnnual: int("energyCostsAnnual"), // estimated annual energy cost GBP
  co2Emissions: int("co2Emissions"), // tonnes per year
  epcRecommendations: text("epcRecommendations"), // JSON of improvement recommendations
  // Risk scoring
  riskScore: int("riskScore").default(0), // 0-100 regulatory risk
  riskLevel: mysqlEnum("riskLevel", ["low", "medium", "high"]).default("low"),
  riskBand: varchar("riskBand", { length: 20 }).default("low"), // low, moderate, high, critical
  complianceStatus: mysqlEnum("complianceStatus", ["compliant", "at_risk", "non_compliant"]).default("compliant"),
  lettable: int("lettable").default(1), // boolean: 1 = lettable, 0 = non-lettable
  meesCompliant: int("meesCompliant").default(1), // MEES compliance status
  buildingSafetyAct: int("buildingSafetyAct").default(0), // subject to Building Safety Act
  // Forecasting
  forecast6m: text("forecast6m"), // 6-month compliance forecast
  forecast12m: text("forecast12m"), // 12-month forecast
  forecast24m: text("forecast24m"), // 24-month forecast
  yearsToDeadline: int("yearsToDeadline"), // years until EPC C deadline
  // Capex
  estimatedRetrofitCost: int("estimatedRetrofitCost"), // in GBP
  capexPriority: int("capexPriority"), // 1-10 priority ranking
  estimatedPaybackYears: int("estimatedPaybackYears"),
  // Flood Risk (from Environment Agency)
  floodRiskZone: varchar("floodRiskZone", { length: 50 }), // Zone 1, Zone 2, Zone 3a, Zone 3b
  floodRiskLevel: varchar("floodRiskLevel", { length: 20 }), // very_low, low, medium, high
  floodRiskSource: varchar("floodRiskSource", { length: 100 }), // rivers_sea, surface_water, groundwater
  floodRiskLastChecked: timestamp("floodRiskLastChecked"),
  // Land Registry
  landRegistryTitle: varchar("landRegistryTitle", { length: 50 }), // title number
  tenureType: varchar("tenureType", { length: 30 }), // freehold, leasehold
  registeredOwner: varchar("registeredOwner", { length: 255 }),
  lastSalePrice: bigint("lastSalePrice", { mode: "number" }), // in GBP
  lastSaleDate: varchar("lastSaleDate", { length: 20 }),
  // Planning
  planningZone: varchar("planningZone", { length: 100 }), // conservation_area, listed_building, etc.
  nearbyPlanningApps: int("nearbyPlanningApps"), // count of nearby planning applications
  planningConstraints: text("planningConstraints"), // JSON array of constraints
  localAuthority: varchar("localAuthority", { length: 100 }),
  // Metadata
  epcDataSource: varchar("epcDataSource", { length: 50 }).default("manual"), // manual, api, imported
  lastEpcLookup: timestamp("lastEpcLookup"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Property = typeof properties.$inferSelect;
export type InsertProperty = typeof properties.$inferInsert;

/**
 * Compliance requirements table - Regulatory rules and deadlines
 */
export const complianceRequirements = mysqlTable("complianceRequirements", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  regulationType: varchar("regulationType", { length: 100 }).notNull(), // EPC, Building Safety Act, Fire Safety, Net Zero, etc.
  description: text("description"),
  deadline: timestamp("deadline"),
  severity: mysqlEnum("severity", ["low", "medium", "high", "critical"]).default("medium"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ComplianceRequirement = typeof complianceRequirements.$inferSelect;
export type InsertComplianceRequirement = typeof complianceRequirements.$inferInsert;

/**
 * Compliance violations table - Property-specific violations
 */
export const complianceViolations = mysqlTable("complianceViolations", {
  id: int("id").autoincrement().primaryKey(),
  propertyId: int("propertyId").notNull().references(() => properties.id, { onDelete: "cascade" }),
  requirementId: int("requirementId").references(() => complianceRequirements.id),
  violationType: varchar("violationType", { length: 100 }).notNull(),
  description: text("description"),
  severity: mysqlEnum("severity", ["low", "medium", "high", "critical"]).default("medium"),
  status: mysqlEnum("status", ["open", "in_progress", "resolved"]).default("open"),
  detectedDate: timestamp("detectedDate").defaultNow(),
  resolvedDate: timestamp("resolvedDate"),
  estimatedCost: int("estimatedCost"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ComplianceViolation = typeof complianceViolations.$inferSelect;
export type InsertComplianceViolation = typeof complianceViolations.$inferInsert;

/**
 * Capex items table - Capital expenditure planning
 */
export const capexItems = mysqlTable("capexItems", {
  id: int("id").autoincrement().primaryKey(),
  propertyId: int("propertyId").notNull().references(() => properties.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }).notNull(), // retrofit, fire safety, energy efficiency, etc.
  estimatedCost: int("estimatedCost").notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high", "critical"]).default("medium"),
  timeline: varchar("timeline", { length: 50 }), // e.g., "Q2 2025", "2025-2027"
  roi: int("roi"), // return on investment percentage
  status: mysqlEnum("status", ["planned", "in_progress", "completed"]).default("planned"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CapexItem = typeof capexItems.$inferSelect;
export type InsertCapexItem = typeof capexItems.$inferInsert;

/**
 * Regulatory forecasts table - Predictions of future regulation impacts
 */
export const regulatoryForecasts = mysqlTable("regulatoryForecasts", {
  id: int("id").autoincrement().primaryKey(),
  propertyId: int("propertyId").notNull().references(() => properties.id, { onDelete: "cascade" }),
  forecastType: varchar("forecastType", { length: 100 }).notNull(), // EPC tightening, Net Zero deadline, etc.
  impactDescription: text("impactDescription"),
  affectedYear: int("affectedYear"),
  likelihood: mysqlEnum("likelihood", ["low", "medium", "high", "certain"]).default("medium"),
  estimatedImpactCost: int("estimatedImpactCost"),
  willBecomeLettable: int("willBecomeLettable"), // 1 = yes, 0 = no
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type RegulatoryForecast = typeof regulatoryForecasts.$inferSelect;
export type InsertRegulatoryForecast = typeof regulatoryForecasts.$inferInsert;

/**
 * Audit logs table - Track changes for compliance
 */
export const auditLogs = mysqlTable("auditLogs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  entityType: varchar("entityType", { length: 50 }).notNull(), // property, violation, capex, etc.
  entityId: int("entityId").notNull(),
  action: varchar("action", { length: 50 }).notNull(), // create, update, delete
  changes: text("changes"), // JSON of what changed
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;

/**
 * Predictive metrics table - AI-powered risk scoring and predictions
 */
export const predictiveMetrics = mysqlTable("predictiveMetrics", {
  id: int("id").autoincrement().primaryKey(),
  propertyId: int("propertyId").notNull().references(() => properties.id, { onDelete: "cascade" }),
  aiRiskScore: int("aiRiskScore"), // 0-100 AI-calculated risk
  predictedNonLettableDate: timestamp("predictedNonLettableDate"), // When property will become non-lettable
  retrofitUrgency: mysqlEnum("retrofitUrgency", ["low", "medium", "high", "critical"]).default("medium"),
  recommendedRetrofitYear: int("recommendedRetrofitYear"),
  estimatedComplianceCost: int("estimatedComplianceCost"),
  riskTrend: varchar("riskTrend", { length: 20 }), // improving, stable, worsening
  lastCalculated: timestamp("lastCalculated"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PredictiveMetric = typeof predictiveMetrics.$inferSelect;
export type InsertPredictiveMetric = typeof predictiveMetrics.$inferInsert;

/**
 * Scenarios table - What-if regulatory impact simulations
 */
export const scenarios = mysqlTable("scenarios", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  scenarioType: varchar("scenarioType", { length: 100 }).notNull(), // epc_tightening, net_zero, retrofit_strategy
  parameters: text("parameters"), // JSON of scenario parameters
  results: text("results"), // JSON of scenario results
  affectedPropertiesCount: int("affectedPropertiesCount"),
  estimatedTotalCost: int("estimatedTotalCost"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Scenario = typeof scenarios.$inferSelect;
export type InsertScenario = typeof scenarios.$inferInsert;

/**
 * Compliance tasks table - Automated compliance timeline and deadlines
 */
export const complianceTasks = mysqlTable("complianceTasks", {
  id: int("id").autoincrement().primaryKey(),
  propertyId: int("propertyId").notNull().references(() => properties.id, { onDelete: "cascade" }),
  requirementId: int("requirementId").references(() => complianceRequirements.id),
  taskName: varchar("taskName", { length: 255 }).notNull(),
  description: text("description"),
  dueDate: timestamp("dueDate").notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high", "critical"]).default("medium"),
  status: mysqlEnum("status", ["pending", "in_progress", "completed", "overdue"]).default("pending"),
  isOnCriticalPath: int("isOnCriticalPath").default(0), // 1 = yes, 0 = no
  dependsOnTaskId: int("dependsOnTaskId"),
  completedDate: timestamp("completedDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ComplianceTask = typeof complianceTasks.$inferSelect;
export type InsertComplianceTask = typeof complianceTasks.$inferInsert;

/**
 * Tenant communications table - Communication history and templates
 */
export const tenantCommunications = mysqlTable("tenantCommunications", {
  id: int("id").autoincrement().primaryKey(),
  propertyId: int("propertyId").notNull().references(() => properties.id, { onDelete: "cascade" }),
  communicationType: varchar("communicationType", { length: 100 }).notNull(), // compliance_notice, retrofit_update, epc_alert
  subject: varchar("subject", { length: 255 }).notNull(),
  content: text("content"),
  templateName: varchar("templateName", { length: 100 }),
  recipientCount: int("recipientCount"),
  sentDate: timestamp("sentDate"),
  status: mysqlEnum("status", ["draft", "sent", "scheduled"]).default("draft"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TenantCommunication = typeof tenantCommunications.$inferSelect;
export type InsertTenantCommunication = typeof tenantCommunications.$inferInsert;

/**
 * Market benchmarks table - Anonymized peer comparison data
 */
export const marketBenchmarks = mysqlTable("marketBenchmarks", {
  id: int("id").autoincrement().primaryKey(),
  region: varchar("region", { length: 100 }).notNull(), // London, Manchester, etc.
  propertyType: varchar("propertyType", { length: 50 }).notNull(),
  averageEpcRating: varchar("averageEpcRating", { length: 1 }),
  complianceRate: int("complianceRate"), // percentage
  averageRetrofitCost: int("averageRetrofitCost"),
  averageCapexPerProperty: int("averageCapexPerProperty"),
  medianRiskScore: int("medianRiskScore"),
  nonLettablePercentage: int("nonLettablePercentage"),
  dataPoints: int("dataPoints"), // number of properties in benchmark
  lastUpdated: timestamp("lastUpdated"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MarketBenchmark = typeof marketBenchmarks.$inferSelect;
export type InsertMarketBenchmark = typeof marketBenchmarks.$inferInsert;

/**
 * Share links table - Temporary public access links
 */
export const shareLinks = mysqlTable("shareLinks", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: varchar("token", { length: 64 }).notNull().unique(),
  expiresAt: timestamp("expiresAt").notNull(),
  accessType: mysqlEnum("accessType", ["dashboard", "specific_property", "report"]).default("dashboard"),
  propertyId: int("propertyId").references(() => properties.id, { onDelete: "cascade" }),
  viewCount: int("viewCount").default(0),
  lastAccessedAt: timestamp("lastAccessedAt"),
  isRevoked: int("isRevoked").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ShareLink = typeof shareLinks.$inferSelect;
export type InsertShareLink = typeof shareLinks.$inferInsert;

/**
 * Early Access signups - public form submissions
 */
export const earlyAccess = mysqlTable("earlyAccess", {
  id: int("id").autoincrement().primaryKey(),
  fullName: varchar("fullName", { length: 255 }).notNull(),
  workEmail: varchar("workEmail", { length: 320 }).notNull(),
  companyName: varchar("companyName", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 }).notNull(), // lender, debt_fund, investor, asset_manager, broker, other
  portfolioSize: varchar("portfolioSize", { length: 50 }).notNull(), // 1-50, 50-200, 200-500, 500+, individual_deals
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EarlyAccess = typeof earlyAccess.$inferSelect;
export type InsertEarlyAccess = typeof earlyAccess.$inferInsert;

var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/epcApi.ts
var epcApi_exports = {};
__export(epcApi_exports, {
  lookupEPCByAddress: () => lookupEPCByAddress,
  lookupEPCByPostcode: () => lookupEPCByPostcode,
  lookupEPCByPostcodeNonDomestic: () => lookupEPCByPostcodeNonDomestic
});
function formatPostcode(postcode) {
  const clean = postcode.replace(/\s+/g, "").toUpperCase();
  if (clean.length > 3) {
    return clean.slice(0, -3) + " " + clean.slice(-3);
  }
  return clean;
}
async function searchByPostcode(postcode) {
  const formatted = formatPostcode(postcode);
  const url = `https://find-energy-certificate.service.gov.uk/find-a-certificate/search-by-postcode?postcode=${encodeURIComponent(formatted)}`;
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; Veridia/1.0)",
        Accept: "text/html"
      }
    });
    if (!response.ok) {
      console.log(`EPC search returned ${response.status} for ${formatted}`);
      return [];
    }
    const html = await response.text();
    if (html.includes("No results for") || html.includes("There are no results")) {
      return [];
    }
    const results = [];
    const rowRegex = /<a[^>]*href="(\/energy-certificate\/[^"]+)"[^>]*>\s*([\s\S]*?)\s*<\/a>[\s\S]*?<td[^>]*>\s*([A-G])\s*<\/td>[\s\S]*?<td[^>]*[^>]*>\s*(?:<span>)?\s*([^<]+?)\s*(?:<\/span>)?\s*<\/td>/gi;
    let match;
    while ((match = rowRegex.exec(html)) !== null) {
      results.push({
        certificateUrl: `https://find-energy-certificate.service.gov.uk${match[1].trim()}`,
        address: match[2].replace(/\s+/g, " ").trim(),
        epcRating: match[3].trim(),
        validUntil: match[4].replace(/\s+/g, " ").trim()
      });
    }
    if (results.length === 0) {
      const linkRegex = /<a[^>]*href="(\/energy-certificate\/[^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
      let linkMatch;
      while ((linkMatch = linkRegex.exec(html)) !== null) {
        const address = linkMatch[2].replace(/\s+/g, " ").trim();
        if (address && !address.includes("energy certificate")) {
          results.push({
            certificateUrl: `https://find-energy-certificate.service.gov.uk${linkMatch[1].trim()}`,
            address,
            epcRating: "Unknown",
            validUntil: ""
          });
        }
      }
    }
    return results;
  } catch (error) {
    console.error("EPC search error:", error);
    return [];
  }
}
async function fetchCertificateDetails(certUrl, searchResult) {
  try {
    const response = await fetch(certUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; Veridia/1.0)",
        Accept: "text/html"
      }
    });
    if (!response.ok) {
      return createBasicCertificate(searchResult);
    }
    const html = await response.text();
    return parseCertificateHtml(html, searchResult);
  } catch (error) {
    console.error("Certificate fetch error:", error);
    return createBasicCertificate(searchResult);
  }
}
function parseCertificateHtml(html, searchResult) {
  const certNumMatch = html.match(/Certificate number[\s\S]*?<[^>]*>([0-9\-]+)<\/[^>]*>/i);
  const certificateNumber = certNumMatch ? certNumMatch[1].trim() : "";
  const ratingMatch = html.match(/energy rating is ([A-G])/i);
  const scoreMatch = html.match(/with a score of (\d+)/i);
  const currentRating = ratingMatch ? ratingMatch[1] : searchResult.epcRating;
  const currentScore = scoreMatch ? parseInt(scoreMatch[1]) : ratingToScore(searchResult.epcRating);
  const potentialRatingMatch = html.match(/potential to be ([A-G])/i);
  const potentialScoreMatch = html.match(/potential energy rating of [A-G] with a score of (\d+)/i);
  const potentialRating = potentialRatingMatch ? potentialRatingMatch[1] : improvePotentialRating(currentRating);
  const potentialScore = potentialScoreMatch ? parseInt(potentialScoreMatch[1]) : ratingToScore(potentialRating);
  const propTypeMatch = html.match(/Property type[\s\S]*?<dd[^>]*>\s*([^<]+?)\s*<\/dd>/i);
  const propertyType = propTypeMatch ? propTypeMatch[1].trim() : "Unknown";
  const floorAreaMatch = html.match(/(\d+)\s*square\s*metres/i);
  const floorArea = floorAreaMatch ? parseInt(floorAreaMatch[1]) : 0;
  const costMatch = html.match(/spend\s*<[^>]*>£([\d,]+)\s*per year/i);
  const energyCostsAnnual = costMatch ? parseInt(costMatch[1].replace(/,/g, "")) : estimateEnergyCost(currentRating, floorArea);
  const savingsMatch = html.match(/save £([\d,]+) per year/i);
  const co2Match = html.match(/This property produces[\s\S]*?([\d.]+)\s*tonnes/i);
  const co2Emissions = co2Match ? parseFloat(co2Match[1]) : estimateCO2(currentRating, floorArea);
  const validMatch = html.match(/Valid until[\s\S]*?<[^>]*>([^<]+)<\/[^>]*>/i);
  const expiryDate = validMatch ? validMatch[1].trim() : searchResult.validUntil;
  const wallMatch = html.match(/wall[s]?\s*(?:insulation)?[\s\S]*?<td[^>]*>([^<]*(?:brick|stone|cavity|solid|timber|insul)[^<]*)<\/td>/i);
  const roofMatch = html.match(/roof[\s\S]*?<td[^>]*>([^<]*(?:roof|loft|insul|slate|tile)[^<]*)<\/td>/i);
  const windowMatch = html.match(/((?:single|double|triple)\s*glaz[^<]*)/i);
  const heatingMatch = html.match(/((?:boiler|heat pump|electric|gas|oil)[^<]*(?:radiator|underfloor|warm air)?[^<]*)/i);
  const recommendations = parseRecommendations(html);
  let totalUpgradeCost = 0;
  for (const rec of recommendations) {
    const costParts = rec.indicativeCost.match(/£([\d,]+)/g);
    if (costParts && costParts.length > 0) {
      const lastCost = costParts[costParts.length - 1];
      totalUpgradeCost += parseInt(lastCost.replace(/[£,]/g, "")) || 0;
    }
  }
  if (totalUpgradeCost === 0) {
    totalUpgradeCost = estimateUpgradeCost(currentRating);
  }
  const postcodeMatch = searchResult.address.match(/[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}/i);
  const postcode = postcodeMatch ? postcodeMatch[0] : "";
  return {
    address: searchResult.address,
    postcode,
    epcRating: currentRating,
    epcScore: currentScore,
    potentialRating,
    potentialScore,
    propertyType,
    builtForm: propertyType,
    floorArea,
    energyCostsAnnual,
    co2Emissions,
    certificateNumber,
    inspectionDate: "",
    expiryDate,
    recommendations,
    totalUpgradeCost,
    wallDescription: wallMatch ? wallMatch[1].trim() : "",
    roofDescription: roofMatch ? roofMatch[1].trim() : "",
    windowDescription: windowMatch ? windowMatch[1].trim() : "",
    heatingDescription: heatingMatch ? heatingMatch[1].trim() : "",
    hotWaterDescription: ""
  };
}
function parseRecommendations(html) {
  const recommendations = [];
  const stepRegex = /Step \d+:\s*([^<]+)<\/h3>[\s\S]*?Typical installation cost[\s\S]*?<dd[^>]*>\s*(£[\d,]+\s*-\s*£[\d,]+)\s*<\/dd>[\s\S]*?Typical yearly saving[\s\S]*?<dd[^>]*>\s*(£[\d,]+)\s*<\/dd>/gi;
  let match;
  while ((match = stepRegex.exec(html)) !== null) {
    recommendations.push({
      improvement: match[1].trim(),
      indicativeCost: match[2].trim(),
      typicalSaving: match[3].trim()
    });
  }
  return recommendations;
}
function ratingToScore(rating) {
  const scores = {
    A: 95,
    B: 85,
    C: 74,
    D: 60,
    E: 46,
    F: 30,
    G: 10
  };
  return scores[rating] || 50;
}
function improvePotentialRating(currentRating) {
  const improvement = {
    A: "A",
    B: "A",
    C: "B",
    D: "C",
    E: "C",
    F: "D",
    G: "E"
  };
  return improvement[currentRating] || "C";
}
function estimateEnergyCost(rating, floorArea) {
  const area = floorArea || 80;
  const costPerSqm = {
    A: 5,
    B: 7,
    C: 10,
    D: 13,
    E: 17,
    F: 22,
    G: 28
  };
  return Math.round((costPerSqm[rating] || 13) * area);
}
function estimateCO2(rating, floorArea) {
  const area = floorArea || 80;
  const co2PerSqm = {
    A: 0.01,
    B: 0.02,
    C: 0.03,
    D: 0.05,
    E: 0.07,
    F: 0.09,
    G: 0.12
  };
  return Math.round((co2PerSqm[rating] || 0.05) * area * 10) / 10;
}
function estimateUpgradeCost(currentRating) {
  const costEstimates = {
    A: 0,
    B: 2e3,
    C: 5e3,
    D: 12e3,
    E: 25e3,
    F: 4e4,
    G: 6e4
  };
  return costEstimates[currentRating] || 15e3;
}
function createBasicCertificate(searchResult) {
  const rating = searchResult.epcRating || "D";
  const score = ratingToScore(rating);
  const potentialRating = improvePotentialRating(rating);
  return {
    address: searchResult.address,
    postcode: "",
    epcRating: rating,
    epcScore: score,
    potentialRating,
    potentialScore: ratingToScore(potentialRating),
    propertyType: "Unknown",
    builtForm: "Unknown",
    floorArea: 0,
    energyCostsAnnual: estimateEnergyCost(rating, 80),
    co2Emissions: estimateCO2(rating, 80),
    certificateNumber: "",
    inspectionDate: "",
    expiryDate: searchResult.validUntil,
    recommendations: [],
    totalUpgradeCost: estimateUpgradeCost(rating),
    wallDescription: "",
    roofDescription: "",
    windowDescription: "",
    heatingDescription: "",
    hotWaterDescription: ""
  };
}
function normalizeAddress(address) {
  return address.toLowerCase().replace(/[,.\-\/\\]/g, " ").replace(/\b(flat|apartment|apt|unit|floor|suite)\b/gi, "").replace(/\s+/g, " ").trim();
}
function addressSimilarity(a, b) {
  const wordsA = new Set(a.split(" ").filter((w) => w.length > 1));
  const wordsB = new Set(b.split(" ").filter((w) => w.length > 1));
  if (wordsA.size === 0 || wordsB.size === 0) return 0;
  let matches = 0;
  Array.from(wordsA).forEach((word) => {
    if (wordsB.has(word)) matches++;
  });
  return matches / Math.max(wordsA.size, wordsB.size);
}
async function lookupEPCByPostcodeNonDomestic(postcode) {
  try {
    const clean = postcode.replace(/\s+/g, "").toUpperCase();
    const formatted = clean.slice(0, -3) + " " + clean.slice(-3);
    const token = process.env.EPC_BEARER_TOKEN || "";
    const response = await fetch(
      `https://api.get-energy-performance-data.communities.gov.uk/api/non-domestic/search?postcode=${encodeURIComponent(formatted)}`,
      {
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        }
      }
    );
    if (!response.ok) {
      console.log("Non-domestic EPC API error:", response.status);
      return [];
    }
    const data = await response.json();
    const rows = data.data || [];
    return rows.map((row) => ({
      address: row.addressLine1 || "",
      postcode: formatted,
      epcRating: row.currentEnergyEfficiencyBand || "Unknown",
      epcScore: 0,
      potentialRating: row.currentEnergyEfficiencyBand || "Unknown",
      potentialScore: 0,
      propertyType: "Commercial",
      builtForm: "Commercial",
      floorArea: 0,
      energyCostsAnnual: 0,
      co2Emissions: 0,
      certificateNumber: row.certificateNumber || "",
      inspectionDate: row.registrationDate || "",
      expiryDate: "",
      recommendations: [],
      totalUpgradeCost: 0,
      wallDescription: "",
      roofDescription: "",
      windowDescription: "",
      heatingDescription: "",
      hotWaterDescription: ""
    }));
  } catch (error) {
    console.error("Non-domestic EPC lookup error:", error);
    return [];
  }
}
async function lookupEPCByPostcode(postcode) {
  try {
    const searchResults = await searchByPostcode(postcode);
    if (searchResults.length === 0) {
      console.log(`No EPC results found for postcode: ${postcode}`);
      return [];
    }
    const limitedResults = searchResults.slice(0, 20);
    const certificates = [];
    for (const result of limitedResults) {
      const cert = await fetchCertificateDetails(result.certificateUrl, result);
      certificates.push(cert);
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
    return certificates;
  } catch (error) {
    console.error("EPC lookup error:", error);
    return [];
  }
}
async function lookupEPCByAddress(postcode, addressQuery) {
  const certificates = await lookupEPCByPostcode(postcode);
  if (certificates.length === 0) return null;
  const normalizedQuery = normalizeAddress(addressQuery);
  let bestMatch = null;
  let bestScore = 0;
  for (const cert of certificates) {
    const normalizedCert = normalizeAddress(cert.address);
    const score = addressSimilarity(normalizedQuery, normalizedCert);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = cert;
    }
  }
  if (bestScore > 0.3 && bestMatch) {
    return bestMatch;
  }
  return certificates[0] || null;
}
var init_epcApi = __esm({
  "server/epcApi.ts"() {
    "use strict";
  }
});

// server/_core/index.ts
import "dotenv/config";
import express2 from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

// shared/const.ts
var COOKIE_NAME = "app_session_id";
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var AXIOS_TIMEOUT_MS = 3e4;
var UNAUTHED_ERR_MSG = "Please login (10001)";
var NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";

// server/db.ts
import { drizzle } from "drizzle-orm/mysql2";
import { eq, inArray, desc, and } from "drizzle-orm";

// drizzle/schema.ts
import { bigint, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";
var users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull()
});
var properties = mysqlTable("properties", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  address: text("address").notNull(),
  postcode: varchar("postcode", { length: 20 }),
  propertyType: varchar("propertyType", { length: 50 }).notNull(),
  // residential, commercial, mixed
  units: int("units").default(1),
  // number of units
  ownershipType: varchar("ownershipType", { length: 50 }).default("owned"),
  // owned, leasehold, freehold, investment
  yearBuilt: int("yearBuilt"),
  floorArea: int("floorArea"),
  // in sqm
  storeys: int("storeys"),
  // building height
  // EPC data (from government API)
  epcRating: varchar("epcRating", { length: 1 }),
  // A-G
  epcScore: int("epcScore"),
  // 0-100 (SAP score)
  epcDate: varchar("epcDate", { length: 20 }),
  // date of last EPC assessment
  epcExpiry: varchar("epcExpiry", { length: 20 }),
  // EPC expiry date
  epcCertificateNumber: varchar("epcCertificateNumber", { length: 50 }),
  energyCostsAnnual: int("energyCostsAnnual"),
  // estimated annual energy cost GBP
  co2Emissions: int("co2Emissions"),
  // tonnes per year
  epcRecommendations: text("epcRecommendations"),
  // JSON of improvement recommendations
  // Risk scoring
  riskScore: int("riskScore").default(0),
  // 0-100 regulatory risk
  riskLevel: mysqlEnum("riskLevel", ["low", "medium", "high"]).default("low"),
  riskBand: varchar("riskBand", { length: 20 }).default("low"),
  // low, moderate, high, critical
  complianceStatus: mysqlEnum("complianceStatus", ["compliant", "at_risk", "non_compliant"]).default("compliant"),
  lettable: int("lettable").default(1),
  // boolean: 1 = lettable, 0 = non-lettable
  meesCompliant: int("meesCompliant").default(1),
  // MEES compliance status
  buildingSafetyAct: int("buildingSafetyAct").default(0),
  // subject to Building Safety Act
  // Forecasting
  forecast6m: text("forecast6m"),
  // 6-month compliance forecast
  forecast12m: text("forecast12m"),
  // 12-month forecast
  forecast24m: text("forecast24m"),
  // 24-month forecast
  yearsToDeadline: int("yearsToDeadline"),
  // years until EPC C deadline
  // Capex
  estimatedRetrofitCost: int("estimatedRetrofitCost"),
  // in GBP
  capexPriority: int("capexPriority"),
  // 1-10 priority ranking
  estimatedPaybackYears: int("estimatedPaybackYears"),
  // Flood Risk (from Environment Agency)
  floodRiskZone: varchar("floodRiskZone", { length: 50 }),
  // Zone 1, Zone 2, Zone 3a, Zone 3b
  floodRiskLevel: varchar("floodRiskLevel", { length: 20 }),
  // very_low, low, medium, high
  floodRiskSource: varchar("floodRiskSource", { length: 100 }),
  // rivers_sea, surface_water, groundwater
  floodRiskLastChecked: timestamp("floodRiskLastChecked"),
  // Land Registry
  landRegistryTitle: varchar("landRegistryTitle", { length: 50 }),
  // title number
  tenureType: varchar("tenureType", { length: 30 }),
  // freehold, leasehold
  registeredOwner: varchar("registeredOwner", { length: 255 }),
  lastSalePrice: bigint("lastSalePrice", { mode: "number" }),
  // in GBP
  lastSaleDate: varchar("lastSaleDate", { length: 20 }),
  // Planning
  planningZone: varchar("planningZone", { length: 100 }),
  // conservation_area, listed_building, etc.
  nearbyPlanningApps: int("nearbyPlanningApps"),
  // count of nearby planning applications
  planningConstraints: text("planningConstraints"),
  // JSON array of constraints
  localAuthority: varchar("localAuthority", { length: 100 }),
  // Metadata
  epcDataSource: varchar("epcDataSource", { length: 50 }).default("manual"),
  // manual, api, imported
  lastEpcLookup: timestamp("lastEpcLookup"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var complianceRequirements = mysqlTable("complianceRequirements", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  regulationType: varchar("regulationType", { length: 100 }).notNull(),
  // EPC, Building Safety Act, Fire Safety, Net Zero, etc.
  description: text("description"),
  deadline: timestamp("deadline"),
  severity: mysqlEnum("severity", ["low", "medium", "high", "critical"]).default("medium"),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var complianceViolations = mysqlTable("complianceViolations", {
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
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var capexItems = mysqlTable("capexItems", {
  id: int("id").autoincrement().primaryKey(),
  propertyId: int("propertyId").notNull().references(() => properties.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }).notNull(),
  // retrofit, fire safety, energy efficiency, etc.
  estimatedCost: int("estimatedCost").notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high", "critical"]).default("medium"),
  timeline: varchar("timeline", { length: 50 }),
  // e.g., "Q2 2025", "2025-2027"
  roi: int("roi"),
  // return on investment percentage
  status: mysqlEnum("status", ["planned", "in_progress", "completed"]).default("planned"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var regulatoryForecasts = mysqlTable("regulatoryForecasts", {
  id: int("id").autoincrement().primaryKey(),
  propertyId: int("propertyId").notNull().references(() => properties.id, { onDelete: "cascade" }),
  forecastType: varchar("forecastType", { length: 100 }).notNull(),
  // EPC tightening, Net Zero deadline, etc.
  impactDescription: text("impactDescription"),
  affectedYear: int("affectedYear"),
  likelihood: mysqlEnum("likelihood", ["low", "medium", "high", "certain"]).default("medium"),
  estimatedImpactCost: int("estimatedImpactCost"),
  willBecomeLettable: int("willBecomeLettable"),
  // 1 = yes, 0 = no
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var auditLogs = mysqlTable("auditLogs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  entityType: varchar("entityType", { length: 50 }).notNull(),
  // property, violation, capex, etc.
  entityId: int("entityId").notNull(),
  action: varchar("action", { length: 50 }).notNull(),
  // create, update, delete
  changes: text("changes"),
  // JSON of what changed
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var predictiveMetrics = mysqlTable("predictiveMetrics", {
  id: int("id").autoincrement().primaryKey(),
  propertyId: int("propertyId").notNull().references(() => properties.id, { onDelete: "cascade" }),
  aiRiskScore: int("aiRiskScore"),
  // 0-100 AI-calculated risk
  predictedNonLettableDate: timestamp("predictedNonLettableDate"),
  // When property will become non-lettable
  retrofitUrgency: mysqlEnum("retrofitUrgency", ["low", "medium", "high", "critical"]).default("medium"),
  recommendedRetrofitYear: int("recommendedRetrofitYear"),
  estimatedComplianceCost: int("estimatedComplianceCost"),
  riskTrend: varchar("riskTrend", { length: 20 }),
  // improving, stable, worsening
  lastCalculated: timestamp("lastCalculated"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var scenarios = mysqlTable("scenarios", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  scenarioType: varchar("scenarioType", { length: 100 }).notNull(),
  // epc_tightening, net_zero, retrofit_strategy
  parameters: text("parameters"),
  // JSON of scenario parameters
  results: text("results"),
  // JSON of scenario results
  affectedPropertiesCount: int("affectedPropertiesCount"),
  estimatedTotalCost: int("estimatedTotalCost"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var complianceTasks = mysqlTable("complianceTasks", {
  id: int("id").autoincrement().primaryKey(),
  propertyId: int("propertyId").notNull().references(() => properties.id, { onDelete: "cascade" }),
  requirementId: int("requirementId").references(() => complianceRequirements.id),
  taskName: varchar("taskName", { length: 255 }).notNull(),
  description: text("description"),
  dueDate: timestamp("dueDate").notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high", "critical"]).default("medium"),
  status: mysqlEnum("status", ["pending", "in_progress", "completed", "overdue"]).default("pending"),
  isOnCriticalPath: int("isOnCriticalPath").default(0),
  // 1 = yes, 0 = no
  dependsOnTaskId: int("dependsOnTaskId"),
  completedDate: timestamp("completedDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var tenantCommunications = mysqlTable("tenantCommunications", {
  id: int("id").autoincrement().primaryKey(),
  propertyId: int("propertyId").notNull().references(() => properties.id, { onDelete: "cascade" }),
  communicationType: varchar("communicationType", { length: 100 }).notNull(),
  // compliance_notice, retrofit_update, epc_alert
  subject: varchar("subject", { length: 255 }).notNull(),
  content: text("content"),
  templateName: varchar("templateName", { length: 100 }),
  recipientCount: int("recipientCount"),
  sentDate: timestamp("sentDate"),
  status: mysqlEnum("status", ["draft", "sent", "scheduled"]).default("draft"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var marketBenchmarks = mysqlTable("marketBenchmarks", {
  id: int("id").autoincrement().primaryKey(),
  region: varchar("region", { length: 100 }).notNull(),
  // London, Manchester, etc.
  propertyType: varchar("propertyType", { length: 50 }).notNull(),
  averageEpcRating: varchar("averageEpcRating", { length: 1 }),
  complianceRate: int("complianceRate"),
  // percentage
  averageRetrofitCost: int("averageRetrofitCost"),
  averageCapexPerProperty: int("averageCapexPerProperty"),
  medianRiskScore: int("medianRiskScore"),
  nonLettablePercentage: int("nonLettablePercentage"),
  dataPoints: int("dataPoints"),
  // number of properties in benchmark
  lastUpdated: timestamp("lastUpdated"),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var shareLinks = mysqlTable("shareLinks", {
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
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var earlyAccess = mysqlTable("earlyAccess", {
  id: int("id").autoincrement().primaryKey(),
  fullName: varchar("fullName", { length: 255 }).notNull(),
  workEmail: varchar("workEmail", { length: 320 }).notNull(),
  companyName: varchar("companyName", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 }).notNull(),
  // lender, debt_fund, investor, asset_manager, broker, other
  portfolioSize: varchar("portfolioSize", { length: 50 }).notNull(),
  // 1-50, 50-200, 200-500, 500+, individual_deals
  createdAt: timestamp("createdAt").defaultNow().notNull()
});

// server/_core/env.ts
var ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? ""
};

// server/db.ts
var _db = null;
async function getDb() {
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
async function upsertUser(user) {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }
  try {
    const values = {
      openId: user.openId
    };
    const updateSet = {};
    const textFields = ["name", "email", "loginMethod"];
    const assignNullable = (field) => {
      const value = user[field];
      if (value === void 0) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== void 0) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== void 0) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }
    if (!values.lastSignedIn) {
      values.lastSignedIn = /* @__PURE__ */ new Date();
    }
    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = /* @__PURE__ */ new Date();
    }
    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}
async function getUserByOpenId(openId) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return void 0;
  }
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function getUserProperties(userId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(properties).where(eq(properties.userId, userId));
}
async function getPropertyById(id) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(properties).where(eq(properties.id, id)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function getPropertyViolations(propertyId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(complianceViolations).where(eq(complianceViolations.propertyId, propertyId));
}
async function getPortfolioRiskSummary(userId) {
  const db = await getDb();
  if (!db) return null;
  const props = await db.select().from(properties).where(eq(properties.userId, userId));
  const total = props.length;
  const highRisk = props.filter((p) => p.riskLevel === "high").length;
  const mediumRisk = props.filter((p) => p.riskLevel === "medium").length;
  const lowRisk = props.filter((p) => p.riskLevel === "low").length;
  const nonLettable = props.filter((p) => !p.lettable).length;
  const totalRetrofitCost = props.reduce((sum, p) => sum + (p.estimatedRetrofitCost || 0), 0);
  return {
    total,
    highRisk,
    mediumRisk,
    lowRisk,
    nonLettable,
    totalRetrofitCost,
    compliancePercentage: total > 0 ? Math.round((total - nonLettable) / total * 100) : 100
  };
}
async function getPropertyCapexItems(propertyId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(capexItems).where(eq(capexItems.propertyId, propertyId));
}
async function getPortfolioCapexSummary(userId) {
  const db = await getDb();
  if (!db) return null;
  const props = await db.select().from(properties).where(eq(properties.userId, userId));
  const propIds = props.map((p) => p.id);
  if (propIds.length === 0) {
    return { totalCapex: 0, plannedCapex: 0, completedCapex: 0, inProgressCapex: 0 };
  }
  const capex = await db.select().from(capexItems).where(
    inArray(capexItems.propertyId, propIds)
  );
  const totalCapex = capex.reduce((sum, item) => sum + item.estimatedCost, 0);
  const plannedCapex = capex.filter((c) => c.status === "planned").reduce((sum, c) => sum + c.estimatedCost, 0);
  const inProgressCapex = capex.filter((c) => c.status === "in_progress").reduce((sum, c) => sum + c.estimatedCost, 0);
  const completedCapex = capex.filter((c) => c.status === "completed").reduce((sum, c) => sum + c.estimatedCost, 0);
  return { totalCapex, plannedCapex, inProgressCapex, completedCapex };
}
async function getPropertyForecasts(propertyId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(regulatoryForecasts).where(eq(regulatoryForecasts.propertyId, propertyId));
}
async function getPredictiveMetrics(propertyId) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(predictiveMetrics).where(eq(predictiveMetrics.propertyId, propertyId)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function getUserScenarios(userId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(scenarios).where(eq(scenarios.userId, userId)).orderBy(desc(scenarios.createdAt));
}
async function getPropertyComplianceTasks(propertyId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(complianceTasks).where(eq(complianceTasks.propertyId, propertyId)).orderBy(complianceTasks.dueDate);
}
async function getPropertyCommunications(propertyId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tenantCommunications).where(eq(tenantCommunications.propertyId, propertyId)).orderBy(desc(tenantCommunications.createdAt));
}
async function getMarketBenchmark(region, propertyType) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(marketBenchmarks).where(
    and(eq(marketBenchmarks.region, region), eq(marketBenchmarks.propertyType, propertyType))
  ).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function createShareLink(userId, expiresAt, accessType, propertyId) {
  const db = await getDb();
  if (!db) return void 0;
  const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  const result = await db.insert(shareLinks).values({
    userId,
    token,
    expiresAt,
    accessType,
    propertyId
  });
  return token;
}
async function getShareLinkByToken(token) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(shareLinks).where(
    and(eq(shareLinks.token, token), eq(shareLinks.isRevoked, 0))
  ).limit(1);
  if (result.length === 0) return void 0;
  const link = result[0];
  if (/* @__PURE__ */ new Date() > link.expiresAt) return void 0;
  return link;
}
async function updateShareLinkAccess(token) {
  const db = await getDb();
  if (!db) return;
  const result = await db.select().from(shareLinks).where(eq(shareLinks.token, token)).limit(1);
  if (result.length === 0) return;
  const link = result[0];
  await db.update(shareLinks).set({
    viewCount: (link.viewCount || 0) + 1,
    lastAccessedAt: /* @__PURE__ */ new Date()
  }).where(eq(shareLinks.token, token));
}
async function getUserShareLinks(userId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(shareLinks).where(eq(shareLinks.userId, userId)).orderBy(desc(shareLinks.createdAt));
}
async function revokeShareLink(token) {
  const db = await getDb();
  if (!db) return;
  await db.update(shareLinks).set({ isRevoked: 1 }).where(eq(shareLinks.token, token));
}
async function createProperty(userId, data) {
  const db = await getDb();
  if (!db) return void 0;
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
    lettable: data.lettable !== void 0 ? data.lettable ? 1 : 0 : 1,
    meesCompliant: data.meesCompliant !== void 0 ? data.meesCompliant ? 1 : 0 : 1,
    buildingSafetyAct: data.buildingSafetyAct !== void 0 ? data.buildingSafetyAct ? 1 : 0 : 0,
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
    notes: data.notes
  });
  return result;
}
async function updateProperty(propertyId, data) {
  const db = await getDb();
  if (!db) return void 0;
  const updateData = {};
  const fields = [
    "name",
    "address",
    "postcode",
    "propertyType",
    "units",
    "ownershipType",
    "yearBuilt",
    "floorArea",
    "storeys",
    "epcRating",
    "epcScore",
    "epcDate",
    "epcExpiry",
    "epcCertificateNumber",
    "energyCostsAnnual",
    "co2Emissions",
    "epcRecommendations",
    "riskScore",
    "riskLevel",
    "riskBand",
    "complianceStatus",
    "lettable",
    "meesCompliant",
    "buildingSafetyAct",
    "forecast6m",
    "forecast12m",
    "forecast24m",
    "yearsToDeadline",
    "estimatedRetrofitCost",
    "capexPriority",
    "estimatedPaybackYears",
    "epcDataSource",
    "lastEpcLookup",
    "notes"
  ];
  for (const field of fields) {
    if (data[field] !== void 0) {
      if (field === "epcRecommendations" && typeof data[field] === "object") {
        updateData[field] = JSON.stringify(data[field]);
      } else {
        updateData[field] = data[field];
      }
    }
  }
  const result = await db.update(properties).set(updateData).where(eq(properties.id, propertyId));
  return result;
}
async function deleteProperty(propertyId) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.delete(properties).where(eq(properties.id, propertyId));
  return result;
}
async function createEarlyAccessSignup(data) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.insert(earlyAccess).values({
    fullName: data.fullName,
    workEmail: data.workEmail,
    companyName: data.companyName,
    role: data.role,
    portfolioSize: data.portfolioSize
  });
  return { success: true };
}

// server/_core/cookies.ts
function isSecureRequest(req) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto) ? forwardedProto : forwardedProto.split(",");
  return protoList.some((proto) => proto.trim().toLowerCase() === "https");
}
function getSessionCookieOptions(req) {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: isSecureRequest(req)
  };
}

// shared/_core/errors.ts
var HttpError = class extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "HttpError";
  }
};
var ForbiddenError = (msg) => new HttpError(403, msg);

// server/_core/sdk.ts
import axios from "axios";
import { parse as parseCookieHeader } from "cookie";
import { SignJWT, jwtVerify } from "jose";
var isNonEmptyString = (value) => typeof value === "string" && value.length > 0;
var EXCHANGE_TOKEN_PATH = `/webdev.v1.WebDevAuthPublicService/ExchangeToken`;
var GET_USER_INFO_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfo`;
var GET_USER_INFO_WITH_JWT_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfoWithJwt`;
var OAuthService = class {
  constructor(client) {
    this.client = client;
    console.log("[OAuth] Initialized with baseURL:", ENV.oAuthServerUrl);
    if (!ENV.oAuthServerUrl) {
      console.error(
        "[OAuth] ERROR: OAUTH_SERVER_URL is not configured! Set OAUTH_SERVER_URL environment variable."
      );
    }
  }
  decodeState(state) {
    const redirectUri = atob(state);
    return redirectUri;
  }
  async getTokenByCode(code, state) {
    const payload = {
      clientId: ENV.appId,
      grantType: "authorization_code",
      code,
      redirectUri: this.decodeState(state)
    };
    const { data } = await this.client.post(
      EXCHANGE_TOKEN_PATH,
      payload
    );
    return data;
  }
  async getUserInfoByToken(token) {
    const { data } = await this.client.post(
      GET_USER_INFO_PATH,
      {
        accessToken: token.accessToken
      }
    );
    return data;
  }
};
var createOAuthHttpClient = () => axios.create({
  baseURL: ENV.oAuthServerUrl,
  timeout: AXIOS_TIMEOUT_MS
});
var SDKServer = class {
  client;
  oauthService;
  constructor(client = createOAuthHttpClient()) {
    this.client = client;
    this.oauthService = new OAuthService(this.client);
  }
  deriveLoginMethod(platforms, fallback) {
    if (fallback && fallback.length > 0) return fallback;
    if (!Array.isArray(platforms) || platforms.length === 0) return null;
    const set = new Set(
      platforms.filter((p) => typeof p === "string")
    );
    if (set.has("REGISTERED_PLATFORM_EMAIL")) return "email";
    if (set.has("REGISTERED_PLATFORM_GOOGLE")) return "google";
    if (set.has("REGISTERED_PLATFORM_APPLE")) return "apple";
    if (set.has("REGISTERED_PLATFORM_MICROSOFT") || set.has("REGISTERED_PLATFORM_AZURE"))
      return "microsoft";
    if (set.has("REGISTERED_PLATFORM_GITHUB")) return "github";
    const first = Array.from(set)[0];
    return first ? first.toLowerCase() : null;
  }
  /**
   * Exchange OAuth authorization code for access token
   * @example
   * const tokenResponse = await sdk.exchangeCodeForToken(code, state);
   */
  async exchangeCodeForToken(code, state) {
    return this.oauthService.getTokenByCode(code, state);
  }
  /**
   * Get user information using access token
   * @example
   * const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
   */
  async getUserInfo(accessToken) {
    const data = await this.oauthService.getUserInfoByToken({
      accessToken
    });
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  parseCookies(cookieHeader) {
    if (!cookieHeader) {
      return /* @__PURE__ */ new Map();
    }
    const parsed = parseCookieHeader(cookieHeader);
    return new Map(Object.entries(parsed));
  }
  getSessionSecret() {
    const secret = ENV.cookieSecret;
    return new TextEncoder().encode(secret);
  }
  /**
   * Create a session token for a Manus user openId
   * @example
   * const sessionToken = await sdk.createSessionToken(userInfo.openId);
   */
  async createSessionToken(openId, options = {}) {
    return this.signSession(
      {
        openId,
        appId: ENV.appId,
        name: options.name || ""
      },
      options
    );
  }
  async signSession(payload, options = {}) {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1e3);
    const secretKey = this.getSessionSecret();
    return new SignJWT({
      openId: payload.openId,
      appId: payload.appId,
      name: payload.name
    }).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setExpirationTime(expirationSeconds).sign(secretKey);
  }
  async verifySession(cookieValue) {
    if (!cookieValue) {
      console.warn("[Auth] Missing session cookie");
      return null;
    }
    try {
      const secretKey = this.getSessionSecret();
      const { payload } = await jwtVerify(cookieValue, secretKey, {
        algorithms: ["HS256"]
      });
      const { openId, appId, name } = payload;
      if (!isNonEmptyString(openId) || !isNonEmptyString(appId) || !isNonEmptyString(name)) {
        console.warn("[Auth] Session payload missing required fields");
        return null;
      }
      return {
        openId,
        appId,
        name
      };
    } catch (error) {
      console.warn("[Auth] Session verification failed", String(error));
      return null;
    }
  }
  async getUserInfoWithJwt(jwtToken) {
    const payload = {
      jwtToken,
      projectId: ENV.appId
    };
    const { data } = await this.client.post(
      GET_USER_INFO_WITH_JWT_PATH,
      payload
    );
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  async authenticateRequest(req) {
    const cookies = this.parseCookies(req.headers.cookie);
    const sessionCookie = cookies.get(COOKIE_NAME);
    const session = await this.verifySession(sessionCookie);
    if (!session) {
      throw ForbiddenError("Invalid session cookie");
    }
    const sessionUserId = session.openId;
    const signedInAt = /* @__PURE__ */ new Date();
    let user = await getUserByOpenId(sessionUserId);
    if (!user) {
      try {
        const userInfo = await this.getUserInfoWithJwt(sessionCookie ?? "");
        await upsertUser({
          openId: userInfo.openId,
          name: userInfo.name || null,
          email: userInfo.email ?? null,
          loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
          lastSignedIn: signedInAt
        });
        user = await getUserByOpenId(userInfo.openId);
      } catch (error) {
        console.error("[Auth] Failed to sync user from OAuth:", error);
        throw ForbiddenError("Failed to sync user info");
      }
    }
    if (!user) {
      throw ForbiddenError("User not found");
    }
    await upsertUser({
      openId: user.openId,
      lastSignedIn: signedInAt
    });
    return user;
  }
};
var sdk = new SDKServer();

// server/_core/oauth.ts
function getQueryParam(req, key) {
  const value = req.query[key];
  return typeof value === "string" ? value : void 0;
}
function registerOAuthRoutes(app) {
  app.get("/api/oauth/callback", async (req, res) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");
    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }
    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }
      await upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: /* @__PURE__ */ new Date()
      });
      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS
      });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}

// server/_core/systemRouter.ts
import { z } from "zod";

// server/_core/notification.ts
import { TRPCError } from "@trpc/server";
var TITLE_MAX_LENGTH = 1200;
var CONTENT_MAX_LENGTH = 2e4;
var trimValue = (value) => value.trim();
var isNonEmptyString2 = (value) => typeof value === "string" && value.trim().length > 0;
var buildEndpointUrl = (baseUrl) => {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(
    "webdevtoken.v1.WebDevService/SendNotification",
    normalizedBase
  ).toString();
};
var validatePayload = (input) => {
  if (!isNonEmptyString2(input.title)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title is required."
    });
  }
  if (!isNonEmptyString2(input.content)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification content is required."
    });
  }
  const title = trimValue(input.title);
  const content = trimValue(input.content);
  if (title.length > TITLE_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`
    });
  }
  if (content.length > CONTENT_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`
    });
  }
  return { title, content };
};
async function notifyOwner(payload) {
  const { title, content } = validatePayload(payload);
  if (!ENV.forgeApiUrl) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service URL is not configured."
    });
  }
  if (!ENV.forgeApiKey) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service API key is not configured."
    });
  }
  const endpoint = buildEndpointUrl(ENV.forgeApiUrl);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1"
      },
      body: JSON.stringify({ title, content })
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Notification] Failed to notify owner (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
      );
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[Notification] Error calling notification service:", error);
    return false;
  }
}

// server/_core/trpc.ts
import { initTRPC, TRPCError as TRPCError2 } from "@trpc/server";
import superjson from "superjson";
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError2({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var protectedProcedure = t.procedure.use(requireUser);
var adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError2({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  })
);

// server/_core/systemRouter.ts
var systemRouter = router({
  health: publicProcedure.input(
    z.object({
      timestamp: z.number().min(0, "timestamp cannot be negative")
    })
  ).query(() => ({
    ok: true
  })),
  notifyOwner: adminProcedure.input(
    z.object({
      title: z.string().min(1, "title is required"),
      content: z.string().min(1, "content is required")
    })
  ).mutation(async ({ input }) => {
    const delivered = await notifyOwner(input);
    return {
      success: delivered
    };
  })
});

// server/routers.ts
import { z as z2 } from "zod";
init_epcApi();

// server/riskScoring.ts
var EPC_C_DEADLINE = /* @__PURE__ */ new Date("2030-10-01");
var EPC_RATING_VALUES = {
  A: 92,
  B: 81,
  C: 69,
  D: 55,
  E: 39,
  F: 21,
  G: 1
};
var TARGET_RATING = "C";
var TARGET_VALUE = EPC_RATING_VALUES[TARGET_RATING];
function calculateRiskScore(input) {
  const now = /* @__PURE__ */ new Date();
  const yearsToDeadline = Math.max(0, (EPC_C_DEADLINE.getTime() - now.getTime()) / (365.25 * 24 * 60 * 60 * 1e3));
  const roundedYears = Math.round(yearsToDeadline * 10) / 10;
  const epcRating = input.epcRating?.toUpperCase() || "Unknown";
  const epcValue = EPC_RATING_VALUES[epcRating] || 0;
  const isAboveTarget = epcValue >= TARGET_VALUE;
  const meesMinValue = EPC_RATING_VALUES["E"];
  const meesCompliant = epcValue >= meesMinValue || epcRating === "Unknown";
  const buildingSafetyAct = input.storeys !== null && input.storeys >= 7 || input.units >= 21 && input.propertyType === "residential";
  let timeScore = 0;
  if (roundedYears <= 1) timeScore = 35;
  else if (roundedYears <= 2) timeScore = 30;
  else if (roundedYears <= 3) timeScore = 25;
  else if (roundedYears <= 4) timeScore = 18;
  else if (roundedYears <= 5) timeScore = 12;
  else timeScore = 5;
  let ratingScore = 0;
  if (epcRating === "Unknown") {
    ratingScore = 15;
  } else if (isAboveTarget) {
    ratingScore = 0;
  } else {
    const gap = TARGET_VALUE - epcValue;
    ratingScore = Math.min(30, Math.round(gap * 0.6));
  }
  let costScore = 0;
  const cost = input.estimatedRetrofitCost || 0;
  if (cost > 5e4) costScore = 15;
  else if (cost > 3e4) costScore = 12;
  else if (cost > 15e3) costScore = 8;
  else if (cost > 5e3) costScore = 4;
  else costScore = 0;
  let typeScore = 0;
  if (input.propertyType === "residential") typeScore = 8;
  else if (input.propertyType === "mixed") typeScore = 6;
  else typeScore = 4;
  let meesScore = meesCompliant ? 0 : 10;
  let bsaScore = buildingSafetyAct ? 5 : 0;
  let complianceBonus = isAboveTarget ? -20 : 0;
  const rawScore = timeScore + ratingScore + costScore + typeScore + meesScore + bsaScore + complianceBonus;
  const riskScore = Math.max(0, Math.min(100, rawScore));
  let riskBand;
  if (riskScore <= 25) riskBand = "low";
  else if (riskScore <= 50) riskBand = "moderate";
  else if (riskScore <= 75) riskBand = "high";
  else riskBand = "critical";
  let riskLevel;
  if (riskScore <= 33) riskLevel = "low";
  else if (riskScore <= 66) riskLevel = "medium";
  else riskLevel = "high";
  let complianceStatus;
  if (!meesCompliant) complianceStatus = "non_compliant";
  else if (isAboveTarget) complianceStatus = "compliant";
  else complianceStatus = "at_risk";
  const lettable = meesCompliant;
  const forecast6m = generateForecast(epcRating, isAboveTarget, roundedYears, 0.5);
  const forecast12m = generateForecast(epcRating, isAboveTarget, roundedYears, 1);
  const forecast24m = generateForecast(epcRating, isAboveTarget, roundedYears, 2);
  const capexPriority = Math.min(10, Math.max(1, Math.round(riskScore / 10)));
  const estimatedPaybackYears = cost > 0 ? Math.round(cost / 1500) : 0;
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
    estimatedPaybackYears
  };
}
function generateForecast(epcRating, isAboveTarget, yearsToDeadline, yearsAhead) {
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

// server/routers.ts
var appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true
      };
    })
  }),
  properties: router({
    list: protectedProcedure.query(({ ctx }) => getUserProperties(ctx.user.id)),
    byId: protectedProcedure.input(z2.object({ id: z2.number() })).query(({ input }) => getPropertyById(input.id)),
    /**
     * Create property with optional EPC auto-enrichment
     * If postcode is provided, automatically looks up EPC data and calculates risk score
     */
    create: protectedProcedure.input(z2.object({
      name: z2.string(),
      address: z2.string(),
      postcode: z2.string().optional(),
      propertyType: z2.string(),
      units: z2.number().optional(),
      ownershipType: z2.string().optional(),
      yearBuilt: z2.number().optional(),
      floorArea: z2.number().optional(),
      storeys: z2.number().optional(),
      notes: z2.string().optional(),
      // Allow manual EPC input
      epcRating: z2.string().optional(),
      // Flag to skip EPC lookup
      skipEpcLookup: z2.boolean().optional()
    })).mutation(async ({ ctx, input }) => {
      let epcData = {};
      let riskData = {};
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
              epcDataSource: "api"
            };
          }
        } catch (error) {
          console.error("EPC lookup failed:", error);
        }
      }
      const effectiveEpcRating = epcData.epcRating || input.epcRating || null;
      const riskResult = calculateRiskScore({
        epcRating: effectiveEpcRating,
        epcScore: epcData.epcScore || null,
        propertyType: input.propertyType,
        units: input.units || 1,
        storeys: input.storeys || null,
        estimatedRetrofitCost: epcData.estimatedRetrofitCost || null,
        ownershipType: input.ownershipType || "owned"
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
        estimatedPaybackYears: riskResult.estimatedPaybackYears
      };
      const propertyData = {
        ...input,
        ...epcData,
        ...riskData
      };
      const result = await createProperty(ctx.user.id, propertyData);
      return { success: true, result, epcFound: !!epcData.epcRating, riskScore: riskResult.riskScore };
    }),
    update: protectedProcedure.input(z2.object({
      id: z2.number(),
      name: z2.string().optional(),
      address: z2.string().optional(),
      postcode: z2.string().optional(),
      propertyType: z2.string().optional(),
      units: z2.number().optional(),
      ownershipType: z2.string().optional(),
      yearBuilt: z2.number().optional(),
      floorArea: z2.number().optional(),
      storeys: z2.number().optional(),
      epcRating: z2.string().optional(),
      notes: z2.string().optional(),
      estimatedRetrofitCost: z2.number().optional()
    })).mutation(({ input }) => updateProperty(input.id, input)),
    delete: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(({ input }) => deleteProperty(input.id)),
    /**
     * Look up EPC data for a postcode (returns all certificates)
     */
    lookupEPC: protectedProcedure.input(z2.object({
      postcode: z2.string(),
      address: z2.string().optional()
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
    recalculateRisk: protectedProcedure.input(z2.object({
      id: z2.number()
    })).mutation(async ({ input }) => {
      const property = await getPropertyById(input.id);
      if (!property) return { success: false, error: "Property not found" };
      const riskResult = calculateRiskScore({
        epcRating: property.epcRating,
        epcScore: property.epcScore,
        propertyType: property.propertyType,
        units: property.units || 1,
        storeys: property.storeys || null,
        estimatedRetrofitCost: property.estimatedRetrofitCost,
        ownershipType: property.ownershipType || "owned"
      });
      await updateProperty(input.id, {
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
        estimatedPaybackYears: riskResult.estimatedPaybackYears
      });
      return { success: true, riskScore: riskResult.riskScore, riskBand: riskResult.riskBand };
    }),
    /**
     * Refresh EPC data from API for an existing property
     */
    refreshEPC: protectedProcedure.input(z2.object({
      id: z2.number()
    })).mutation(async ({ input }) => {
      const property = await getPropertyById(input.id);
      if (!property || !property.postcode) return { success: false, error: "Property not found or no postcode" };
      const epcResult = await lookupEPCByAddress(property.postcode, property.address);
      if (!epcResult) return { success: false, error: "No EPC data found" };
      await updateProperty(input.id, {
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
        lastEpcLookup: /* @__PURE__ */ new Date()
      });
      const riskResult = calculateRiskScore({
        epcRating: epcResult.epcRating,
        epcScore: epcResult.epcScore,
        propertyType: property.propertyType,
        units: property.units || 1,
        storeys: property.storeys || null,
        estimatedRetrofitCost: epcResult.totalUpgradeCost,
        ownershipType: property.ownershipType || "owned"
      });
      await updateProperty(input.id, {
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
        estimatedPaybackYears: riskResult.estimatedPaybackYears
      });
      return { success: true, epcRating: epcResult.epcRating, riskScore: riskResult.riskScore };
    })
  }),
  portfolio: router({
    riskSummary: protectedProcedure.query(({ ctx }) => getPortfolioRiskSummary(ctx.user.id)),
    capexSummary: protectedProcedure.query(({ ctx }) => getPortfolioCapexSummary(ctx.user.id))
  }),
  compliance: router({
    violations: protectedProcedure.input(z2.object({ propertyId: z2.number() })).query(({ input }) => getPropertyViolations(input.propertyId)),
    tasks: protectedProcedure.input(z2.object({ propertyId: z2.number() })).query(({ input }) => getPropertyComplianceTasks(input.propertyId))
  }),
  capex: router({
    items: protectedProcedure.input(z2.object({ propertyId: z2.number() })).query(({ input }) => getPropertyCapexItems(input.propertyId))
  }),
  forecasting: router({
    forecasts: protectedProcedure.input(z2.object({ propertyId: z2.number() })).query(({ input }) => getPropertyForecasts(input.propertyId))
  }),
  analytics: router({
    predictiveMetrics: protectedProcedure.input(z2.object({ propertyId: z2.number() })).query(({ input }) => getPredictiveMetrics(input.propertyId)),
    riskScoring: protectedProcedure.query(async ({ ctx }) => {
      const props = await getUserProperties(ctx.user.id);
      if (props.length === 0) return { avgRiskScore: 0, criticalProperties: 0, trend: "stable" };
      const avgRisk = Math.round(props.reduce((sum, p) => sum + (p.riskScore || 0), 0) / props.length);
      const critical = props.filter((p) => p.riskBand === "critical" || p.riskBand === "high").length;
      return { avgRiskScore: avgRisk, criticalProperties: critical, trend: "stable" };
    })
  }),
  scenarios: router({
    list: protectedProcedure.query(({ ctx }) => getUserScenarios(ctx.user.id)),
    create: protectedProcedure.input(z2.object({
      name: z2.string(),
      description: z2.string().optional(),
      scenarioType: z2.string(),
      parameters: z2.record(z2.string(), z2.any())
    })).mutation(async ({ ctx, input }) => {
      return { id: 1, ...input, userId: ctx.user.id, createdAt: /* @__PURE__ */ new Date() };
    })
  }),
  timeline: router({
    tasks: protectedProcedure.input(z2.object({ propertyId: z2.number() })).query(({ input }) => getPropertyComplianceTasks(input.propertyId)),
    criticalPath: protectedProcedure.query(({ ctx }) => {
      return [];
    })
  }),
  communications: router({
    list: protectedProcedure.input(z2.object({ propertyId: z2.number() })).query(({ input }) => getPropertyCommunications(input.propertyId)),
    templates: protectedProcedure.query(() => {
      return [
        { id: 1, name: "EPC Alert", type: "compliance_notice" },
        { id: 2, name: "Retrofit Update", type: "retrofit_update" },
        { id: 3, name: "Compliance Notice", type: "compliance_notice" }
      ];
    })
  }),
  benchmarks: router({
    get: protectedProcedure.input(z2.object({ region: z2.string(), propertyType: z2.string() })).query(({ input }) => getMarketBenchmark(input.region, input.propertyType)),
    portfolio: protectedProcedure.query(async ({ ctx }) => {
      const props = await getUserProperties(ctx.user.id);
      if (props.length === 0) {
        return {
          yourAvgEpc: "N/A",
          marketAvgEpc: "C",
          yourComplianceRate: 0,
          marketComplianceRate: 82,
          competitivePosition: "No data yet"
        };
      }
      const epcValues = { A: 7, B: 6, C: 5, D: 4, E: 3, F: 2, G: 1 };
      const epcLabels = ["G", "F", "E", "D", "C", "B", "A"];
      const propsWithEpc = props.filter((p) => p.epcRating);
      const avgEpcValue = propsWithEpc.length > 0 ? Math.round(propsWithEpc.reduce((sum, p) => sum + (epcValues[p.epcRating] || 0), 0) / propsWithEpc.length) : 0;
      const yourAvgEpc = avgEpcValue > 0 ? epcLabels[avgEpcValue - 1] || "D" : "N/A";
      const compliant = props.filter((p) => p.complianceStatus === "compliant").length;
      const yourComplianceRate = Math.round(compliant / props.length * 100);
      const position = yourComplianceRate >= 82 ? "Above market average" : yourComplianceRate >= 70 ? "Near market average" : "Below market average";
      return {
        yourAvgEpc,
        marketAvgEpc: "C",
        yourComplianceRate,
        marketComplianceRate: 82,
        competitivePosition: position
      };
    })
  }),
  shareLinks: router({
    create: protectedProcedure.input(z2.object({
      expiryHours: z2.number().default(24),
      accessType: z2.enum(["dashboard", "specific_property", "report"]).default("dashboard"),
      propertyId: z2.number().optional()
    })).mutation(async ({ ctx, input }) => {
      const expiresAt = /* @__PURE__ */ new Date();
      expiresAt.setHours(expiresAt.getHours() + input.expiryHours);
      const token = await createShareLink(ctx.user.id, expiresAt, input.accessType, input.propertyId);
      return { token, expiresAt };
    }),
    list: protectedProcedure.query(({ ctx }) => getUserShareLinks(ctx.user.id)),
    revoke: protectedProcedure.input(z2.object({ token: z2.string() })).mutation(({ input }) => revokeShareLink(input.token)),
    getByToken: publicProcedure.input(z2.object({ token: z2.string() })).query(async ({ input }) => {
      const link = await getShareLinkByToken(input.token);
      if (!link) return null;
      await updateShareLinkAccess(input.token);
      return link;
    })
  }),
  earlyAccess: router({
    create: publicProcedure.input(z2.object({
      fullName: z2.string(),
      workEmail: z2.string().email(),
      companyName: z2.string(),
      role: z2.string(),
      portfolioSize: z2.string()
    })).mutation(async ({ input }) => {
      return await createEarlyAccessSignup(input);
    })
  })
});

// server/_core/context.ts
async function createContext(opts) {
  let user = null;
  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    user = null;
  }
  return {
    req: opts.req,
    res: opts.res,
    user
  };
}

// server/_core/vite.ts
import express from "express";
import fs2 from "fs";
import { nanoid } from "nanoid";
import path2 from "path";
import { createServer as createViteServer } from "vite";

// vite.config.ts
import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "vite";
import { vitePluginManusRuntime } from "vite-plugin-manus-runtime";
var PROJECT_ROOT = import.meta.dirname;
var LOG_DIR = path.join(PROJECT_ROOT, ".manus-logs");
var MAX_LOG_SIZE_BYTES = 1 * 1024 * 1024;
var TRIM_TARGET_BYTES = Math.floor(MAX_LOG_SIZE_BYTES * 0.6);
function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}
function trimLogFile(logPath, maxSize) {
  try {
    if (!fs.existsSync(logPath) || fs.statSync(logPath).size <= maxSize) {
      return;
    }
    const lines = fs.readFileSync(logPath, "utf-8").split("\n");
    const keptLines = [];
    let keptBytes = 0;
    const targetSize = TRIM_TARGET_BYTES;
    for (let i = lines.length - 1; i >= 0; i--) {
      const lineBytes = Buffer.byteLength(`${lines[i]}
`, "utf-8");
      if (keptBytes + lineBytes > targetSize) break;
      keptLines.unshift(lines[i]);
      keptBytes += lineBytes;
    }
    fs.writeFileSync(logPath, keptLines.join("\n"), "utf-8");
  } catch {
  }
}
function writeToLogFile(source, entries) {
  if (entries.length === 0) return;
  ensureLogDir();
  const logPath = path.join(LOG_DIR, `${source}.log`);
  const lines = entries.map((entry) => {
    const ts = (/* @__PURE__ */ new Date()).toISOString();
    return `[${ts}] ${JSON.stringify(entry)}`;
  });
  fs.appendFileSync(logPath, `${lines.join("\n")}
`, "utf-8");
  trimLogFile(logPath, MAX_LOG_SIZE_BYTES);
}
function vitePluginManusDebugCollector() {
  return {
    name: "manus-debug-collector",
    transformIndexHtml(html) {
      if (process.env.NODE_ENV === "production") {
        return html;
      }
      return {
        html,
        tags: [
          {
            tag: "script",
            attrs: {
              src: "/__manus__/debug-collector.js",
              defer: true
            },
            injectTo: "head"
          }
        ]
      };
    },
    configureServer(server) {
      server.middlewares.use("/__manus__/logs", (req, res, next) => {
        if (req.method !== "POST") {
          return next();
        }
        const handlePayload = (payload) => {
          if (payload.consoleLogs?.length > 0) {
            writeToLogFile("browserConsole", payload.consoleLogs);
          }
          if (payload.networkRequests?.length > 0) {
            writeToLogFile("networkRequests", payload.networkRequests);
          }
          if (payload.sessionEvents?.length > 0) {
            writeToLogFile("sessionReplay", payload.sessionEvents);
          }
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true }));
        };
        const reqBody = req.body;
        if (reqBody && typeof reqBody === "object") {
          try {
            handlePayload(reqBody);
          } catch (e) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, error: String(e) }));
          }
          return;
        }
        let body = "";
        req.on("data", (chunk) => {
          body += chunk.toString();
        });
        req.on("end", () => {
          try {
            const payload = JSON.parse(body);
            handlePayload(payload);
          } catch (e) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, error: String(e) }));
          }
        });
      });
    }
  };
}
var plugins = [react(), tailwindcss(), jsxLocPlugin(), vitePluginManusRuntime(), vitePluginManusDebugCollector()];
var vite_config_default = defineConfig({
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  publicDir: path.resolve(import.meta.dirname, "client", "public"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    host: true,
    allowedHosts: [
      ".manuspre.computer",
      ".manus.computer",
      ".manus-asia.computer",
      ".manuscomputer.ai",
      ".manusvm.computer",
      "localhost",
      "127.0.0.1"
    ],
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/_core/vite.ts
async function setupVite(app, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    server: serverOptions,
    appType: "custom"
  });
  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );
      let template = await fs2.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app) {
  const distPath = process.env.NODE_ENV === "development" ? path2.resolve(import.meta.dirname, "../..", "dist", "public") : path2.resolve(import.meta.dirname, "public");
  if (!fs2.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app.use(express.static(distPath));
  app.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/_core/index.ts
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}
async function findAvailablePort(startPort = 3e3) {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}
async function startServer() {
  const app = express2();
  const server = createServer(app);
  app.use(express2.json({ limit: "50mb" }));
  app.use(express2.urlencoded({ limit: "50mb", extended: true }));
  registerOAuthRoutes(app);
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext
    })
  );
  app.post("/api/signup", async (req, res) => {
    try {
      const { name, email, company } = req.body ?? {};
      const cleanEmail = String(email || "").trim().toLowerCase();
      console.log(`Signup request received: ${cleanEmail || "unknown"}`);
      if (!cleanEmail) {
        return res.status(200).json({ success: true });
      }
      try {
        const mysql = await import("mysql2/promise");
        const databaseUrl = process.env.DATABASE_URL;
        if (!databaseUrl) {
          console.error("DATABASE_URL is missing");
        } else {
          const connection = await mysql.createConnection(databaseUrl);
          await connection.execute(`
            CREATE TABLE IF NOT EXISTS users (
              id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
              email VARCHAR(255) NOT NULL UNIQUE,
              created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
          `);
          console.log(`Saving user: ${cleanEmail}`);
          const [existingRows] = await connection.execute(
            "SELECT id FROM users WHERE email = ? LIMIT 1",
            [cleanEmail]
          );
          const existing = existingRows;
          if (existing.length > 0) {
            console.log("User already exists");
          } else {
            await connection.execute(
              "INSERT INTO users (email, reports_used) VALUES (?, 0)",
              [email]
            );
            console.log("User saved successfully");
          }
          await connection.end();
        }
      } catch (dbError) {
        console.error(
          `Database error: ${dbError instanceof Error ? dbError.message : String(dbError)}`
        );
      }
      const { Resend } = await import("resend");
      const resend = new Resend(
        process.env.RESEND_API_KEY || "re_8XondN7D_EDeTswagEfdnVFc2XFcRbbFH"
      );
      try {
        await resend.emails.send({
          from: "Veridia <onboarding@resend.dev>",
          to: "mia.hildebrandt@icloud.com",
          subject: "New Veridia Free Trial Signup",
          html: `<h2>New signup!</h2><p><strong>Name:</strong> ${name || "Not provided"}</p><p><strong>Email:</strong> ${cleanEmail || "Not provided"}</p><p><strong>Company:</strong> ${company || "Not provided"}</p>`
        });
        await resend.emails.send({
          from: "Veridia <onboarding@resend.dev>",
          to: cleanEmail,
          subject: "Your Veridia access is live",
          html: `<p>You now have access to Veridia.</p><p>Screen UK commercial properties for EPC, MEES compliance, retrofit capex and risk in seconds.</p><p><a href="https://veridiascore.com/deal-screen">https://veridiascore.com/deal-screen</a></p><p>If you have any questions, reply to this email.</p>`
        });
        console.log("Email sent successfully");
      } catch (error) {
        console.error(`Email failed: ${error instanceof Error ? error.message : String(error)}`);
      }
      res.status(200).json({ success: true });
    } catch (e) {
      console.error("Signup error:", e);
      res.status(200).json({ success: true });
    }
  });
  app.post("/api/check-trial", async (req, res) => {
    try {
      const { email } = req.body ?? {};
      const cleanEmail = String(email || "").trim().toLowerCase();
      if (!cleanEmail) {
        return res.json({ valid: false });
      }
      const mysql = await import("mysql2/promise");
      const connection = await mysql.createConnection(process.env.DATABASE_URL);
      const [rows] = await connection.execute(
        "SELECT created_at FROM users WHERE email = ? LIMIT 1",
        [cleanEmail]
      );
      await connection.end();
      const result = rows;
      if (result.length === 0) {
        return res.json({ valid: false });
      }
      const createdAt = new Date(result[0].created_at);
      const now = /* @__PURE__ */ new Date();
      const diffDays = (now.getTime() - createdAt.getTime()) / (1e3 * 60 * 60 * 24);
      if (diffDays > 7) {
        return res.json({ valid: false, expired: true });
      }
      return res.json({ valid: true });
    } catch (e) {
      console.error("Trial check error:", e);
      return res.json({ valid: false });
    }
  });
  app.post("/api/check-usage", async (req, res) => {
    try {
      const { email } = req.body ?? {};
      const cleanEmail = String(email || "").trim().toLowerCase();
      if (!cleanEmail) {
        return res.json({ allowed: false });
      }
      const mysql = await import("mysql2/promise");
      const connection = await mysql.createConnection(process.env.DATABASE_URL);
      const [rows] = await connection.execute(
        "SELECT reports_used FROM users WHERE email = ? LIMIT 1",
        [cleanEmail]
      );
      await connection.end();
      const result = rows;
      if (!result.length) {
        return res.json({ allowed: false });
      }
      if (result[0].reports_used >= 1) {
        return res.json({ allowed: false });
      }
      return res.json({ allowed: true });
    } catch (e) {
      console.error("Usage check error:", e);
      return res.json({ allowed: false });
    }
  });
  app.get("/api/epc", async (req, res) => {
    try {
      const { lookupEPCByPostcode: lookupEPCByPostcode2, lookupEPCByPostcodeNonDomestic: lookupEPCByPostcodeNonDomestic2 } = await Promise.resolve().then(() => (init_epcApi(), epcApi_exports));
      const postcode = req.query.postcode;
      if (!postcode) return res.json([]);
      let results = await lookupEPCByPostcodeNonDomestic2(postcode);
      if (!results || results.length === 0) {
        results = await lookupEPCByPostcode2(postcode);
      }
      res.json(results);
    } catch (e) {
      console.error("EPC route error:", e);
      res.json([]);
    }
  });
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);
  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }
  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}
startServer().catch(console.error);

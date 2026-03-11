import { drizzle } from "drizzle-orm/mysql2";
import { properties, complianceRequirements, complianceViolations, capexItems, regulatoryForecasts } from "./drizzle/schema.ts";
import { DATABASE_URL } from "./server/_core/env.ts";

const db = drizzle(DATABASE_URL);

const portfolioData = [
  {
    name: "Canary Wharf Office Tower",
    address: "1 Canada Square, London, E14 5AB",
    propertyType: "office",
    yearBuilt: 1991,
    epcRating: "D",
    complianceStatus: "at_risk",
    riskLevel: "medium",
    riskScore: 62,
    estimatedRetrofitCost: 2800000,
    description: "Premium Grade A office space in Canary Wharf. 45,000 sqm across 50 floors. Built in 1991, requires modernization to meet net zero targets.",
  },
  {
    name: "Westfield Shopping Centre",
    address: "120 City Road, London, EC1V 2NX",
    propertyType: "retail",
    yearBuilt: 2008,
    epcRating: "C",
    complianceStatus: "compliant",
    riskLevel: "low",
    riskScore: 35,
    estimatedRetrofitCost: 450000,
    description: "Modern shopping centre with 180+ retail units. Strong energy performance with recent HVAC upgrades.",
  },
  {
    name: "Manchester Business Park",
    address: "Stockport Road, Manchester, M12 6HS",
    propertyType: "office",
    yearBuilt: 2005,
    epcRating: "E",
    complianceStatus: "non_compliant",
    riskLevel: "high",
    riskScore: 78,
    estimatedRetrofitCost: 3200000,
    description: "Business park with 8 office buildings. EPC rating E puts it at risk of becoming non-lettable from April 2025.",
  },
  {
    name: "Bristol Warehouse Complex",
    address: "Avon Valley Industrial Estate, Bristol, BS32 4QR",
    propertyType: "industrial",
    yearBuilt: 1998,
    epcRating: "F",
    complianceStatus: "non_compliant",
    riskLevel: "high",
    riskScore: 85,
    estimatedRetrofitCost: 1950000,
    description: "Large industrial warehouse (28,000 sqm). Poor energy efficiency. Requires significant investment to meet minimum standards.",
  },
  {
    name: "Edinburgh Financial District",
    address: "St Andrew Square, Edinburgh, EH2 2BD",
    propertyType: "office",
    yearBuilt: 2012,
    epcRating: "B",
    complianceStatus: "compliant",
    riskLevel: "low",
    riskScore: 28,
    estimatedRetrofitCost: 120000,
    description: "Modern office building with excellent energy performance. Recently certified with B rating.",
  },
  {
    name: "Leeds Retail Park",
    address: "White Rose Centre, Leeds, LS11 8LU",
    propertyType: "retail",
    yearBuilt: 2003,
    epcRating: "D",
    complianceStatus: "at_risk",
    riskLevel: "medium",
    riskScore: 58,
    estimatedRetrofitCost: 680000,
    description: "Large retail park with 50+ units. EPC D rating requires attention within next 12 months.",
  },
  {
    name: "Birmingham Mixed-Use Development",
    address: "Bullring District, Birmingham, B5 4BU",
    propertyType: "mixed_use",
    yearBuilt: 2015,
    epcRating: "B",
    complianceStatus: "compliant",
    riskLevel: "low",
    riskScore: 32,
    estimatedRetrofitCost: 250000,
    description: "Contemporary mixed-use development with retail, office, and residential. High environmental standards.",
  },
  {
    name: "Glasgow Industrial Hub",
    address: "Hillington Park, Glasgow, G52 4UZ",
    propertyType: "industrial",
    yearBuilt: 2001,
    epcRating: "E",
    complianceStatus: "at_risk",
    riskLevel: "medium",
    riskScore: 68,
    estimatedRetrofitCost: 1420000,
    description: "Multi-tenant industrial facility (18,000 sqm). Needs upgrades to maintain lettability.",
  },
  {
    name: "Southampton Logistics Centre",
    address: "Port Road, Southampton, SO15 1AG",
    propertyType: "industrial",
    yearBuilt: 2010,
    epcRating: "C",
    complianceStatus: "compliant",
    riskLevel: "low",
    riskScore: 38,
    estimatedRetrofitCost: 280000,
    description: "Modern logistics facility with good energy management. Strategic location near port.",
  },
  {
    name: "Newcastle Office Campus",
    address: "Stephenson Quarter, Newcastle, NE1 2HA",
    propertyType: "office",
    yearBuilt: 1995,
    epcRating: "E",
    complianceStatus: "non_compliant",
    riskLevel: "high",
    riskScore: 82,
    estimatedRetrofitCost: 2650000,
    description: "1990s office campus requiring major retrofitting. At significant risk of becoming non-lettable.",
  },
  {
    name: "Cambridge Tech Park",
    address: "Silicon Fen, Cambridge, CB4 0WZ",
    propertyType: "office",
    yearBuilt: 2018,
    epcRating: "A",
    complianceStatus: "compliant",
    riskLevel: "low",
    riskScore: 15,
    estimatedRetrofitCost: 50000,
    description: "State-of-the-art tech park with A-rated energy efficiency. Minimal compliance risk.",
  },
  {
    name: "Liverpool Retail Quarter",
    address: "Bold Street, Liverpool, L1 4EL",
    propertyType: "retail",
    yearBuilt: 2006,
    epcRating: "D",
    complianceStatus: "at_risk",
    riskLevel: "medium",
    riskScore: 55,
    estimatedRetrofitCost: 520000,
    description: "Historic retail area with modern upgrades. Requires energy efficiency improvements.",
  },
];

async function seedPortfolio() {
  try {
    console.log("🌱 Starting portfolio seed...");

    // Insert properties
    for (const prop of portfolioData) {
      await db.insert(properties).values({
        name: prop.name,
        address: prop.address,
        propertyType: prop.propertyType,
        yearBuilt: prop.yearBuilt,
        epcRating: prop.epcRating,
        complianceStatus: prop.complianceStatus,
        riskLevel: prop.riskLevel,
        riskScore: prop.riskScore,
        estimatedRetrofitCost: prop.estimatedRetrofitCost,
        description: prop.description,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    console.log(`✅ Inserted ${portfolioData.length} properties`);

    // Insert compliance requirements
    const requirements = [
      {
        regulation: "EPC Minimum D Rating",
        description: "All commercial properties must achieve minimum EPC rating D",
        deadline: new Date("2025-04-01"),
        severity: "high",
      },
      {
        regulation: "Building Safety Act",
        description: "Compliance with Building Safety Act requirements for high-rise buildings",
        deadline: new Date("2025-09-01"),
        severity: "high",
      },
      {
        regulation: "Fire Safety Regulations",
        description: "Enhanced fire safety measures for commercial buildings",
        deadline: new Date("2025-12-01"),
        severity: "high",
      },
      {
        regulation: "Net Zero Pathway",
        description: "Commitment to net zero carbon emissions by 2050",
        deadline: new Date("2030-01-01"),
        severity: "medium",
      },
      {
        regulation: "MEES Compliance",
        description: "Minimum Energy Efficiency Standards for lettable properties",
        deadline: new Date("2025-04-01"),
        severity: "high",
      },
    ];

    for (const req of requirements) {
      await db.insert(complianceRequirements).values({
        regulation: req.regulation,
        description: req.description,
        deadline: req.deadline,
        severity: req.severity,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    console.log(`✅ Inserted ${requirements.length} compliance requirements`);

    // Insert some violations for high-risk properties
    const violations = [
      {
        propertyName: "Bristol Warehouse Complex",
        violationType: "EPC Rating Below Minimum",
        severity: "high",
        description: "EPC rating F - below minimum D threshold for lettable properties",
        detectedDate: new Date("2025-02-15"),
      },
      {
        propertyName: "Newcastle Office Campus",
        violationType: "EPC Rating Below Minimum",
        severity: "high",
        description: "EPC rating E - requires upgrade by April 2025",
        detectedDate: new Date("2025-02-20"),
      },
      {
        propertyName: "Manchester Business Park",
        violationType: "EPC Rating Below Minimum",
        severity: "high",
        description: "EPC rating E - at risk of becoming non-lettable",
        detectedDate: new Date("2025-02-18"),
      },
      {
        propertyName: "Canary Wharf Office Tower",
        violationType: "Fire Safety Documentation",
        severity: "medium",
        description: "Fire safety certificate expires June 2025 - renewal required",
        detectedDate: new Date("2025-02-10"),
      },
    ];

    for (const violation of violations) {
      await db.insert(complianceViolations).values({
        propertyName: violation.propertyName,
        violationType: violation.violationType,
        severity: violation.severity,
        description: violation.description,
        detectedDate: violation.detectedDate,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    console.log(`✅ Inserted ${violations.length} compliance violations`);

    // Insert capex items
    const capexItems_data = [
      {
        propertyName: "Bristol Warehouse Complex",
        projectName: "Complete Energy Retrofit",
        description: "HVAC system replacement, insulation upgrade, LED lighting",
        estimatedCost: 1950000,
        priority: "critical",
        timeline: "Q2-Q4 2025",
        status: "planned",
      },
      {
        propertyName: "Newcastle Office Campus",
        projectName: "Major Retrofit Program",
        description: "Windows replacement, heating system upgrade, building controls",
        estimatedCost: 2650000,
        priority: "critical",
        timeline: "2025-2026",
        status: "planned",
      },
      {
        propertyName: "Manchester Business Park",
        projectName: "EPC Upgrade to D Rating",
        description: "HVAC improvements and insulation work",
        estimatedCost: 3200000,
        priority: "high",
        timeline: "Q1-Q3 2025",
        status: "planned",
      },
      {
        propertyName: "Canary Wharf Office Tower",
        projectName: "Net Zero Pathway Investment",
        description: "Solar panels, energy storage, smart building systems",
        estimatedCost: 2800000,
        priority: "high",
        timeline: "2025-2027",
        status: "planned",
      },
      {
        propertyName: "Glasgow Industrial Hub",
        projectName: "Energy Efficiency Upgrade",
        description: "Lighting retrofit and HVAC optimization",
        estimatedCost: 1420000,
        priority: "medium",
        timeline: "Q3-Q4 2025",
        status: "planned",
      },
    ];

    for (const capex of capexItems_data) {
      await db.insert(capexItems).values({
        propertyName: capex.propertyName,
        projectName: capex.projectName,
        description: capex.description,
        estimatedCost: capex.estimatedCost,
        priority: capex.priority,
        timeline: capex.timeline,
        status: capex.status,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    console.log(`✅ Inserted ${capexItems_data.length} capex items`);

    // Insert regulatory forecasts
    const forecasts = [
      {
        regulationType: "EPC Minimum Rating Increase",
        description: "EPC minimum rating expected to increase from D to C by 2028",
        predictedDate: new Date("2028-01-01"),
        impactLevel: "high",
        affectedProperties: 6,
      },
      {
        regulationType: "Net Zero Mandatory Targets",
        description: "Commercial properties must achieve net zero by 2040",
        predictedDate: new Date("2040-01-01"),
        impactLevel: "high",
        affectedProperties: 12,
      },
      {
        regulationType: "Enhanced Fire Safety",
        description: "Stricter fire safety requirements for buildings over 7 storeys",
        predictedDate: new Date("2026-01-01"),
        impactLevel: "medium",
        affectedProperties: 3,
      },
      {
        regulationType: "Carbon Pricing",
        description: "Carbon pricing mechanism for commercial real estate",
        predictedDate: new Date("2027-01-01"),
        impactLevel: "medium",
        affectedProperties: 12,
      },
    ];

    for (const forecast of forecasts) {
      await db.insert(regulatoryForecasts).values({
        regulationType: forecast.regulationType,
        description: forecast.description,
        predictedDate: forecast.predictedDate,
        impactLevel: forecast.impactLevel,
        affectedProperties: forecast.affectedProperties,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    console.log(`✅ Inserted ${forecasts.length} regulatory forecasts`);

    console.log("\n✨ Portfolio seed completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  }
}

seedPortfolio();

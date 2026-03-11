import mysql from "mysql2/promise";

const portfolioData = [
  {
    name: "Canary Wharf Office Tower",
    address: "1 Canada Square, London, E14 5AB",
    postcode: "E14 5AB",
    propertyType: "office",
    yearBuilt: 1991,
    floorArea: 45000,
    epcRating: "D",
    epcScore: 55,
    complianceStatus: "at_risk",
    riskLevel: "medium",
    riskScore: 62,
    estimatedRetrofitCost: 2800000,
    lettable: 1,
    notes: "Premium Grade A office space in Canary Wharf. 45,000 sqm across 50 floors. Built in 1991, requires modernization to meet net zero targets.",
  },
  {
    name: "Westfield Shopping Centre",
    address: "120 City Road, London, EC1V 2NX",
    postcode: "EC1V 2NX",
    propertyType: "retail",
    yearBuilt: 2008,
    floorArea: 85000,
    epcRating: "C",
    epcScore: 72,
    complianceStatus: "compliant",
    riskLevel: "low",
    riskScore: 35,
    estimatedRetrofitCost: 450000,
    lettable: 1,
    notes: "Modern shopping centre with 180+ retail units. Strong energy performance with recent HVAC upgrades.",
  },
  {
    name: "Manchester Business Park",
    address: "Stockport Road, Manchester, M12 6HS",
    postcode: "M12 6HS",
    propertyType: "office",
    yearBuilt: 2005,
    floorArea: 32000,
    epcRating: "E",
    epcScore: 38,
    complianceStatus: "non_compliant",
    riskLevel: "high",
    riskScore: 78,
    estimatedRetrofitCost: 3200000,
    lettable: 0,
    notes: "Business park with 8 office buildings. EPC rating E puts it at risk of becoming non-lettable from April 2025.",
  },
  {
    name: "Bristol Warehouse Complex",
    address: "Avon Valley Industrial Estate, Bristol, BS32 4QR",
    postcode: "BS32 4QR",
    propertyType: "industrial",
    yearBuilt: 1998,
    floorArea: 28000,
    epcRating: "F",
    epcScore: 22,
    complianceStatus: "non_compliant",
    riskLevel: "high",
    riskScore: 85,
    estimatedRetrofitCost: 1950000,
    lettable: 0,
    notes: "Large industrial warehouse (28,000 sqm). Poor energy efficiency. Requires significant investment to meet minimum standards.",
  },
  {
    name: "Edinburgh Financial District",
    address: "St Andrew Square, Edinburgh, EH2 2BD",
    postcode: "EH2 2BD",
    propertyType: "office",
    yearBuilt: 2012,
    floorArea: 18000,
    epcRating: "B",
    epcScore: 85,
    complianceStatus: "compliant",
    riskLevel: "low",
    riskScore: 28,
    estimatedRetrofitCost: 120000,
    lettable: 1,
    notes: "Modern office building with excellent energy performance. Recently certified with B rating.",
  },
  {
    name: "Leeds Retail Park",
    address: "White Rose Centre, Leeds, LS11 8LU",
    postcode: "LS11 8LU",
    propertyType: "retail",
    yearBuilt: 2003,
    floorArea: 42000,
    epcRating: "D",
    epcScore: 52,
    complianceStatus: "at_risk",
    riskLevel: "medium",
    riskScore: 58,
    estimatedRetrofitCost: 680000,
    lettable: 1,
    notes: "Large retail park with 50+ units. EPC D rating requires attention within next 12 months.",
  },
  {
    name: "Birmingham Mixed-Use Development",
    address: "Bullring District, Birmingham, B5 4BU",
    postcode: "B5 4BU",
    propertyType: "mixed_use",
    yearBuilt: 2015,
    floorArea: 55000,
    epcRating: "B",
    epcScore: 80,
    complianceStatus: "compliant",
    riskLevel: "low",
    riskScore: 32,
    estimatedRetrofitCost: 250000,
    lettable: 1,
    notes: "Contemporary mixed-use development with retail, office, and residential. High environmental standards.",
  },
  {
    name: "Glasgow Industrial Hub",
    address: "Hillington Park, Glasgow, G52 4UZ",
    postcode: "G52 4UZ",
    propertyType: "industrial",
    yearBuilt: 2001,
    floorArea: 18000,
    epcRating: "E",
    epcScore: 40,
    complianceStatus: "at_risk",
    riskLevel: "medium",
    riskScore: 68,
    estimatedRetrofitCost: 1420000,
    lettable: 1,
    notes: "Multi-tenant industrial facility (18,000 sqm). Needs upgrades to maintain lettability.",
  },
  {
    name: "Southampton Logistics Centre",
    address: "Port Road, Southampton, SO15 1AG",
    postcode: "SO15 1AG",
    propertyType: "industrial",
    yearBuilt: 2010,
    floorArea: 35000,
    epcRating: "C",
    epcScore: 68,
    complianceStatus: "compliant",
    riskLevel: "low",
    riskScore: 38,
    estimatedRetrofitCost: 280000,
    lettable: 1,
    notes: "Modern logistics facility with good energy management. Strategic location near port.",
  },
  {
    name: "Newcastle Office Campus",
    address: "Stephenson Quarter, Newcastle, NE1 2HA",
    postcode: "NE1 2HA",
    propertyType: "office",
    yearBuilt: 1995,
    floorArea: 28000,
    epcRating: "E",
    epcScore: 35,
    complianceStatus: "non_compliant",
    riskLevel: "high",
    riskScore: 82,
    estimatedRetrofitCost: 2650000,
    lettable: 0,
    notes: "1990s office campus requiring major retrofitting. At significant risk of becoming non-lettable.",
  },
  {
    name: "Cambridge Tech Park",
    address: "Silicon Fen, Cambridge, CB4 0WZ",
    postcode: "CB4 0WZ",
    propertyType: "office",
    yearBuilt: 2018,
    floorArea: 22000,
    epcRating: "A",
    epcScore: 95,
    complianceStatus: "compliant",
    riskLevel: "low",
    riskScore: 15,
    estimatedRetrofitCost: 50000,
    lettable: 1,
    notes: "State-of-the-art tech park with A-rated energy efficiency. Minimal compliance risk.",
  },
  {
    name: "Liverpool Retail Quarter",
    address: "Bold Street, Liverpool, L1 4EL",
    postcode: "L1 4EL",
    propertyType: "retail",
    yearBuilt: 2006,
    floorArea: 38000,
    epcRating: "D",
    epcScore: 50,
    complianceStatus: "at_risk",
    riskLevel: "medium",
    riskScore: 55,
    estimatedRetrofitCost: 520000,
    lettable: 1,
    notes: "Historic retail area with modern upgrades. Requires energy efficiency improvements.",
  },
];

async function seedPortfolio() {
  try {
    console.log("🌱 Starting portfolio seed...");

    const connection = await mysql.createConnection(process.env.DATABASE_URL);

    // Get the first user (owner) - assuming user ID 1 exists
    const [users] = await connection.execute("SELECT id FROM users LIMIT 1");
    const userId = users[0]?.id || 1;

    // Insert properties
    for (const prop of portfolioData) {
      await connection.execute(
        `INSERT INTO properties (userId, name, address, postcode, propertyType, yearBuilt, floorArea, epcRating, epcScore, complianceStatus, riskLevel, riskScore, estimatedRetrofitCost, lettable, notes, createdAt, updatedAt) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          userId,
          prop.name,
          prop.address,
          prop.postcode,
          prop.propertyType,
          prop.yearBuilt,
          prop.floorArea,
          prop.epcRating,
          prop.epcScore,
          prop.complianceStatus,
          prop.riskLevel,
          prop.riskScore,
          prop.estimatedRetrofitCost,
          prop.lettable,
          prop.notes,
        ]
      );
    }

    console.log(`✅ Inserted ${portfolioData.length} properties`);

    // Insert compliance requirements
    const requirements = [
      {
        name: "EPC Minimum D Rating",
        regulationType: "EPC",
        description: "All commercial properties must achieve minimum EPC rating D",
        deadline: "2025-04-01",
        severity: "high",
      },
      {
        name: "Building Safety Act",
        regulationType: "Building Safety",
        description: "Compliance with Building Safety Act requirements for high-rise buildings",
        deadline: "2025-09-01",
        severity: "high",
      },
      {
        name: "Fire Safety Regulations",
        regulationType: "Fire Safety",
        description: "Enhanced fire safety measures for commercial buildings",
        deadline: "2025-12-01",
        severity: "high",
      },
      {
        name: "Net Zero Pathway",
        regulationType: "Net Zero",
        description: "Commitment to net zero carbon emissions by 2050",
        deadline: "2030-01-01",
        severity: "medium",
      },
      {
        name: "MEES Compliance",
        regulationType: "Energy Efficiency",
        description: "Minimum Energy Efficiency Standards for lettable properties",
        deadline: "2025-04-01",
        severity: "high",
      },
    ];

    for (const req of requirements) {
      await connection.execute(
        `INSERT INTO complianceRequirements (name, regulationType, description, deadline, severity, createdAt) 
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [req.name, req.regulationType, req.description, req.deadline, req.severity]
      );
    }

    console.log(`✅ Inserted ${requirements.length} compliance requirements`);

    // Get property IDs for violations
    const [properties] = await connection.execute("SELECT id, name FROM properties");
    const propertyMap = {};
    properties.forEach((p) => {
      propertyMap[p.name] = p.id;
    });

    // Insert some violations for high-risk properties
    const violations = [
      {
        propertyId: propertyMap["Bristol Warehouse Complex"],
        violationType: "EPC Rating Below Minimum",
        severity: "high",
        description: "EPC rating F - below minimum D threshold for lettable properties",
        detectedDate: "2025-02-15",
      },
      {
        propertyId: propertyMap["Newcastle Office Campus"],
        violationType: "EPC Rating Below Minimum",
        severity: "high",
        description: "EPC rating E - requires upgrade by April 2025",
        detectedDate: "2025-02-20",
      },
      {
        propertyId: propertyMap["Manchester Business Park"],
        violationType: "EPC Rating Below Minimum",
        severity: "high",
        description: "EPC rating E - at risk of becoming non-lettable",
        detectedDate: "2025-02-18",
      },
      {
        propertyId: propertyMap["Canary Wharf Office Tower"],
        violationType: "Fire Safety Documentation",
        severity: "medium",
        description: "Fire safety certificate expires June 2025 - renewal required",
        detectedDate: "2025-02-10",
      },
    ];

    for (const violation of violations) {
      if (violation.propertyId) {
        await connection.execute(
          `INSERT INTO complianceViolations (propertyId, violationType, severity, description, detectedDate, createdAt, updatedAt) 
           VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
          [
            violation.propertyId,
            violation.violationType,
            violation.severity,
            violation.description,
            violation.detectedDate,
          ]
        );
      }
    }

    console.log(`✅ Inserted ${violations.length} compliance violations`);

    // Insert capex items
    const capexItems_data = [
      {
        propertyId: propertyMap["Bristol Warehouse Complex"],
        title: "Complete Energy Retrofit",
        description: "HVAC system replacement, insulation upgrade, LED lighting",
        category: "energy_efficiency",
        estimatedCost: 1950000,
        priority: "critical",
        timeline: "Q2-Q4 2025",
        roi: 28,
        status: "planned",
      },
      {
        propertyId: propertyMap["Newcastle Office Campus"],
        title: "Major Retrofit Program",
        description: "Windows replacement, heating system upgrade, building controls",
        category: "retrofit",
        estimatedCost: 2650000,
        priority: "critical",
        timeline: "2025-2026",
        roi: 32,
        status: "planned",
      },
      {
        propertyId: propertyMap["Manchester Business Park"],
        title: "EPC Upgrade to D Rating",
        description: "HVAC improvements and insulation work",
        category: "energy_efficiency",
        estimatedCost: 3200000,
        priority: "high",
        timeline: "Q1-Q3 2025",
        roi: 35,
        status: "planned",
      },
      {
        propertyId: propertyMap["Canary Wharf Office Tower"],
        title: "Net Zero Pathway Investment",
        description: "Solar panels, energy storage, smart building systems",
        category: "net_zero",
        estimatedCost: 2800000,
        priority: "high",
        timeline: "2025-2027",
        roi: 42,
        status: "planned",
      },
      {
        propertyId: propertyMap["Glasgow Industrial Hub"],
        title: "Energy Efficiency Upgrade",
        description: "Lighting retrofit and HVAC optimization",
        category: "energy_efficiency",
        estimatedCost: 1420000,
        priority: "medium",
        timeline: "Q3-Q4 2025",
        roi: 38,
        status: "planned",
      },
    ];

    for (const capex of capexItems_data) {
      if (capex.propertyId) {
        await connection.execute(
          `INSERT INTO capexItems (propertyId, title, description, category, estimatedCost, priority, timeline, roi, status, createdAt, updatedAt) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [
            capex.propertyId,
            capex.title,
            capex.description,
            capex.category,
            capex.estimatedCost,
            capex.priority,
            capex.timeline,
            capex.roi,
            capex.status,
          ]
        );
      }
    }

    console.log(`✅ Inserted ${capexItems_data.length} capex items`);

    // Insert regulatory forecasts
    const forecasts = [
      {
        propertyId: propertyMap["Canary Wharf Office Tower"],
        forecastType: "EPC Minimum Rating Increase",
        impactDescription: "EPC minimum rating expected to increase from D to C by 2028",
        affectedYear: 2028,
        likelihood: "high",
        estimatedImpactCost: 1200000,
        willBecomeLettable: 0,
      },
      {
        propertyId: propertyMap["Manchester Business Park"],
        forecastType: "Net Zero Mandatory Targets",
        impactDescription: "Commercial properties must achieve net zero by 2040",
        affectedYear: 2040,
        likelihood: "high",
        estimatedImpactCost: 2500000,
        willBecomeLettable: 1,
      },
      {
        propertyId: propertyMap["Canary Wharf Office Tower"],
        forecastType: "Enhanced Fire Safety",
        impactDescription: "Stricter fire safety requirements for buildings over 7 storeys",
        affectedYear: 2026,
        likelihood: "high",
        estimatedImpactCost: 450000,
        willBecomeLettable: 0,
      },
      {
        propertyId: propertyMap["Bristol Warehouse Complex"],
        forecastType: "Carbon Pricing",
        impactDescription: "Carbon pricing mechanism for commercial real estate",
        affectedYear: 2027,
        likelihood: "medium",
        estimatedImpactCost: 180000,
        willBecomeLettable: 0,
      },
    ];

    for (const forecast of forecasts) {
      if (forecast.propertyId) {
        await connection.execute(
          `INSERT INTO regulatoryForecasts (propertyId, forecastType, impactDescription, affectedYear, likelihood, estimatedImpactCost, willBecomeLettable, createdAt, updatedAt) 
           VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [
            forecast.propertyId,
            forecast.forecastType,
            forecast.impactDescription,
            forecast.affectedYear,
            forecast.likelihood,
            forecast.estimatedImpactCost,
            forecast.willBecomeLettable,
          ]
        );
      }
    }

    console.log(`✅ Inserted ${forecasts.length} regulatory forecasts`);

    await connection.end();

    console.log("\n✨ Portfolio seed completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  }
}

seedPortfolio();

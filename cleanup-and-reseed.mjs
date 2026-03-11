import { drizzle } from "drizzle-orm/mysql2";
import { properties, capexItems, complianceViolations } from "./drizzle/schema.ts";
import { eq } from "drizzle-orm";

const db = drizzle(process.env.DATABASE_URL);

async function cleanup() {
  try {
    console.log("🧹 Phase 1: Cleaning up test data...");
    
    // Delete all properties with IDs > 12 (test data)
    const testIds = [30001, 30002, 60001, 60002, 90001, 90002, 90003, 90004, 90005, 90006, 90007, 120001, 150001, 150002];
    
    for (const id of testIds) {
      await db.delete(capexItems).where(eq(capexItems.propertyId, id));
      await db.delete(complianceViolations).where(eq(complianceViolations.propertyId, id));
      await db.delete(properties).where(eq(properties.id, id));
    }
    
    console.log(`✅ Deleted ${testIds.length} test properties`);

    console.log("🏗️ Phase 2: Updating properties with real UK data...");

    const realProperties = [
      { id: 1, name: "Selfridges", address: "400 Oxford Street, London", postcode: "W1A 1AB", propertyType: "retail", yearBuilt: 1909, floorArea: 51000, storeys: 5, epcRating: "D", epcScore: 72, riskScore: 65, riskLevel: "medium", complianceStatus: "at_risk", lettable: 1, meesCompliant: 1, estimatedRetrofitCost: 3200000, yearsToDeadline: 4, estimatedPaybackYears: 8, notes: "Grade II* listed department store. Heritage constraints limit retrofit options. HVAC modernisation and LED lighting programme underway." },
      { id: 2, name: "One Canada Square", address: "1 Canada Square, Canary Wharf, London", postcode: "E14 5AB", propertyType: "office", yearBuilt: 1991, floorArea: 111484, storeys: 50, epcRating: "D", epcScore: 78, riskScore: 62, riskLevel: "medium", complianceStatus: "at_risk", lettable: 1, meesCompliant: 1, estimatedRetrofitCost: 4500000, yearsToDeadline: 4, estimatedPaybackYears: 7, notes: "Iconic Canary Wharf tower. 50 floors of Grade A office space. Requires significant glazing and HVAC upgrades for EPC C target." },
      { id: 3, name: "Arndale Centre", address: "49 High Street, Manchester", postcode: "M4 3AH", propertyType: "retail", yearBuilt: 1975, floorArea: 139000, storeys: 3, epcRating: "E", epcScore: 92, riskScore: 82, riskLevel: "high", complianceStatus: "non_compliant", lettable: 0, meesCompliant: 0, estimatedRetrofitCost: 5800000, yearsToDeadline: 4, estimatedPaybackYears: 10, notes: "Major shopping centre with 210+ stores. 1970s construction with poor thermal performance. Phased retrofit programme required." },
      { id: 4, name: "The Shard - Office Floors", address: "32 London Bridge Street, London", postcode: "SE1 9SG", propertyType: "office", yearBuilt: 2012, floorArea: 59000, storeys: 72, epcRating: "B", epcScore: 38, riskScore: 18, riskLevel: "low", complianceStatus: "compliant", lettable: 1, meesCompliant: 1, estimatedRetrofitCost: 280000, yearsToDeadline: 4, estimatedPaybackYears: 3, notes: "Modern construction with excellent energy performance. Triple-glazed facade and efficient building management system." },
      { id: 5, name: "Quartermile One", address: "15 Lauriston Place, Edinburgh", postcode: "EH3 9EP", propertyType: "mixed_use", yearBuilt: 2008, floorArea: 18500, storeys: 8, epcRating: "C", epcScore: 55, riskScore: 35, riskLevel: "low", complianceStatus: "compliant", lettable: 1, meesCompliant: 1, estimatedRetrofitCost: 420000, yearsToDeadline: 4, estimatedPaybackYears: 5, notes: "Mixed-use development on former Royal Infirmary site. Office and residential. Good baseline energy performance." },
      { id: 6, name: "Meadowhall", address: "Meadowhall Way, Sheffield", postcode: "S9 1EP", propertyType: "retail", yearBuilt: 1990, floorArea: 139000, storeys: 2, epcRating: "D", epcScore: 76, riskScore: 58, riskLevel: "medium", complianceStatus: "at_risk", lettable: 1, meesCompliant: 1, estimatedRetrofitCost: 2100000, yearsToDeadline: 4, estimatedPaybackYears: 6, notes: "Major out-of-town shopping centre with 290 stores. 1990 construction. Roof-mounted solar PV installed 2022." },
      { id: 7, name: "Brindleyplace", address: "2 Brunswick Square, Birmingham", postcode: "B1 2HP", propertyType: "office", yearBuilt: 1999, floorArea: 55000, storeys: 7, epcRating: "C", epcScore: 58, riskScore: 32, riskLevel: "low", complianceStatus: "compliant", lettable: 1, meesCompliant: 1, estimatedRetrofitCost: 380000, yearsToDeadline: 4, estimatedPaybackYears: 4, notes: "Award-winning mixed-use development. Canal-side office campus. Recent LED lighting and BMS upgrades." },
      { id: 8, name: "Hillington Park Industrial Estate", address: "Earl Haig Road, Glasgow", postcode: "G52 4BL", propertyType: "industrial", yearBuilt: 1965, floorArea: 72000, storeys: 2, epcRating: "F", epcScore: 118, riskScore: 88, riskLevel: "high", complianceStatus: "non_compliant", lettable: 0, meesCompliant: 0, estimatedRetrofitCost: 3400000, yearsToDeadline: 4, estimatedPaybackYears: 12, notes: "Scotland's largest industrial estate. 1960s construction with very poor insulation. Multiple units require urgent roof and cladding work." },
      { id: 9, name: "Ocean Terminal", address: "Ocean Drive, Leith, Edinburgh", postcode: "EH6 6JJ", propertyType: "retail", yearBuilt: 2001, floorArea: 30000, storeys: 3, epcRating: "C", epcScore: 52, riskScore: 30, riskLevel: "low", complianceStatus: "compliant", lettable: 1, meesCompliant: 1, estimatedRetrofitCost: 350000, yearsToDeadline: 4, estimatedPaybackYears: 4, notes: "Waterfront shopping centre and leisure complex. Good energy performance with recent HVAC upgrades." },
      { id: 10, name: "Baltic Triangle Warehouse", address: "Jamaica Street, Liverpool", postcode: "L1 0AF", propertyType: "industrial", yearBuilt: 1920, floorArea: 8500, storeys: 4, epcRating: "E", epcScore: 98, riskScore: 78, riskLevel: "high", complianceStatus: "non_compliant", lettable: 0, meesCompliant: 0, estimatedRetrofitCost: 1850000, yearsToDeadline: 4, estimatedPaybackYears: 9, notes: "Grade II listed former warehouse in creative quarter. Heritage constraints complicate retrofit. Conversion to creative workspace planned." },
      { id: 11, name: "Cambridge Science Park", address: "Milton Road, Cambridge", postcode: "CB4 0FW", propertyType: "office", yearBuilt: 2018, floorArea: 25000, storeys: 4, epcRating: "A", epcScore: 22, riskScore: 12, riskLevel: "low", complianceStatus: "compliant", lettable: 1, meesCompliant: 1, estimatedRetrofitCost: 45000, yearsToDeadline: 4, estimatedPaybackYears: 2, notes: "State-of-the-art lab and office space. BREEAM Excellent rated. Ground source heat pump and on-site solar generation." },
      { id: 12, name: "Royal Liver Building", address: "Pier Head, Liverpool", postcode: "L3 1HU", propertyType: "office", yearBuilt: 1911, floorArea: 27000, storeys: 13, epcRating: "E", epcScore: 95, riskScore: 75, riskLevel: "high", complianceStatus: "at_risk", lettable: 1, meesCompliant: 0, estimatedRetrofitCost: 2200000, yearsToDeadline: 4, estimatedPaybackYears: 8, notes: "Grade I listed iconic building on Liverpool waterfront. UNESCO World Heritage Site buffer zone. Significant heritage constraints on retrofit options." },
    ];

    for (const prop of realProperties) {
      await db.update(properties).set({
        name: prop.name,
        address: prop.address,
        postcode: prop.postcode,
        propertyType: prop.propertyType,
        yearBuilt: prop.yearBuilt,
        floorArea: prop.floorArea,
        storeys: prop.storeys,
        epcRating: prop.epcRating,
        epcScore: prop.epcScore,
        riskScore: prop.riskScore,
        riskLevel: prop.riskLevel,
        complianceStatus: prop.complianceStatus,
        lettable: prop.lettable,
        meesCompliant: prop.meesCompliant,
        estimatedRetrofitCost: prop.estimatedRetrofitCost,
        yearsToDeadline: prop.yearsToDeadline,
        estimatedPaybackYears: prop.estimatedPaybackYears,
        notes: prop.notes,
      }).where(eq(properties.id, prop.id));
    }

    console.log(`✅ Updated ${realProperties.length} properties with real UK data`);

    console.log("💰 Phase 3: Updating capex items...");

    // Delete all existing capex items for our 12 properties and re-insert with correct schema
    for (let i = 1; i <= 12; i++) {
      await db.delete(capexItems).where(eq(capexItems.propertyId, i));
    }

    const capexData = [
      { propertyId: 1, title: "Heritage-Sensitive HVAC Modernisation", description: "Replace aging HVAC systems with heritage-compatible high-efficiency units. LED lighting throughout. Smart BMS installation.", category: "energy_efficiency", estimatedCost: 1800000, priority: "high", timeline: "2025-2027", roi: 14, status: "planned" },
      { propertyId: 1, title: "Roof Insulation & Solar PV", description: "Improve roof thermal performance and install discreet solar PV panels where heritage consent allows.", category: "retrofit", estimatedCost: 1400000, priority: "medium", timeline: "2026-2027", roi: 11, status: "planned" },
      { propertyId: 2, title: "Facade & Glazing Upgrade", description: "Secondary glazing installation across 50 floors. Significant energy savings from reduced heat loss.", category: "retrofit", estimatedCost: 3200000, priority: "high", timeline: "2025-2028", roi: 12, status: "planned" },
      { propertyId: 2, title: "Smart Building Controls", description: "AI-driven BMS upgrade for optimised HVAC scheduling and occupancy-based energy management.", category: "energy_efficiency", estimatedCost: 1300000, priority: "medium", timeline: "2025-2026", roi: 22, status: "planned" },
      { propertyId: 3, title: "Full Retail Centre Energy Retrofit", description: "Roof insulation, HVAC replacement, LED lighting across 139,000 sqm. Phased approach to minimise tenant disruption.", category: "retrofit", estimatedCost: 4200000, priority: "critical", timeline: "2025-2027", roi: 9, status: "planned" },
      { propertyId: 3, title: "Building Fabric Improvements", description: "External wall insulation, entrance draught lobbies, and improved glazing for anchor tenant units.", category: "retrofit", estimatedCost: 1600000, priority: "high", timeline: "2026-2027", roi: 8, status: "planned" },
      { propertyId: 6, title: "Solar PV & Battery Storage", description: "Large-scale rooftop solar installation with battery storage for peak demand management.", category: "energy_efficiency", estimatedCost: 1200000, priority: "medium", timeline: "2025-2026", roi: 18, status: "in_progress" },
      { propertyId: 6, title: "HVAC System Replacement", description: "Replace 1990-era heating and cooling systems with modern heat pump technology.", category: "energy_efficiency", estimatedCost: 900000, priority: "high", timeline: "2026-2027", roi: 15, status: "planned" },
      { propertyId: 8, title: "Industrial Roof & Cladding Replacement", description: "Replace asbestos-containing roof panels with insulated composite panels across all units.", category: "retrofit", estimatedCost: 2400000, priority: "critical", timeline: "2025-2026", roi: 7, status: "planned" },
      { propertyId: 8, title: "Unit Heating Upgrades", description: "Replace gas-fired radiant heaters with modern infrared heating and improved controls.", category: "energy_efficiency", estimatedCost: 1000000, priority: "high", timeline: "2026", roi: 10, status: "planned" },
      { propertyId: 10, title: "Heritage Warehouse Thermal Upgrade", description: "Internal insulation, secondary glazing, and heat pump installation within listed building constraints.", category: "retrofit", estimatedCost: 1200000, priority: "high", timeline: "2025-2027", roi: 11, status: "planned" },
      { propertyId: 10, title: "Creative Workspace Fit-Out", description: "Energy-efficient fit-out for creative workspace conversion including LED lighting and smart controls.", category: "energy_efficiency", estimatedCost: 650000, priority: "medium", timeline: "2026-2027", roi: 16, status: "planned" },
      { propertyId: 12, title: "Grade I Listed Heating Modernisation", description: "Replace outdated heating system with discreet air-source heat pumps. Draught-proofing of original windows.", category: "retrofit", estimatedCost: 1500000, priority: "high", timeline: "2026-2028", roi: 9, status: "planned" },
      { propertyId: 12, title: "Internal Wall Insulation", description: "Sympathetic internal insulation to improve thermal performance while preserving listed interior features.", category: "retrofit", estimatedCost: 700000, priority: "medium", timeline: "2027-2028", roi: 8, status: "planned" },
    ];

    for (const item of capexData) {
      await db.insert(capexItems).values({
        propertyId: item.propertyId,
        title: item.title,
        description: item.description,
        category: item.category,
        estimatedCost: item.estimatedCost,
        priority: item.priority,
        timeline: item.timeline,
        roi: item.roi,
        status: item.status,
      });
    }

    console.log(`✅ Inserted ${capexData.length} capex items`);

    // Verify
    const remaining = await db.select({ id: properties.id, name: properties.name, postcode: properties.postcode, epcRating: properties.epcRating, riskLevel: properties.riskLevel }).from(properties).orderBy(properties.id);
    console.log("\n📋 Final property list:");
    for (const p of remaining) {
      console.log(`  ${p.id}: ${p.name} (${p.postcode}) - EPC ${p.epcRating} - ${p.riskLevel} risk`);
    }

    console.log("\n✨ Cleanup and reseed complete!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

cleanup();

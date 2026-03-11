import { drizzle } from "drizzle-orm/mysql2";
import { properties } from "./drizzle/schema.ts";

const db = drizzle(process.env.DATABASE_URL);

async function main() {
  const rows = await db.select({
    id: properties.id,
    name: properties.name,
    postcode: properties.postcode,
    epcRating: properties.epcRating,
    riskLevel: properties.riskLevel,
  }).from(properties).orderBy(properties.id);
  
  console.log(JSON.stringify(rows, null, 2));
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });

/**
 * EPC Data Service
 * Retrieves real Energy Performance Certificate data from the UK Government
 * Source: https://find-energy-certificate.service.gov.uk/
 *
 * This service scrapes the gov.uk Find Energy Certificate service
 * to get real EPC data by postcode, including ratings, scores,
 * property details, and improvement recommendations.
 */

export interface EPCCertificate {
  address: string;
  postcode: string;
  epcRating: string; // A-G
  epcScore: number; // 0-100 (SAP score)
  potentialRating: string;
  potentialScore: number;
  propertyType: string;
  builtForm: string;
  floorArea: number;
  energyCostsAnnual: number;
  co2Emissions: number;
  certificateNumber: string;
  inspectionDate: string;
  expiryDate: string;
  recommendations: EPCRecommendation[];
  totalUpgradeCost: number;
  wallDescription: string;
  roofDescription: string;
  windowDescription: string;
  heatingDescription: string;
  hotWaterDescription: string;
}

export interface EPCRecommendation {
  improvement: string;
  indicativeCost: string;
  typicalSaving: string;
}

interface SearchResult {
  address: string;
  epcRating: string;
  validUntil: string;
  certificateUrl: string;
}

/**
 * Format postcode to standard UK format (e.g., "SW1A 2AA")
 */
function formatPostcode(postcode: string): string {
  const clean = postcode.replace(/\s+/g, "").toUpperCase();
  if (clean.length > 3) {
    return clean.slice(0, -3) + " " + clean.slice(-3);
  }
  return clean;
}

/**
 * Search for EPC certificates by postcode using gov.uk service
 */
async function searchByPostcode(postcode: string): Promise<SearchResult[]> {
  const formatted = formatPostcode(postcode);
  const url = `https://find-energy-certificate.service.gov.uk/find-a-certificate/search-by-postcode?postcode=${encodeURIComponent(formatted)}`;

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; Veridia/1.0)",
        Accept: "text/html",
      },
    });

    if (!response.ok) {
      console.log(`EPC search returned ${response.status} for ${formatted}`);
      return [];
    }

    const html = await response.text();

    // Check for "No results" page
    if (html.includes("No results for") || html.includes("There are no results")) {
      return [];
    }

    // Parse search results from HTML
    const results: SearchResult[] = [];

    // The gov.uk results page uses <th> for address (not <td>) and <td> for rating/date
    // Structure: <th><a href="/energy-certificate/...">Address</a></th><td>Rating</td><td><span>Date</span></td>
    const rowRegex = /<a[^>]*href="(\/energy-certificate\/[^"]+)"[^>]*>\s*([\s\S]*?)\s*<\/a>[\s\S]*?<td[^>]*>\s*([A-G])\s*<\/td>[\s\S]*?<td[^>]*[^>]*>\s*(?:<span>)?\s*([^<]+?)\s*(?:<\/span>)?\s*<\/td>/gi;
    let match;

    while ((match = rowRegex.exec(html)) !== null) {
      results.push({
        certificateUrl: `https://find-energy-certificate.service.gov.uk${match[1].trim()}`,
        address: match[2].replace(/\s+/g, " ").trim(),
        epcRating: match[3].trim(),
        validUntil: match[4].replace(/\s+/g, " ").trim(),
      });
    }

    // Fallback: try to find certificate links if table parsing fails
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
            validUntil: "",
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

/**
 * Fetch full certificate details from a certificate URL
 */
async function fetchCertificateDetails(
  certUrl: string,
  searchResult: SearchResult
): Promise<EPCCertificate> {
  try {
    const response = await fetch(certUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; Veridia/1.0)",
        Accept: "text/html",
      },
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

/**
 * Parse certificate HTML page to extract all EPC data
 */
function parseCertificateHtml(html: string, searchResult: SearchResult): EPCCertificate {
  // Extract certificate number from URL or page
  const certNumMatch = html.match(/Certificate number[\s\S]*?<[^>]*>([0-9\-]+)<\/[^>]*>/i);
  const certificateNumber = certNumMatch ? certNumMatch[1].trim() : "";

  // Extract current rating and score
  const ratingMatch = html.match(/energy rating is ([A-G])/i);
  const scoreMatch = html.match(/with a score of (\d+)/i);
  const currentRating = ratingMatch ? ratingMatch[1] : searchResult.epcRating;
  const currentScore = scoreMatch ? parseInt(scoreMatch[1]) : ratingToScore(searchResult.epcRating);

  // Extract potential rating and score
  const potentialRatingMatch = html.match(/potential to be ([A-G])/i);
  const potentialScoreMatch = html.match(/potential energy rating of [A-G] with a score of (\d+)/i);
  const potentialRating = potentialRatingMatch ? potentialRatingMatch[1] : improvePotentialRating(currentRating);
  const potentialScore = potentialScoreMatch ? parseInt(potentialScoreMatch[1]) : ratingToScore(potentialRating);

  // Extract property type (uses <dd> tag in summary list)
  const propTypeMatch = html.match(/Property type[\s\S]*?<dd[^>]*>\s*([^<]+?)\s*<\/dd>/i);
  const propertyType = propTypeMatch ? propTypeMatch[1].trim() : "Unknown";

  // Extract floor area ("78 square metres" in <dd> tag)
  const floorAreaMatch = html.match(/(\d+)\s*square\s*metres/i);
  const floorArea = floorAreaMatch ? parseInt(floorAreaMatch[1]) : 0;

  // Extract energy costs ("£847 per year" inside <span>)
  const costMatch = html.match(/spend\s*<[^>]*>£([\d,]+)\s*per year/i);
  const energyCostsAnnual = costMatch ? parseInt(costMatch[1].replace(/,/g, "")) : estimateEnergyCost(currentRating, floorArea);

  // Extract potential savings
  const savingsMatch = html.match(/save £([\d,]+) per year/i);

  // Extract CO2 emissions
  const co2Match = html.match(/This property produces[\s\S]*?([\d.]+)\s*tonnes/i);
  const co2Emissions = co2Match ? parseFloat(co2Match[1]) : estimateCO2(currentRating, floorArea);

  // Extract valid until date
  const validMatch = html.match(/Valid until[\s\S]*?<[^>]*>([^<]+)<\/[^>]*>/i);
  const expiryDate = validMatch ? validMatch[1].trim() : searchResult.validUntil;

  // Extract feature descriptions
  const wallMatch = html.match(/wall[s]?\s*(?:insulation)?[\s\S]*?<td[^>]*>([^<]*(?:brick|stone|cavity|solid|timber|insul)[^<]*)<\/td>/i);
  const roofMatch = html.match(/roof[\s\S]*?<td[^>]*>([^<]*(?:roof|loft|insul|slate|tile)[^<]*)<\/td>/i);
  const windowMatch = html.match(/((?:single|double|triple)\s*glaz[^<]*)/i);
  const heatingMatch = html.match(/((?:boiler|heat pump|electric|gas|oil)[^<]*(?:radiator|underfloor|warm air)?[^<]*)/i);

  // Extract improvement recommendations
  const recommendations = parseRecommendations(html);

  // Calculate total upgrade cost
  let totalUpgradeCost = 0;
  for (const rec of recommendations) {
    const costParts = rec.indicativeCost.match(/£([\d,]+)/g);
    if (costParts && costParts.length > 0) {
      // Take the higher estimate
      const lastCost = costParts[costParts.length - 1];
      totalUpgradeCost += parseInt(lastCost.replace(/[£,]/g, "")) || 0;
    }
  }
  if (totalUpgradeCost === 0) {
    totalUpgradeCost = estimateUpgradeCost(currentRating);
  }

  // Extract postcode from address
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
    hotWaterDescription: "",
  };
}

/**
 * Parse improvement recommendations from certificate HTML
 */
function parseRecommendations(html: string): EPCRecommendation[] {
  const recommendations: EPCRecommendation[] = [];

  // Match step sections using the gov.uk summary list structure:
  // <h3>Step N: Title</h3> ... <dd>£cost</dd> ... <dd>£saving</dd>
  const stepRegex = /Step \d+:\s*([^<]+)<\/h3>[\s\S]*?Typical installation cost[\s\S]*?<dd[^>]*>\s*(£[\d,]+\s*-\s*£[\d,]+)\s*<\/dd>[\s\S]*?Typical yearly saving[\s\S]*?<dd[^>]*>\s*(£[\d,]+)\s*<\/dd>/gi;
  let match;

  while ((match = stepRegex.exec(html)) !== null) {
    recommendations.push({
      improvement: match[1].trim(),
      indicativeCost: match[2].trim(),
      typicalSaving: match[3].trim(),
    });
  }

  return recommendations;
}

/**
 * Convert EPC rating letter to approximate score
 */
function ratingToScore(rating: string): number {
  const scores: Record<string, number> = {
    A: 95,
    B: 85,
    C: 74,
    D: 60,
    E: 46,
    F: 30,
    G: 10,
  };
  return scores[rating] || 50;
}

/**
 * Estimate potential rating improvement
 */
function improvePotentialRating(currentRating: string): string {
  const improvement: Record<string, string> = {
    A: "A",
    B: "A",
    C: "B",
    D: "C",
    E: "C",
    F: "D",
    G: "E",
  };
  return improvement[currentRating] || "C";
}

/**
 * Estimate annual energy cost based on rating and floor area
 */
function estimateEnergyCost(rating: string, floorArea: number): number {
  const area = floorArea || 80;
  const costPerSqm: Record<string, number> = {
    A: 5,
    B: 7,
    C: 10,
    D: 13,
    E: 17,
    F: 22,
    G: 28,
  };
  return Math.round((costPerSqm[rating] || 13) * area);
}

/**
 * Estimate CO2 emissions based on rating and floor area
 */
function estimateCO2(rating: string, floorArea: number): number {
  const area = floorArea || 80;
  const co2PerSqm: Record<string, number> = {
    A: 0.01,
    B: 0.02,
    C: 0.03,
    D: 0.05,
    E: 0.07,
    F: 0.09,
    G: 0.12,
  };
  return Math.round((co2PerSqm[rating] || 0.05) * area * 10) / 10;
}

/**
 * Estimate upgrade cost based on current EPC rating
 */
function estimateUpgradeCost(currentRating: string): number {
  const costEstimates: Record<string, number> = {
    A: 0,
    B: 2000,
    C: 5000,
    D: 12000,
    E: 25000,
    F: 40000,
    G: 60000,
  };
  return costEstimates[currentRating] || 15000;
}

/**
 * Create a basic certificate from search result when full details can't be fetched
 */
function createBasicCertificate(searchResult: SearchResult): EPCCertificate {
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
    hotWaterDescription: "",
  };
}

/**
 * Normalize address for comparison
 */
function normalizeAddress(address: string): string {
  return address
    .toLowerCase()
    .replace(/[,.\-\/\\]/g, " ")
    .replace(/\b(flat|apartment|apt|unit|floor|suite)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Calculate similarity between two addresses (0-1)
 */
function addressSimilarity(a: string, b: string): number {
  const wordsA = new Set(a.split(" ").filter((w) => w.length > 1));
  const wordsB = new Set(b.split(" ").filter((w) => w.length > 1));

  if (wordsA.size === 0 || wordsB.size === 0) return 0;

  let matches = 0;
  Array.from(wordsA).forEach((word) => {
    if (wordsB.has(word)) matches++;
  });

  return matches / Math.max(wordsA.size, wordsB.size);
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Look up EPC data by postcode
 * Returns all certificates found for the given postcode
 */
export async function lookupEPCByPostcodeNonDomestic(postcode: string): Promise<EPCCertificate[]> {
  try {
    const clean = postcode.replace(/\s+/g, "").toUpperCase();
    const formatted = clean.slice(0, -3) + " " + clean.slice(-3);
    const token = process.env.EPC_BEARER_TOKEN || "ChBGhlnWUhH2bgaYjBOWrEwEuaZOyOpUqqZo3cHzrazh9BDmMwHZ5S6MXknlNgWv";
    
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
    
    return rows.map((row: any) => ({
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
      hotWaterDescription: "",
    }));
  } catch (error) {
    console.error("Non-domestic EPC lookup error:", error);
    return [];
  }
}

export async function lookupEPCByPostcode(postcode: string): Promise<EPCCertificate[]> {
  try {
    const searchResults = await searchByPostcode(postcode);

    if (searchResults.length === 0) {
      console.log(`No EPC results found for postcode: ${postcode}`);
      return [];
    }

    // Fetch full details for each certificate (limit to first 20 to avoid rate limiting)
    const limitedResults = searchResults.slice(0, 20);
    const certificates: EPCCertificate[] = [];

    for (const result of limitedResults) {
      const cert = await fetchCertificateDetails(result.certificateUrl, result);
      certificates.push(cert);
      // Small delay to be respectful to the service
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    return certificates;
  } catch (error) {
    console.error("EPC lookup error:", error);
    return [];
  }
}

/**
 * Look up EPC data by postcode and match to a specific address
 * Returns the best matching certificate or null
 */
export async function lookupEPCByAddress(
  postcode: string,
  addressQuery: string
): Promise<EPCCertificate | null> {
  const certificates = await lookupEPCByPostcode(postcode);

  if (certificates.length === 0) return null;

  // Try to find best match by address similarity
  const normalizedQuery = normalizeAddress(addressQuery);

  let bestMatch: EPCCertificate | null = null;
  let bestScore = 0;

  for (const cert of certificates) {
    const normalizedCert = normalizeAddress(cert.address);
    const score = addressSimilarity(normalizedQuery, normalizedCert);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = cert;
    }
  }

  // Return best match if similarity is above threshold
  if (bestScore > 0.3 && bestMatch) {
    return bestMatch;
  }

  // If no good match, return the first certificate as fallback
  return certificates[0] || null;
}

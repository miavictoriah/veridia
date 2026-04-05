import { useEffect, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { DashboardNav } from "@/components/DashboardNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Download, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { formatCurrency } from "@/lib/formatters";
import { showToast } from "@/components/Toast";

interface DealFormData {
  address: string;
  assetType: "office" | "retail" | "industrial" | "mixed_use" | "other";
  epcRating: "A" | "B" | "C" | "D" | "E" | "F" | "G" | "unknown";
  grossInternalArea: number;
  holdPeriod: "1-3" | "3-5" | "5-10" | "10+";
}

interface DealResult {
  currentEpcRating: string;
  meesCompliant: boolean;
  meesDeadline: string;
  retrofitCapexLow: number;
  retrofitCapexMid: number;
  retrofitCapexHigh: number;
  floodRiskZone: string;
  floodRiskLevel: string;
  strandedAssetRiskScore: number;
  underwritingFlag: "proceed" | "price_in_capex" | "high_risk";
  dataSource: string;
  fetchedAt: string;
}

export default function DealScreen() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState<DealFormData>({
    address: "",
    assetType: "office",
    epcRating: "unknown",
    grossInternalArea: 0,
    holdPeriod: "5-10",
  });
  const [result, setResult] = useState<DealResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [noEpcCertificate, setNoEpcCertificate] = useState(false);
  const epcLookup = trpc.properties.lookupEPC.useQuery(
    { postcode: "", address: "" },
    { enabled: false }
  );
  useEffect(() => {
    const email = localStorage.getItem("veridia_email");
  
    if (!email) {
      window.location.href = "/";
      return;
    }

    fetch("/api/check-usage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.allowed) {
          alert("Your free report has been used. Upgrade to continue.");
          window.location.href = "/";
        }
      })
      .catch(() => {
        window.location.href = "/";
      });
  }, []);

  const storedEmail = localStorage.getItem("veridia_email");

  if (!storedEmail) {
    setLocation("/");
    return null;
  }

  const mapAssetType = (raw: string): DealFormData["assetType"] => {
    const value = raw.toLowerCase();
    if (value.includes("office")) return "office";
    if (value.includes("retail") || value.includes("shop")) return "retail";
    if (value.includes("industrial") || value.includes("warehouse")) return "industrial";
    if (value.includes("mixed")) return "mixed_use";
    return "other";
  };

  const mapRatingBand = (raw: string): DealFormData["epcRating"] => {
    const first = raw.trim().toUpperCase().charAt(0);
    if (["A", "B", "C", "D", "E", "F", "G"].includes(first)) {
      return first as DealFormData["epcRating"];
    }
    return "unknown";
  };

  const fetchEpcData = async (
    postcode: string,
    address: string
  ): Promise<{ assetType: DealFormData["assetType"]; epcRating: DealFormData["epcRating"] } | null> => {
    try {
      const response = await fetch(`/api/epc?postcode=${encodeURIComponent(postcode)}`);
      if (!response.ok) return null;
      const data = await response.json();
      if (!data || data.length === 0) return null;
      const cert = data[0];
      return {
        assetType: mapAssetType(cert.propertyType || ""),
        epcRating: mapRatingBand(cert.epcRating || ""),
      };
    } catch (error) {
      console.error("EPC fetch error:", error);
      return null;
    }
  };
    const calculateStrandedAssetRisk = (data: DealFormData): DealResult => {
    // EPC rating to numeric score (A=0, G=100)
    const epcScores: Record<string, number> = {
      A: 0,
      B: 15,
      C: 30,
      D: 45,
      E: 60,
      F: 75,
      G: 90,
      unknown: 50,
    };
    const epcScore = epcScores[data.epcRating] || 50;

    // Asset type risk multiplier
    const assetTypeRisk: Record<string, number> = {
      office: 1.2,
      retail: 1.0,
      industrial: 0.8,
      mixed_use: 1.1,
      other: 1.0,
    };
    const typeRisk = assetTypeRisk[data.assetType] || 1.0;

    // Hold period risk (longer hold = higher risk)
    const holdPeriodRisk: Record<string, number> = {
      "1-3": 0.7,
      "3-5": 0.85,
      "5-10": 1.0,
      "10+": 1.3,
    };
    const periodRisk = holdPeriodRisk[data.holdPeriod] || 1.0;

    // Calculate final risk score (0-100)
    const baseRisk = epcScore * typeRisk * periodRisk;
    const strandedAssetRiskScore = Math.min(100, Math.round(baseRisk));

    // Determine underwriting flag
    let underwritingFlag: "proceed" | "price_in_capex" | "high_risk";
    if (strandedAssetRiskScore <= 30) {
      underwritingFlag = "proceed";
    } else if (strandedAssetRiskScore <= 65) {
      underwritingFlag = "price_in_capex";
    } else {
      underwritingFlag = "high_risk";
    }

    // Estimate retrofit capex based on asset type and GIA
    const defaultGIAByType: Record<DealFormData["assetType"], number> = {
      office: 5000,
      retail: 3000,
      industrial: 10000,
      mixed_use: 5000,
      other: 5000,
    };
    const effectiveArea =
      data.grossInternalArea && data.grossInternalArea > 0
        ? data.grossInternalArea
        : defaultGIAByType[data.assetType] ?? defaultGIAByType.other;
    const capexPerSqFt: Record<string, { low: number; mid: number; high: number }> = {
      office: { low: 15, mid: 25, high: 40 },
      retail: { low: 12, mid: 20, high: 35 },
      industrial: { low: 8, mid: 15, high: 25 },
      mixed_use: { low: 14, mid: 22, high: 38 },
      other: { low: 12, mid: 20, high: 30 },
    };
    const rates = capexPerSqFt[data.assetType] || capexPerSqFt.other;
    const retrofitCapexLow = Math.round(effectiveArea * rates.low);
    const retrofitCapexMid = Math.round(effectiveArea * rates.mid);
    const retrofitCapexHigh = Math.round(effectiveArea * rates.high);

    // MEES compliance check
    const meesCompliant = epcScore <= 50; // D rating or better
    const meesDeadline = "2030";

    return {
      currentEpcRating: data.epcRating === "unknown" ? "Data not available" : data.epcRating,
      meesCompliant,
      meesDeadline,
      retrofitCapexLow,
      retrofitCapexMid,
      retrofitCapexHigh,
      floodRiskZone: "Zone 2", // Placeholder - would be fetched from API
      floodRiskLevel: "low",
      strandedAssetRiskScore,
      underwritingFlag,
      dataSource: "EPC Registry, Environment Agency, Veridia Models",
      fetchedAt: new Date().toISOString(),
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.address) {
      showToast("Please enter a postcode", "error");
      return;
    }

    const postcode = formData.address.replace(/\s+/g, "").toUpperCase();
    setLoading(true);
    setNoEpcCertificate(false);

    (async () => {
      try {
        const epc = await fetchEpcData(postcode, formData.address);
        let updatedFormData = { ...formData };

        if (epc) {
          updatedFormData = {
            ...updatedFormData,
            assetType: epc.assetType,
            epcRating: epc.epcRating,
          };
        } else {
          setNoEpcCertificate(true);
          updatedFormData = {
            ...updatedFormData,
            assetType: "other",
            epcRating: "unknown",
          };
        }

        const dealResult = calculateStrandedAssetRisk(updatedFormData);
        setResult(dealResult);
      } catch {
        setNoEpcCertificate(true);
        const dealResult = calculateStrandedAssetRisk({
          ...formData,
          assetType: "other",
          epcRating: "unknown",
        });
        setResult(dealResult);
      } finally {
        setLoading(false);
      }
    })();
  };
  const email = localStorage.getItem("veridia_email");

  if (email) {
    fetch("/api/increment-usage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }).catch(() => {});
  }
  const getRiskColor = (score: number) => {
    if (score <= 30) return "bg-green-50 border-green-200";
    if (score <= 65) return "bg-amber-50 border-amber-200";
    return "bg-red-50 border-red-200";
  };

  const getRiskTextColor = (score: number) => {
    if (score <= 30) return "text-green-700";
    if (score <= 65) return "text-amber-700";
    return "text-red-700";
  };

  const getUnderwritingColor = (flag: string) => {
    if (flag === "proceed") return "bg-green-100 text-green-800";
    if (flag === "price_in_capex") return "bg-amber-100 text-amber-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <DashboardNav />

      <div className="lg:ml-60 pt-14 lg:pt-0">
        {/* Header */}
        <div className="border-b border-gray-100 bg-white">
          <div className="px-6 lg:px-8 py-6">
            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Deal Screen</h1>
            <p className="text-[13px] text-gray-400 mt-1">Assess stranded asset risk and retrofit capex for any property</p>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Input Form */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-base">Property Details</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address or Postcode *</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="e.g., SW1A 1AA"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    {noEpcCertificate && (
                      <p className="mt-2 text-xs text-gray-600">
                        No EPC certificate found for this postcode. You can check manually at the government register.
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gross Internal Area (sq ft)</label>
                    <input
                      type="number"
                      value={formData.grossInternalArea || ""}
                      onChange={(e) => setFormData({ ...formData, grossInternalArea: parseInt(e.target.value) || 0 })}
                      placeholder="e.g., 50000"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">Optional — leave blank for auto-estimate</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Target Hold Period *</label>
                    <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                      {[
                        { value: "1-3", label: "1-3 years" },
                        { value: "3-5", label: "3-5 years" },
                        { value: "5-10", label: "5-10 years" },
                        { value: "10+", label: "10+ years" },
                      ].map((option) => {
                        const selected = formData.holdPeriod === option.value;
                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => setFormData({ ...formData, holdPeriod: option.value as DealFormData["holdPeriod"] })}
                            className={`flex h-16 flex-col items-start justify-center rounded-lg border px-3 text-left text-xs font-medium transition-colors ${
                              selected
                                ? "bg-teal-50 text-teal-900"
                                : "bg-white text-gray-700 hover:bg-gray-50"
                            }`}
                            style={selected ? { borderColor: "#00C9A7" } : undefined}
                          >
                            {option.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <Button type="submit" disabled={loading} className="w-full bg-teal-600 hover:bg-teal-700 text-white">
                    {loading ? "Analyzing..." : "Generate Report"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Results */}
            {result && (
              <div className="lg:col-span-2 space-y-6">
                {/* Risk Score - Large and Prominent */}
                <Card className={`border-2 ${getRiskColor(result.strandedAssetRiskScore)}`}>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-600 mb-2">Stranded Asset Risk Score</p>
                      <p className={`text-6xl font-bold ${getRiskTextColor(result.strandedAssetRiskScore)}`}>
                        {result.strandedAssetRiskScore}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {result.strandedAssetRiskScore <= 30 && "Low risk - Good candidate"}
                        {result.strandedAssetRiskScore > 30 && result.strandedAssetRiskScore <= 65 && "Moderate risk - Price in capex"}
                        {result.strandedAssetRiskScore > 65 && "High risk - Further review required"}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Underwriting Flag */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Underwriting Recommendation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      {result.underwritingFlag === "proceed" && <CheckCircle className="w-6 h-6 text-green-600" />}
                      {result.underwritingFlag === "price_in_capex" && <AlertTriangle className="w-6 h-6 text-amber-600" />}
                      {result.underwritingFlag === "high_risk" && <XCircle className="w-6 h-6 text-red-600" />}
                      <div>
                        <p className="font-semibold text-gray-900">
                          {result.underwritingFlag === "proceed" && "Proceed"}
                          {result.underwritingFlag === "price_in_capex" && "Price In CapEx"}
                          {result.underwritingFlag === "high_risk" && "High Risk — Further Review Required"}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {result.underwritingFlag === "proceed" && "Property meets compliance standards with manageable retrofit costs."}
                          {result.underwritingFlag === "price_in_capex" && "Factor estimated retrofit costs into underwriting."}
                          {result.underwritingFlag === "high_risk" && "Significant retrofit capex or regulatory risk. Recommend detailed due diligence."}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-xs text-gray-500 mb-1">Current EPC Rating</p>
                      <p className="text-2xl font-bold text-gray-900">{result.currentEpcRating}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-xs text-gray-500 mb-1">MEES Compliant</p>
                      <p className="text-2xl font-bold text-gray-900">{result.meesCompliant ? "Yes" : "No"}</p>
                      <p className="text-xs text-gray-400 mt-1">Deadline: {result.meesDeadline}</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Retrofit Capex */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Estimated Retrofit CapEx Range</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">Low Estimate</span>
                      <span className="font-semibold text-gray-900">{formatCurrency(result.retrofitCapexLow)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-teal-50 rounded-lg border border-teal-100">
                      <span className="text-sm text-gray-600">Mid Estimate</span>
                      <span className="font-semibold text-teal-900">{formatCurrency(result.retrofitCapexMid)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">High Estimate</span>
                      <span className="font-semibold text-gray-900">{formatCurrency(result.retrofitCapexHigh)}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Flood Risk */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Flood Risk Assessment</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Flood Risk Zone</span>
                        <span className="font-medium text-gray-900">{result.floodRiskZone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Risk Level</span>
                        <Badge variant="outline" className="capitalize">{result.floodRiskLevel}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Data Sources */}
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="pt-6">
                    <div className="flex gap-2 mb-3">
                      <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-blue-900 mb-1">Data Sources & Disclaimer</p>
                        <p className="text-xs text-blue-700 mb-2">
                          Sources: {result.dataSource}
                        </p>
                        <p className="text-xs text-blue-700 mb-2">
                          Fetched: {new Date(result.fetchedAt).toLocaleString()}
                        </p>
                        <p className="text-xs text-blue-700 italic">
                          This report is for informational and analytical purposes only. It does not constitute legal, valuation, or investment advice. All estimates are based on publicly available data and modelled assumptions. Veridia accepts no liability for decisions made on the basis of this report.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Export Button */}
                <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white gap-2">
                  <Download className="w-4 h-4" />
                  Export as PDF
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
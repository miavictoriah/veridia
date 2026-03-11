import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, Clock, MapPin, Building2, TrendingUp, PoundSterling, Shield, Zap, ArrowRight } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface PropertyData {
  id: number;
  name: string;
  address: string;
  postcode?: string | null;
  propertyType: string;
  epcRating?: string | null;
  epcScore?: number | null;
  epcDate?: string | null;
  epcExpiry?: string | null;
  riskScore?: number | null;
  riskLevel?: string | null;
  complianceStatus?: string | null;
  lettable?: number | null;
  meesCompliant?: number | null;
  estimatedRetrofitCost?: number | null;
  yearBuilt?: number | null;
  floorArea?: number | null;
  storeys?: number | null;
  estimatedPaybackYears?: number | null;
  yearsToDeadline?: number | null;
  notes?: string | null;
  epcRecommendations?: string | null;
  epcDataSource?: string | null;
  energyCostsAnnual?: number | null;
  co2Emissions?: number | null;
  // Flood risk
  floodRiskZone?: string | null;
  floodRiskLevel?: string | null;
  floodRiskSource?: string | null;
  // Land Registry
  landRegistryTitle?: string | null;
  tenureType?: string | null;
  registeredOwner?: string | null;
  lastSalePrice?: number | null;
  lastSaleDate?: string | null;
  // Planning
  planningZone?: string | null;
  nearbyPlanningApps?: number | null;
  planningConstraints?: string | null;
  localAuthority?: string | null;
  units?: number | null;
}

interface PropertyDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  property?: PropertyData | null;
}

export function PropertyDetailModal({ isOpen, onClose, property }: PropertyDetailModalProps) {
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch real capex items for this property
  const { data: capexItems } = trpc.capex.items.useQuery(
    { propertyId: property?.id ?? 0 },
    { enabled: !!property?.id && isOpen }
  );

  // Fetch compliance violations
  const { data: violations } = trpc.compliance.violations.useQuery(
    { propertyId: property?.id ?? 0 },
    { enabled: !!property?.id && isOpen }
  );

  if (!property) return null;

  const getRiskColor = (score: number) => {
    if (score >= 70) return "text-red-600";
    if (score >= 50) return "text-amber-600";
    return "text-green-600";
  };

  const getRiskBg = (score: number) => {
    if (score >= 70) return "bg-red-50 border-red-200";
    if (score >= 50) return "bg-amber-50 border-amber-200";
    return "bg-green-50 border-green-200";
  };

  const getEpcColor = (rating: string) => {
    const colors: Record<string, string> = {
      A: "bg-green-500 text-white",
      B: "bg-green-400 text-white",
      C: "bg-yellow-400 text-black",
      D: "bg-orange-400 text-white",
      E: "bg-orange-500 text-white",
      F: "bg-red-400 text-white",
      G: "bg-red-500 text-white",
    };
    return colors[rating] || "bg-gray-300 text-gray-700";
  };

  // Parse EPC recommendations if available
  let recommendations: any[] = [];
  try {
    if (property.epcRecommendations) {
      recommendations = JSON.parse(property.epcRecommendations);
    }
  } catch { /* ignore parse errors */ }

  const totalCapex = capexItems?.reduce((sum, item) => sum + item.estimatedCost, 0) || property.estimatedRetrofitCost || 0;
  const avgRoi = capexItems && capexItems.length > 0
    ? Math.round(capexItems.reduce((sum, item) => sum + (item.roi || 0), 0) / capexItems.length)
    : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">{property.name}</DialogTitle>
          <DialogDescription className="flex items-center gap-2 mt-1">
            <MapPin className="w-4 h-4" />
            {property.address}{property.postcode ? `, ${property.postcode}` : ""}
          </DialogDescription>
        </DialogHeader>

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
          <div className="p-3 border rounded-lg text-center">
            <p className="text-[11px] text-muted-foreground mb-1">EPC Rating</p>
            <span className={`inline-flex items-center justify-center w-10 h-10 rounded-lg text-lg font-bold ${getEpcColor(property.epcRating || "?")}`}>
              {property.epcRating || "?"}
            </span>
          </div>
          <div className={`p-3 border rounded-lg text-center ${getRiskBg(property.riskScore || 0)}`}>
            <p className="text-[11px] text-muted-foreground mb-1">Risk Score</p>
            <p className={`text-2xl font-bold ${getRiskColor(property.riskScore || 0)}`}>{property.riskScore || 0}</p>
          </div>
          <div className="p-3 border rounded-lg text-center">
            <p className="text-[11px] text-muted-foreground mb-1">Retrofit Cost</p>
            <p className="text-lg font-bold">£{totalCapex >= 1000000 ? `${(totalCapex / 1000000).toFixed(1)}M` : `${(totalCapex / 1000).toFixed(0)}K`}</p>
          </div>
          <div className="p-3 border rounded-lg text-center">
            <p className="text-[11px] text-muted-foreground mb-1">Payback</p>
            <p className="text-lg font-bold">{property.estimatedPaybackYears || "—"} yrs</p>
          </div>
          <div className="p-3 border rounded-lg text-center">
            <p className="text-[11px] text-muted-foreground mb-1">MEES</p>
            <span className={`text-sm font-semibold ${property.meesCompliant ? "text-green-600" : "text-red-600"}`}>
              {property.meesCompliant ? "Compliant" : "Non-compliant"}
            </span>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="capex">Capex & ROI</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            <TabsTrigger value="violations">Violations</TabsTrigger>
          </TabsList>

          {/* OVERVIEW TAB */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2"><Building2 className="w-4 h-4" /> Property Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Type</span><span className="font-medium capitalize">{property.propertyType?.replace("_", " ")}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Year Built</span><span className="font-medium">{property.yearBuilt || "Unknown"}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Floor Area</span><span className="font-medium">{property.floorArea ? `${property.floorArea.toLocaleString()} sqm` : "—"}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Storeys</span><span className="font-medium">{property.storeys || "—"}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Lettable</span><span className={`font-medium ${property.lettable ? "text-green-600" : "text-red-600"}`}>{property.lettable ? "Yes" : "No"}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Data Source</span><span className="font-medium capitalize">{property.epcDataSource || "Manual"}</span></div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2"><Shield className="w-4 h-4" /> Compliance Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Status</span>
                    <Badge variant="outline" className={
                      property.complianceStatus === "compliant" ? "border-green-300 text-green-700" :
                      property.complianceStatus === "at_risk" ? "border-amber-300 text-amber-700" :
                      "border-red-300 text-red-700"
                    }>
                      {(property.complianceStatus || "unknown").replace("_", " ")}
                    </Badge>
                  </div>
                  <div className="flex justify-between"><span className="text-muted-foreground">EPC Score</span><span className="font-medium">{property.epcScore || "—"}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">EPC Date</span><span className="font-medium">{property.epcDate || "—"}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">EPC Expiry</span><span className="font-medium">{property.epcExpiry || "—"}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Annual Energy Cost</span><span className="font-medium">{property.energyCostsAnnual ? `£${property.energyCostsAnnual.toLocaleString()}` : "—"}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">CO₂ Emissions</span><span className="font-medium">{property.co2Emissions ? `${property.co2Emissions} t/yr` : "—"}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Years to Deadline</span><span className={`font-medium ${(property.yearsToDeadline || 0) <= 2 ? "text-red-600" : ""}`}>{property.yearsToDeadline || "—"}</span></div>
                </CardContent>
              </Card>
            </div>

            {/* Flood Risk, Land Registry, Planning */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                    Flood Risk
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Zone</span><span className="font-medium">{property.floodRiskZone || "—"}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Risk Level</span>
                    <Badge variant="outline" className={`text-xs capitalize ${
                      property.floodRiskLevel === "high" ? "border-red-300 text-red-700" :
                      property.floodRiskLevel === "medium" ? "border-amber-300 text-amber-700" :
                      property.floodRiskLevel === "low" ? "border-teal-300 text-teal-700" :
                      "border-green-300 text-green-700"
                    }`}>{(property.floodRiskLevel || "unknown").replace("_", " ")}</Badge>
                  </div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Source</span><span className="font-medium capitalize">{(property.floodRiskSource || "—").replace("_", " ")}</span></div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
                    Land Registry
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Title No.</span><span className="font-medium">{property.landRegistryTitle || "—"}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Tenure</span><span className="font-medium capitalize">{property.tenureType || "—"}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Owner</span><span className="font-medium text-right max-w-[140px] truncate" title={property.registeredOwner || ""}>{property.registeredOwner || "—"}</span></div>
                  {property.lastSalePrice && <div className="flex justify-between"><span className="text-muted-foreground">Last Sale</span><span className="font-medium">£{(property.lastSalePrice as number) >= 1000000000 ? `${((property.lastSalePrice as number) / 1000000000).toFixed(1)}B` : (property.lastSalePrice as number) >= 1000000 ? `${((property.lastSalePrice as number) / 1000000).toFixed(0)}M` : `${((property.lastSalePrice as number) / 1000).toFixed(0)}K`}</span></div>}
                  {property.lastSaleDate && <div className="flex justify-between"><span className="text-muted-foreground">Sale Date</span><span className="font-medium">{property.lastSaleDate}</span></div>}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21h18M3 7v1a3 3 0 006 0V7m0 1a3 3 0 006 0V7m0 1a3 3 0 006 0V7H3l2-4h14l2 4"/></svg>
                    Planning
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Authority</span><span className="font-medium text-right max-w-[140px] truncate" title={property.localAuthority || ""}>{property.localAuthority || "—"}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Zone</span><span className="font-medium capitalize">{(property.planningZone || "—").replace(/_/g, " ")}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Nearby Apps</span><span className="font-medium">{property.nearbyPlanningApps ?? "—"}</span></div>
                  {(() => {
                    let constraints: string[] = [];
                    try { constraints = property.planningConstraints ? JSON.parse(property.planningConstraints) : []; } catch {}
                    return constraints.length > 0 ? (
                      <div className="pt-1">
                        <p className="text-[11px] text-muted-foreground mb-1">Constraints</p>
                        <div className="flex flex-wrap gap-1">
                          {constraints.map((c, i) => <Badge key={i} variant="outline" className="text-[10px]">{c}</Badge>)}
                        </div>
                      </div>
                    ) : null;
                  })()}
                </CardContent>
              </Card>
            </div>

            {property.notes && (
              <Card>
                <CardContent className="pt-4">
                  <p className="text-sm text-muted-foreground">{property.notes}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* CAPEX & ROI TAB */}
          <TabsContent value="capex" className="space-y-4">
            {/* ROI Summary */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-4 bg-teal-50 border border-teal-200 rounded-lg text-center">
                <PoundSterling className="w-5 h-5 text-teal-600 mx-auto mb-1" />
                <p className="text-[11px] text-teal-700 mb-0.5">Total Capex</p>
                <p className="text-xl font-bold text-teal-900">£{totalCapex >= 1000000 ? `${(totalCapex / 1000000).toFixed(1)}M` : `${(totalCapex / 1000).toFixed(0)}K`}</p>
              </div>
              <div className="p-4 bg-teal-50 border border-teal-200 rounded-lg text-center">
                <TrendingUp className="w-5 h-5 text-teal-600 mx-auto mb-1" />
                <p className="text-[11px] text-teal-700 mb-0.5">Avg ROI</p>
                <p className="text-xl font-bold text-teal-900">{avgRoi}%</p>
              </div>
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg text-center">
                <Clock className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                <p className="text-[11px] text-purple-700 mb-0.5">Payback Period</p>
                <p className="text-xl font-bold text-purple-900">{property.estimatedPaybackYears || "—"} yrs</p>
              </div>
            </div>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Planned Capex Projects</CardTitle>
                <CardDescription>Capital expenditure items ranked by priority and ROI</CardDescription>
              </CardHeader>
              <CardContent>
                {capexItems && capexItems.length > 0 ? (
                  <div className="space-y-3">
                    {capexItems.map((item) => (
                      <div key={item.id} className="p-4 border rounded-lg hover:bg-secondary/30 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-semibold text-sm">{item.title}</p>
                            {item.description && <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>}
                          </div>
                          <Badge variant="outline" className={
                            item.priority === "critical" ? "border-red-300 text-red-700" :
                            item.priority === "high" ? "border-amber-300 text-amber-700" :
                            "border-gray-300 text-gray-700"
                          }>
                            {item.priority}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-4 gap-3 text-sm mt-3">
                          <div>
                            <p className="text-[11px] text-muted-foreground">Cost</p>
                            <p className="font-semibold">£{item.estimatedCost >= 1000000 ? `${(item.estimatedCost / 1000000).toFixed(1)}M` : `${(item.estimatedCost / 1000).toFixed(0)}K`}</p>
                          </div>
                          <div>
                            <p className="text-[11px] text-muted-foreground">ROI</p>
                            <p className="font-semibold text-teal-600">{item.roi || 0}%</p>
                          </div>
                          <div>
                            <p className="text-[11px] text-muted-foreground">Timeline</p>
                            <p className="font-semibold">{item.timeline || "TBD"}</p>
                          </div>
                          <div>
                            <p className="text-[11px] text-muted-foreground">Status</p>
                            <Badge variant="outline" className="text-xs capitalize">{item.status}</Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <PoundSterling className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No capex projects planned for this property yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* RECOMMENDATIONS TAB */}
          <TabsContent value="recommendations" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2"><Zap className="w-4 h-4" /> Upgrade Recommendations</CardTitle>
                <CardDescription>
                  {recommendations.length > 0
                    ? "Based on EPC assessment data. Implementing these could improve your rating."
                    : "Recommendations will appear once EPC data is enriched from the government registry."
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recommendations.length > 0 ? (
                  <div className="space-y-3">
                    {recommendations.map((rec: any, idx: number) => (
                      <div key={idx} className="p-3 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{rec.description || rec.measure || `Improvement ${idx + 1}`}</p>
                            {rec.indicativeCost && (
                              <p className="text-xs text-muted-foreground mt-1">Indicative cost: {rec.indicativeCost}</p>
                            )}
                            {rec.typicalSaving && (
                              <p className="text-xs text-green-600 mt-0.5">Typical saving: {rec.typicalSaving}</p>
                            )}
                          </div>
                          <ArrowRight className="w-4 h-4 text-muted-foreground mt-1" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Show generic recommendations based on EPC rating */}
                    {(property.epcRating === "E" || property.epcRating === "F" || property.epcRating === "G") && (
                      <>
                        <div className="p-3 border rounded-lg border-red-200 bg-red-50/50">
                          <p className="font-semibold text-sm text-red-800">Urgent: Below MEES Threshold</p>
                          <p className="text-xs text-red-600 mt-1">This property is at or below the current MEES minimum. Immediate action required to maintain lettability.</p>
                        </div>
                        <div className="p-3 border rounded-lg">
                          <p className="font-semibold text-sm">HVAC System Assessment</p>
                          <p className="text-xs text-muted-foreground mt-1">Heating and cooling systems in buildings of this age and rating typically account for 40-60% of energy use. A full HVAC assessment is recommended.</p>
                        </div>
                        <div className="p-3 border rounded-lg">
                          <p className="font-semibold text-sm">Building Fabric Improvements</p>
                          <p className="text-xs text-muted-foreground mt-1">Insulation upgrades (roof, walls, floors) and draught-proofing can significantly improve thermal performance and reduce energy costs.</p>
                        </div>
                        <div className="p-3 border rounded-lg">
                          <p className="font-semibold text-sm">LED Lighting Retrofit</p>
                          <p className="text-xs text-muted-foreground mt-1">Replacing older lighting with LED alternatives typically delivers 50-70% energy savings with a 2-3 year payback period.</p>
                        </div>
                      </>
                    )}
                    {(property.epcRating === "C" || property.epcRating === "D") && (
                      <>
                        <div className="p-3 border rounded-lg border-amber-200 bg-amber-50/50">
                          <p className="font-semibold text-sm text-amber-800">Planning Required: EPC C Target by 2030</p>
                          <p className="text-xs text-amber-600 mt-1">This property will need to reach EPC C before the 2030 deadline. Start planning upgrades now for optimal sequencing.</p>
                        </div>
                        <div className="p-3 border rounded-lg">
                          <p className="font-semibold text-sm">Smart Building Controls</p>
                          <p className="text-xs text-muted-foreground mt-1">Installing a modern BMS (Building Management System) can reduce energy consumption by 15-25% with relatively low capital outlay.</p>
                        </div>
                        <div className="p-3 border rounded-lg">
                          <p className="font-semibold text-sm">Renewable Energy Generation</p>
                          <p className="text-xs text-muted-foreground mt-1">Rooftop solar PV can offset grid electricity consumption and improve the EPC rating. Typical ROI of 10-15% for commercial installations.</p>
                        </div>
                      </>
                    )}
                    {(property.epcRating === "A" || property.epcRating === "B") && (
                      <div className="p-3 border rounded-lg border-green-200 bg-green-50/50">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                          <div>
                            <p className="font-semibold text-sm text-green-800">Well Positioned</p>
                            <p className="text-xs text-green-600 mt-0.5">This property already meets current and upcoming MEES requirements. Focus on maintaining performance and monitoring for regulatory changes.</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* VIOLATIONS TAB */}
          <TabsContent value="violations" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Compliance Violations</CardTitle>
                <CardDescription>Active issues requiring attention</CardDescription>
              </CardHeader>
              <CardContent>
                {violations && violations.length > 0 ? (
                  <div className="space-y-3">
                    {violations.map((violation) => (
                      <div key={violation.id} className="p-3 border rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <p className="font-semibold text-sm">{violation.violationType}</p>
                          <Badge variant="outline" className={
                            violation.severity === "critical" ? "border-red-300 text-red-700" :
                            violation.severity === "high" ? "border-orange-300 text-orange-700" :
                            "border-amber-300 text-amber-700"
                          }>
                            {violation.severity}
                          </Badge>
                        </div>
                        {violation.description && <p className="text-xs text-muted-foreground">{violation.description}</p>}
                        <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                          <span>Status: <strong className="capitalize">{violation.status}</strong></span>
                          {violation.estimatedCost && <span>Est. cost: <strong>£{(violation.estimatedCost / 1000).toFixed(0)}K</strong></span>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-50 text-green-500" />
                    <p className="text-sm">No active violations for this property.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

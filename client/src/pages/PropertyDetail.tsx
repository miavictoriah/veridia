import { useLocation, useRoute } from "wouter";
import { DashboardNav } from "@/components/DashboardNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, AlertTriangle, CheckCircle, AlertCircle, TrendingUp, Droplets, MapPin, FileText } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { formatCurrency, formatCurrencyDetailed } from "@/lib/formatters";
import { useAuth } from "@/_core/hooks/useAuth";

export default function PropertyDetail() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/property/:id");
  const propertyId = params?.id as string;

  if (!isAuthenticated) {
    setLocation("/");
    return null;
  }

  if (!match) {
    setLocation("/assets");
    return null;
  }

  const { data: properties, isLoading } = trpc.properties.list.useQuery();
  const property = properties?.find(p => p.id === parseInt(propertyId));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardNav />
        <div className="lg:ml-60 pt-14 lg:pt-0 px-4 lg:px-8 py-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardNav />
        <div className="lg:ml-60 pt-14 lg:pt-0 px-4 lg:px-8 py-6">
          <div className="text-center py-12">
            <p className="text-gray-500">Property not found</p>
            <Button onClick={() => setLocation("/assets")} className="mt-4">Back to Properties</Button>
          </div>
        </div>
      </div>
    );
  }

  const getComplianceIcon = (status: string | null) => {
    switch (status) {
      case "compliant": return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "at_risk": return <AlertCircle className="w-5 h-5 text-amber-600" />;
      case "non_compliant": return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default: return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getEpcColor = (rating: string | null) => {
    const colors: Record<string, string> = {
      A: "bg-green-500 text-white",
      B: "bg-green-400 text-white",
      C: "bg-yellow-400 text-black",
      D: "bg-orange-400 text-white",
      E: "bg-orange-500 text-white",
      F: "bg-red-400 text-white",
      G: "bg-red-500 text-white",
    };
    return colors[rating || ""] || "bg-gray-300 text-gray-700";
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      
      <div className="lg:ml-60 pt-14 lg:pt-0">
        {/* Header */}
        <div className="border-b border-gray-100 bg-white">
          <div className="px-4 lg:px-8 py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLocation("/assets")}
                className="hover:bg-gray-100"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex-1">
                <h1 className="text-2xl font-semibold text-gray-900">{property.name}</h1>
                <p className="text-sm text-gray-500 mt-1">{property.address}, {property.postcode}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 lg:px-8 py-6 max-w-6xl">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">EPC Rating</p>
                    <p className="text-2xl font-bold mt-1">{property.epcRating || "—"}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-white ${getEpcColor(property.epcRating)}`}>
                    {property.epcRating}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div>
                  <p className="text-sm text-gray-500">Risk Score</p>
                  <p className="text-2xl font-bold mt-1">{property.riskScore || 0}/100</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div>
                  <p className="text-sm text-gray-500">Retrofit Cost</p>
                  <p className="text-2xl font-bold mt-1">{formatCurrency(property.estimatedRetrofitCost)}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                    <div>
                      <p className="text-sm text-gray-500">Payback Period</p>
                      <p className="text-2xl font-bold mt-1">{property.estimatedPaybackYears || "—"} yrs</p>
                    </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="capex">Capex & ROI</TabsTrigger>
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              <TabsTrigger value="violations">Violations</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Property Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Property Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Type</p>
                        <p className="font-medium capitalize">{property.propertyType || "—"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Year Built</p>
                        <p className="font-medium">{property.yearBuilt || "—"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Floor Area</p>
                        <p className="font-medium">{property.floorArea ? `${property.floorArea.toLocaleString()} sqm` : "—"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Storeys</p>
                        <p className="font-medium">{property.storeys || "—"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Lettable</p>
                        <p className="font-medium">{property.lettable ? "Yes" : "No"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Data Source</p>
                        <p className="font-medium capitalize">{property.epcDataSource || "Manual"}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Compliance Status */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Compliance Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      {getComplianceIcon(property.complianceStatus)}
                      <div>
                        <p className="text-sm text-gray-500">Status</p>
                        <p className="font-medium capitalize">{property.complianceStatus?.replace(/_/g, " ") || "Unknown"}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">EPC Score</p>
                      <p className="font-medium">{property.epcScore || "—"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">EPC Expiry</p>
                      <p className="font-medium">{property.epcExpiry ? new Date(property.epcExpiry).toLocaleDateString() : "—"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Years to Deadline</p>
                      <p className="font-medium">{property.yearsToDeadline || "—"}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Flood Risk, Land Registry, Planning */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Flood Risk */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Droplets className="w-5 h-5 text-blue-600" />
                      <CardTitle className="text-base">Flood Risk</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Zone</p>
                      <p className="font-medium">{property.floodRiskZone || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Risk Level</p>
                      <p className="font-medium capitalize">{property.floodRiskLevel || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Source</p>
                      <p className="font-medium capitalize">{property.floodRiskSource || "—"}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Land Registry */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-purple-600" />
                      <CardTitle className="text-base">Land Registry</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Title Number</p>
                      <p className="font-medium text-sm">{property.landRegistryTitle || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Tenure</p>
                      <p className="font-medium capitalize">{property.tenureType || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Last Sale</p>
                      <p className="font-medium">{formatCurrencyDetailed(property.lastSalePrice as number)}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Planning */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-green-600" />
                      <CardTitle className="text-base">Planning</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                             <p className="text-sm text-gray-500">Authority</p>
                      <p className="font-medium text-sm">{property.localAuthority || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Zone</p>
                      <p className="font-medium">{property.planningZone || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Nearby Apps</p>
                      <p className="font-medium">{property.nearbyPlanningApps || "0"}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Capex & ROI Tab */}
            <TabsContent value="capex">
              <Card>
                <CardHeader>
                  <CardTitle>Capex & ROI Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Estimated Retrofit Cost</p>
                      <p className="text-2xl font-bold mt-2">{formatCurrency(property.estimatedRetrofitCost)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Payback Period</p>
                      <p className="text-2xl font-bold mt-2">{property.estimatedPaybackYears || "—"} years</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Annual Energy Cost</p>
                      <p className="text-2xl font-bold mt-2">{formatCurrency(property.energyCostsAnnual)}</p>
                    </div>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-900">
                      Investing in this property's retrofit will pay back in approximately {property.estimatedPaybackYears} years through energy savings and compliance protection.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Recommendations Tab */}
            <TabsContent value="recommendations">
              <Card>
                <CardHeader>
                  <CardTitle>Upgrade Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {property.epcRecommendations ? (
                      (() => {
                        try {
                          const recs = typeof property.epcRecommendations === 'string' ? JSON.parse(property.epcRecommendations) : property.epcRecommendations;
                          return Array.isArray(recs) && recs.length > 0 ? (
                            recs.map((rec: any, idx: number) => (
                              <div key={idx} className="border border-gray-200 rounded-lg p-4">
                                <p className="font-medium">{rec.title || rec.name || 'Recommendation'}</p>
                                <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                                <p className="text-sm font-semibold text-teal-600 mt-2">Est. Cost: {formatCurrency(rec.cost)}</p>
                              </div>
                            ))
                          ) : (
                            <p className="text-gray-500">No recommendations available</p>
                          );
                        } catch {
                          return <p className="text-gray-500">No recommendations available</p>;
                        }
                      })()
                    ) : (
                      <p className="text-gray-500">No recommendations available</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Violations Tab */}
            <TabsContent value="violations">
              <Card>
                <CardHeader>
                  <CardTitle>Compliance Violations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-900">
                        No compliance violations recorded for this property.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

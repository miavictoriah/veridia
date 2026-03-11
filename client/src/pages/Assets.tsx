import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { DashboardNav } from "@/components/DashboardNav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, AlertTriangle, CheckCircle, AlertCircle, Building2, RefreshCw, Trash2, Eye } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { AddPropertyModal } from "@/components/AddPropertyModal";
import { formatCurrency } from "@/lib/formatters";

export default function Assets() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [addModalOpen, setAddModalOpen] = useState(false);


  if (!isAuthenticated) {
    setLocation("/");
    return null;
  }

  const { data: properties, isLoading, refetch } = trpc.properties.list.useQuery();
  const deleteProperty = trpc.properties.delete.useMutation({
    onSuccess: () => refetch(),
  });
  const refreshEPC = trpc.properties.refreshEPC.useMutation({
    onSuccess: () => refetch(),
  });

  const filteredProperties = properties?.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.postcode && p.postcode.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  const getRiskColor = (level: string | null) => {
    switch (level) {
      case "critical": return "bg-red-500 text-white";
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-amber-100 text-amber-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
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

  const getComplianceIcon = (status: string | null) => {
    switch (status) {
      case "compliant": return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "at_risk": return <AlertCircle className="w-4 h-4 text-amber-600" />;
      case "non_compliant": return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  // Portfolio summary
  const totalProperties = filteredProperties.length;
  const highRiskCount = filteredProperties.filter(p => p.riskLevel === "high").length;
  const avgRiskScore = totalProperties > 0
    ? Math.round(filteredProperties.reduce((sum, p) => sum + (p.riskScore || 0), 0) / totalProperties)
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />

      <div className="lg:ml-60 pt-16 lg:pt-0">
        {/* Header */}
        <div className="border-b border-border p-4 md:p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Asset Management</h1>
              <p className="text-sm text-muted-foreground mt-1">Manage your portfolio and monitor compliance status</p>
            </div>
            <Button className="shrink-0" onClick={() => setAddModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Property
            </Button>
          </div>

          {/* Quick Stats */}
          {totalProperties > 0 && (
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="bg-secondary/50 rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground">Properties</p>
                <p className="text-xl font-bold">{totalProperties}</p>
              </div>
              <div className="bg-secondary/50 rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground">High Risk</p>
                <p className="text-xl font-bold text-red-600">{highRiskCount}</p>
              </div>
              <div className="bg-secondary/50 rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground">Avg Risk</p>
                <p className="text-xl font-bold">{avgRiskScore}/100</p>
              </div>
            </div>
          )}
        </div>

        {/* Search */}
        <div className="p-4 md:p-6 lg:p-8">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, address, or postcode..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Properties List */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-32 bg-secondary/50 rounded-lg" />
                ))}
              </div>
            </div>
          ) : filteredProperties.length === 0 ? (
            <div className="text-center py-16">
              <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No properties yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Add your first property to start tracking compliance risk.<br />
                Just enter a UK postcode and we'll automatically retrieve EPC data.
              </p>
              <Button onClick={() => setAddModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Property
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredProperties.map((property) => (
                <Card
                  key={property.id}
                  className="shadow-sm hover:shadow-md transition-shadow border-border/50 cursor-pointer"
                  onClick={() => setLocation(`/property/${property.id}`)}
                >
                  <CardContent className="p-4 md:p-5">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      {/* EPC Rating Badge */}
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className={`${getEpcColor(property.epcRating)} text-xl font-bold w-12 h-12 rounded-lg flex items-center justify-center shrink-0`}>
                          {property.epcRating || "?"}
                        </div>
                        <div className="md:hidden flex-1">
                          <h3 className="font-semibold text-sm">{property.name}</h3>
                          <p className="text-xs text-muted-foreground">{property.address}</p>
                        </div>
                      </div>

                      {/* Property Info - Desktop */}
                      <div className="hidden md:block flex-1">
                        <h3 className="font-semibold">{property.name}</h3>
                        <p className="text-sm text-muted-foreground">{property.address}</p>
                        <div className="flex gap-2 mt-1.5 flex-wrap">
                          <Badge variant="outline" className="text-xs">{property.propertyType}</Badge>
                          {property.postcode && <Badge variant="outline" className="text-xs">{property.postcode}</Badge>}
                          {property.epcDataSource === "api" && (
                            <Badge variant="outline" className="text-xs text-green-600 border-green-300">
                              <CheckCircle className="w-3 h-3 mr-1" /> Verified EPC
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Mobile badges */}
                      <div className="flex gap-2 flex-wrap md:hidden">
                        <Badge variant="outline" className="text-xs">{property.propertyType}</Badge>
                        {property.postcode && <Badge variant="outline" className="text-xs">{property.postcode}</Badge>}
                        {property.epcDataSource === "api" && (
                          <Badge variant="outline" className="text-xs text-green-600 border-green-300">Verified EPC</Badge>
                        )}
                      </div>

                      {/* Risk & Compliance */}
                      <div className="flex items-center gap-4 md:gap-6">
                        {/* Risk Score */}
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground mb-1">Risk</p>
                          <Badge className={getRiskColor(property.riskLevel)}>
                            {property.riskScore}/100
                          </Badge>
                        </div>

                        {/* Compliance */}
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground mb-1">Status</p>
                          <div className="flex items-center gap-1">
                            {getComplianceIcon(property.complianceStatus)}
                            <span className="text-xs capitalize">{(property.complianceStatus || "unknown").replace("_", " ")}</span>
                          </div>
                        </div>

                        {/* Retrofit Cost */}
                        {property.estimatedRetrofitCost ? (
                          <div className="text-center hidden sm:block">
                            <p className="text-xs text-muted-foreground mb-1">Retrofit</p>
                            <p className="text-sm font-semibold">{formatCurrency(property.estimatedRetrofitCost)}</p>
                          </div>
                        ) : null}

                        {/* MEES */}
                        <div className="text-center hidden sm:block min-w-[40px]">
                          <p className="text-xs text-muted-foreground mb-1">MEES</p>
                          <Badge variant="outline" className={`text-xs font-medium ${property.meesCompliant ? "text-green-600 border-green-300" : "text-red-600 border-red-300"}`}>
                            {property.meesCompliant ? "Pass" : "Fail"}
                          </Badge>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 md:flex-col shrink-0" onClick={(e) => e.stopPropagation()}>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs"
                          onClick={() => setLocation(`/property/${property.id}`)}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          Details
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs"
                          onClick={() => refreshEPC.mutate({ id: property.id })}
                          disabled={refreshEPC.isPending}
                        >
                          <RefreshCw className={`w-3 h-3 mr-1 ${refreshEPC.isPending ? "animate-spin" : ""}`} />
                          Refresh
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => {
                            if (confirm("Delete this property?")) {
                              deleteProperty.mutate({ id: property.id });
                            }
                          }}
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>

                    {/* Forecasting row */}
                    {(property.forecast6m || property.forecast12m || property.forecast24m) && (
                      <div className="mt-3 pt-3 border-t border-border/50 flex gap-4 text-xs">
                        <span className="text-muted-foreground">Forecast:</span>
                        {property.forecast6m && <span>6m: <strong>{property.forecast6m}</strong></span>}
                        {property.forecast12m && <span>12m: <strong>{property.forecast12m}</strong></span>}
                        {property.forecast24m && <span>24m: <strong>{property.forecast24m}</strong></span>}
                        {property.yearsToDeadline && (
                          <span className="text-amber-600">
                            {property.yearsToDeadline} yrs to EPC C deadline
                          </span>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <AddPropertyModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        onSuccess={() => refetch()}
      />


    </div>
  );
}

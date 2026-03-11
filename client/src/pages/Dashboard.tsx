import { useAuth } from "@/_core/hooks/useAuth";
import { formatCurrency } from "@/lib/formatters";
import { useLocation } from "wouter";
import { DashboardNav } from "@/components/DashboardNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { AlertCircle, TrendingUp, Download, Building2, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { generateComplianceReportPDF } from "@/lib/pdfExport";
import { MetricSkeletons, ChartSkeleton } from "@/components/SkeletonLoader";
import { showToast } from "@/components/Toast";

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  if (!isAuthenticated) {
    setLocation("/");
    return null;
  }

  const handleExportReport = () => {
    try {
      generateComplianceReportPDF({
        propertyName: "Portfolio Summary",
        address: "Multiple Locations",
        epcRating: "D",
        riskScore: 62,
        complianceStatus: "75% Compliant",
        violations: [
          { type: "EPC Below Minimum", severity: "critical", remediation: "Retrofit required" },
          { type: "Fire Safety Gap", severity: "high", remediation: "Install suppression system" },
        ],
        generatedDate: new Date().toLocaleDateString(),
      });
      showToast("Report exported successfully", "success");
    } catch (error) {
      showToast("Failed to export report", "error");
    }
  };

  const { data: riskSummary, isLoading: riskLoading } = trpc.portfolio.riskSummary.useQuery();
  const { data: capexSummary, isLoading: capexLoading } = trpc.portfolio.capexSummary.useQuery();
  const { data: properties } = trpc.properties.list.useQuery();
  const { data: benchmarks } = trpc.benchmarks.portfolio.useQuery();

  const riskDistribution = riskSummary ? [
    { name: "High Risk", value: riskSummary.highRisk, fill: "#ef4444" },
    { name: "Medium Risk", value: riskSummary.mediumRisk, fill: "#f59e0b" },
    { name: "Low Risk", value: riskSummary.lowRisk, fill: "#0d9488" },
  ] : [];

  const plannedCapex = (capexSummary?.plannedCapex as number) || 0;
  const capexTimeline = [
    { year: "2025", amount: plannedCapex },
    { year: "2026", amount: Math.round(plannedCapex * 0.6) },
    { year: "2027", amount: Math.round(plannedCapex * 0.4) },
    { year: "2028", amount: Math.round(plannedCapex * 0.2) },
    { year: "2029", amount: Math.round(plannedCapex * 0.1) },
  ];

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <DashboardNav />
      
      <div className="lg:ml-60 pt-14 lg:pt-0">
        {/* Header */}
        <div className="border-b border-gray-100 bg-white">
          <div className="px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Portfolio Overview</h1>
                <p className="text-[13px] text-gray-400 mt-1">Welcome back, {user?.name}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="gap-2 text-[13px] h-9 border-gray-200" onClick={handleExportReport}>
                  <Download className="w-3.5 h-3.5" />
                  Export
                </Button>
                <Button size="sm" className="gap-2 text-[13px] h-9 bg-teal-600 hover:bg-teal-700" onClick={() => setLocation('/assets')}>
                  <Building2 className="w-3.5 h-3.5" />
                  Manage Properties
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 lg:px-8 py-6 space-y-6">
          {/* Key Metrics */}
          {riskLoading ? (
            <MetricSkeletons />
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                label="Total Properties"
                value={String(riskSummary?.total || 0)}
                sublabel="In your portfolio"
              />
              <MetricCard
                label="High Risk"
                value={String(riskSummary?.highRisk || 0)}
                sublabel="Require attention"
                variant="danger"
              />
              <MetricCard
                label="Non-Lettable Risk"
                value={String(riskSummary?.nonLettable || 0)}
                sublabel="Below EPC threshold"
                variant="warning"
              />
              <MetricCard
                label="Compliance Rate"
                value={`${riskSummary?.compliancePercentage || 0}%`}
                sublabel="Portfolio compliance"
                variant="success"
              />
            </div>
          )}

          {/* Alerts */}
          {riskSummary && (riskSummary.highRisk > 0 || riskSummary.nonLettable > 0) && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-[14px] font-medium text-red-900">Action required</p>
                  <p className="text-[13px] text-red-700 mt-0.5">
                    {riskSummary.nonLettable > 0 && `${riskSummary.nonLettable} ${riskSummary.nonLettable === 1 ? 'property' : 'properties'} at risk of non-lettability. `}
                    {riskSummary.highRisk > 0 && `${riskSummary.highRisk} high-risk ${riskSummary.highRisk === 1 ? 'asset' : 'assets'} need compliance review.`}
                  </p>
                </div>
                <Button size="sm" variant="outline" className="text-[12px] h-8 border-red-200 text-red-700 hover:bg-red-100" onClick={() => setLocation('/assets')}>
                  Review
                </Button>
              </div>
            </div>
          )}

          {/* Charts Row */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Risk Distribution */}
            <Card className="border-gray-100 shadow-none bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-[14px] font-medium text-gray-900">Risk Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={riskDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {riskDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '13px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-6 mt-2">
                  {riskDistribution.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-[12px] text-gray-500">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
                      {item.name}: {item.value}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Capex Forecast */}
            <Card className="border-gray-100 shadow-none bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-[14px] font-medium text-gray-900">5-Year Capex Forecast</CardTitle>
                <p className="text-[11px] text-gray-400 mt-0.5">Estimated capital expenditure by year (GBP)</p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={capexTimeline} barSize={32} margin={{ left: 10, right: 10, top: 5, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                    <XAxis
                      dataKey="year"
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                      axisLine={false}
                      tickLine={false}
                      label={{ value: 'Year', position: 'insideBottom', offset: -2, fontSize: 11, fill: '#9ca3af' }}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#6b7280' }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(value) => formatCurrency(value)}
                      label={{ value: 'Spend (GBP)', angle: -90, position: 'insideLeft', offset: 0, fontSize: 11, fill: '#9ca3af' }}
                      width={70}
                    />
                    <Tooltip
                      formatter={(value) => [`£${(value as number).toLocaleString()}`, 'Planned Capex']}
                      labelFormatter={(label) => `Year: ${label}`}
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '13px' }}
                    />
                    <Bar dataKey="amount" fill="#0d9488" radius={[4, 4, 0, 0]} name="Capex" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* EPC + Benchmarks Row */}
          {properties && properties.length > 0 && (
            <div className="grid lg:grid-cols-2 gap-6">
              {/* EPC Breakdown */}
              <Card className="border-gray-100 shadow-none bg-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-[14px] font-medium text-gray-900">EPC Rating Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {['A', 'B', 'C', 'D', 'E', 'F', 'G'].map(rating => {
                      const count = properties.filter(p => p.epcRating === rating).length;
                      const pct = properties.length > 0 ? (count / properties.length) * 100 : 0;
                      const colors: Record<string, string> = {
                        A: 'bg-emerald-500', B: 'bg-emerald-400', C: 'bg-teal-400',
                        D: 'bg-amber-400', E: 'bg-orange-400', F: 'bg-red-400', G: 'bg-red-500'
                      };
                      return (
                        <div key={rating} className="flex items-center gap-3">
                          <span className={`${colors[rating]} text-white text-[11px] font-semibold w-6 h-6 rounded flex items-center justify-center`}>{rating}</span>
                          <div className="flex-1 bg-gray-100 rounded-full h-2.5">
                            <div className={`${colors[rating]} h-2.5 rounded-full transition-all`} style={{ width: `${Math.max(pct, 2)}%` }} />
                          </div>
                          <span className="text-[12px] font-medium text-gray-500 w-6 text-right">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Market Comparison */}
              <Card className="border-gray-100 shadow-none bg-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-[14px] font-medium text-gray-900">Market Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-[12px] text-gray-400">Your Avg EPC</p>
                        <p className="text-xl font-semibold text-gray-900">{benchmarks?.yourAvgEpc || 'N/A'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[12px] text-gray-400">Market Avg</p>
                        <p className="text-xl font-semibold text-gray-400">{benchmarks?.marketAvgEpc || 'C'}</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-[12px] text-gray-400">Your Compliance</p>
                        <p className="text-xl font-semibold text-gray-900">{benchmarks?.yourComplianceRate || 0}%</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[12px] text-gray-400">Market Avg</p>
                        <p className="text-xl font-semibold text-gray-400">{benchmarks?.marketComplianceRate || 82}%</p>
                      </div>
                    </div>
                    <div className="p-3 bg-teal-50 rounded-lg text-center">
                      <p className="text-[13px] font-medium text-teal-800">{benchmarks?.competitivePosition || 'Add properties to see comparison'}</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-[12px] text-gray-400">Total Estimated Retrofit Cost</p>
                      <p className="text-xl font-semibold text-amber-600">{formatCurrency(riskSummary?.totalRetrofitCost || 0)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, sublabel, variant }: { label: string; value: string; sublabel: string; variant?: 'danger' | 'warning' | 'success' }) {
  const colorMap = {
    danger: 'text-red-600',
    warning: 'text-amber-600',
    success: 'text-teal-600',
  };
  const valueColor = variant ? colorMap[variant] : 'text-gray-900';
  
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5">
      <p className="text-[12px] font-medium text-gray-400 uppercase tracking-wide">{label}</p>
      <p className={`text-2xl md:text-3xl font-semibold tracking-tight mt-1 ${valueColor}`}>{value}</p>
      <p className="text-[12px] text-gray-400 mt-1">{sublabel}</p>
    </div>
  );
}

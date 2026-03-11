import { formatCurrency } from "@/lib/formatters";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { DashboardNav } from "@/components/DashboardNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, AlertTriangle, Calendar } from "lucide-react";

export default function Forecasting() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  if (!isAuthenticated) {
    setLocation("/");
    return null;
  }

  // Sample forecasting data
  const epcForecast = [
    { year: 2025, compliant: 28, nonCompliant: 10 },
    { year: 2026, compliant: 32, nonCompliant: 6 },
    { year: 2027, compliant: 35, nonCompliant: 3 },
    { year: 2028, compliant: 38, nonCompliant: 0 },
  ];

  const netZeroForecast = [
    { year: 2025, impact: 0, cost: 0 },
    { year: 2030, impact: 15, cost: 8500000 },
    { year: 2035, impact: 28, cost: 15000000 },
    { year: 2040, impact: 38, cost: 21000000 },
  ];

  const scenarios = [
    {
      name: "Retrofit Strategy",
      description: "Proactive property upgrades to meet future regulations",
      impact: "High compliance, moderate cost",
      cost: "£18M over 5 years",
      timeline: "2025-2030",
      color: "bg-green-50 dark:bg-green-950/20 border-green-200/50",
    },
    {
      name: "Selective Divestment",
      description: "Sell non-compliant properties and reinvest in compliant assets",
      impact: "High compliance, portfolio restructuring",
      cost: "£5M transaction costs",
      timeline: "2025-2027",
      color: "bg-teal-50 dark:bg-teal-950/20 border-teal-200/50",
    },
    {
      name: "Hold & Monitor",
      description: "Monitor regulatory changes and respond reactively",
      impact: "Compliance risk, lower upfront cost",
      cost: "£12M reactive upgrades",
      timeline: "2025-2035",
      color: "bg-amber-50 dark:bg-amber-950/20 border-amber-200/50",
    },
  ];

  const upcomingDeadlines = [
    {
      regulation: "EPC Minimum D Rating",
      deadline: "April 2025",
      affectedProperties: 5,
      estimatedCost: 2500000,
      severity: "high",
    },
    {
      regulation: "Building Safety Act Compliance",
      deadline: "Q3 2025",
      affectedProperties: 3,
      estimatedCost: 1800000,
      severity: "high",
    },
    {
      regulation: "Fire Safety Regulations",
      deadline: "Q4 2025",
      affectedProperties: 2,
      estimatedCost: 950000,
      severity: "medium",
    },
    {
      regulation: "Net Zero Pathway Requirements",
      deadline: "2030",
      affectedProperties: 12,
      estimatedCost: 8500000,
      severity: "medium",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      {/* Header */}
      <div className="border-b border-border/40">
        <div className="lg:ml-60 p-8">
          <h1 className="text-3xl font-bold mb-2">Regulatory Forecasting</h1>
          <p className="text-muted-foreground">Predict future regulatory impacts and plan strategic responses.</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-60 p-8">
        {/* EPC Forecast */}
        <Card className="card-elegant mb-8">
          <CardHeader>
            <CardTitle>EPC Rating Compliance Forecast</CardTitle>
            <CardDescription>Projected properties meeting minimum EPC D rating</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={epcForecast} margin={{ left: 10, right: 10, top: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="year" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} label={{ value: 'Year', position: 'insideBottom', offset: -2, fontSize: 11, fill: '#9ca3af' }} />
                <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} label={{ value: 'Number of Properties', angle: -90, position: 'insideLeft', offset: 5, fontSize: 11, fill: '#9ca3af' }} width={60} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '13px' }} />
                <Legend />
                <Bar dataKey="compliant" stackId="a" fill="#10b981" name="Compliant" radius={[0, 0, 0, 0]} />
                <Bar dataKey="nonCompliant" stackId="a" fill="#ef4444" name="Non-Compliant" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Net Zero Forecast */}
        <Card className="card-elegant mb-8">
          <CardHeader>
            <CardTitle>Net Zero Impact Forecast</CardTitle>
            <CardDescription>Estimated properties affected and costs for net zero compliance</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={netZeroForecast} margin={{ left: 10, right: 10, top: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="year" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} label={{ value: 'Year', position: 'insideBottom', offset: -2, fontSize: 11, fill: '#9ca3af' }} />
                <YAxis yAxisId="left" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} label={{ value: 'Properties Affected', angle: -90, position: 'insideLeft', offset: 5, fontSize: 11, fill: '#9ca3af' }} width={60} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} tickFormatter={(value) => formatCurrency(value)} label={{ value: 'Estimated Cost (GBP)', angle: 90, position: 'insideRight', offset: 5, fontSize: 11, fill: '#9ca3af' }} width={70} />
                <Tooltip formatter={(value) => {
                  const numValue = value as number;
                  return formatCurrency(numValue);
                  return numValue;
                }} contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '13px' }} />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="impact" stroke="#f59e0b" strokeWidth={2} name="Properties Affected" dot={{ r: 4 }} />
                <Line yAxisId="right" type="monotone" dataKey="cost" stroke="#3b82f6" strokeWidth={2} name="Estimated Cost" dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Scenario Analysis */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Strategic Scenarios</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {scenarios.map((scenario, idx) => (
              <Card key={idx} className={`${scenario.color} border card-elegant`}>
                <CardHeader>
                  <CardTitle className="text-lg">{scenario.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{scenario.description}</p>
                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="font-semibold text-muted-foreground">Impact</p>
                      <p>{scenario.impact}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-muted-foreground">Cost</p>
                      <p className="font-semibold">{scenario.cost}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-muted-foreground">Timeline</p>
                      <p>{scenario.timeline}</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="w-full">
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <Card className="card-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Upcoming Regulatory Deadlines
            </CardTitle>
            <CardDescription>Key compliance milestones for your portfolio</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingDeadlines.map((deadline, idx) => (
                <div key={idx} className="border-b border-border last:border-0 pb-4 last:pb-0">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold">{deadline.regulation}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Affects {deadline.affectedProperties} properties
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant="outline"
                        className={
                          deadline.severity === "high"
                            ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                        }
                      >
                        {deadline.severity === "high" ? "High Priority" : "Medium Priority"}
                      </Badge>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Deadline</p>
                      <p className="font-semibold">{deadline.deadline}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Estimated Cost</p>
                      <p className="font-semibold">{formatCurrency(deadline.estimatedCost)}</p>
                    </div>
                    <div>
                      <Button size="sm" variant="outline" className="w-full">
                        View Action Plan
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { useAuth } from "@/_core/hooks/useAuth";
import { DashboardNav } from "@/components/DashboardNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from "recharts";
import { TrendingUp, DollarSign, Zap, Target } from "lucide-react";

export default function RoiOptimizer() {
  const roiData = [
    { project: "Canary Wharf", cost: 2800, roi: 42, payback: 8.5, category: "Net Zero" },
    { project: "Newcastle Campus", cost: 2650, roi: 32, payback: 9.2, category: "Retrofit" },
    { project: "Manchester Park", cost: 3200, roi: 35, payback: 8.8, category: "Energy Efficiency" },
    { project: "Bristol Warehouse", cost: 1950, roi: 28, payback: 10.1, category: "Retrofit" },
    { project: "Glasgow Hub", cost: 1420, roi: 38, payback: 7.9, category: "Energy Efficiency" },
  ];

  const investmentTimeline = [
    { year: 2025, q1: 3200, q2: 1950, q3: 1420, q4: 2800, cumulative: 9370 },
    { year: 2026, q1: 2650, q2: 0, q3: 0, q4: 0, cumulative: 12020 },
  ];

  const financingScenarios = [
    { scenario: "All Cash", totalCost: "£12.02M", timeframe: "2025-2026", impact: "Immediate compliance" },
    { scenario: "Phased (2 years)", totalCost: "£12.02M", timeframe: "2025-2027", impact: "Spread capex burden" },
    { scenario: "Green Financing", totalCost: "£11.42M", timeframe: "2025-2026", impact: "Lower interest rates" },
  ];

  const categoryBreakdown = [
    { category: "Energy Efficiency", count: 3, cost: 5570, percentage: 46 },
    { category: "Retrofit", count: 2, cost: 4600, percentage: 38 },
    { category: "Net Zero", count: 1, cost: 2800, percentage: 23 },
  ];

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      <div className="lg:ml-60 pt-16 lg:pt-0 p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold">Capex ROI Optimizer</h1>
        <p className="text-muted-foreground mt-2">Maximize returns on capital investments with AI-optimized prioritization</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Capex (5yr)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">£12.02M</div>
            <p className="text-xs text-muted-foreground mt-1">5 priority projects</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Avg ROI</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">35%</div>
            <p className="text-xs text-muted-foreground mt-1">Across all projects</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Avg Payback</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">8.7 years</div>
            <p className="text-xs text-muted-foreground mt-1">Investment recovery time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Compliance Impact</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-teal-600">100%</div>
            <p className="text-xs text-muted-foreground mt-1">Portfolio compliance</p>
          </CardContent>
        </Card>
      </div>

      {/* ROI vs Cost Matrix */}
      <Card>
        <CardHeader>
          <CardTitle>ROI vs Investment Cost</CardTitle>
          <CardDescription>Bubble size represents payback period. Larger bubbles = longer payback.</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="cost" name="Investment (£000s)" />
              <YAxis dataKey="roi" name="ROI (%)" domain={[0, 50]} />
              <Tooltip cursor={{ strokeDasharray: "3 3" }} />
              <Scatter name="Projects" data={roiData} fill="#10b981" />
            </ScatterChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Investment Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Capex Investment Timeline</CardTitle>
          <CardDescription>Recommended quarterly spending schedule</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={investmentTimeline}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="q1" stackId="a" fill="#3b82f6" name="Q1" />
              <Bar dataKey="q2" stackId="a" fill="#60a5fa" name="Q2" />
              <Bar dataKey="q3" stackId="a" fill="#93c5fd" name="Q3" />
              <Bar dataKey="q4" stackId="a" fill="#bfdbfe" name="Q4" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Project Rankings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Optimized Project Ranking
          </CardTitle>
          <CardDescription>Ranked by ROI, compliance urgency, and payback period</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {roiData.map((project, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{project.project}</p>
                    <p className="text-sm text-muted-foreground">{project.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Cost</p>
                    <p className="font-semibold">£{project.cost}K</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">ROI</p>
                    <p className="font-semibold text-green-600">{project.roi}%</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Payback</p>
                    <p className="font-semibold">{project.payback}y</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Financing Scenarios */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Financing Scenarios
          </CardTitle>
          <CardDescription>Compare different investment strategies</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {financingScenarios.map((scenario, idx) => (
              <div key={idx} className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-3">{scenario.scenario}</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Total Cost</p>
                    <p className="font-semibold">{scenario.totalCost}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Timeframe</p>
                    <p className="font-semibold">{scenario.timeframe}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Impact</p>
                    <p className="font-semibold text-teal-600">{scenario.impact}</p>
                  </div>
                </div>
                <Button className="w-full mt-4" variant="outline" size="sm">
                  Select
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Capex by Category</CardTitle>
          <CardDescription>Distribution of investment across retrofit types</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categoryBreakdown.map((cat, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{cat.category}</p>
                  <p className="text-sm text-muted-foreground">{cat.count} projects • £{cat.cost}K</p>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full"
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">{cat.percentage}% of total capex</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card className="border-teal-200 dark:border-teal-900/50 bg-teal-50 dark:bg-teal-900/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-teal-600" />
            Strategic Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>
            <strong>Recommended Strategy:</strong> Implement phased approach starting with Manchester Business Park (highest urgency) and Bristol Warehouse (compliance deadline). This sequence maintains portfolio lettability while optimizing cash flow.
          </p>
          <p>
            <strong>Financing Opportunity:</strong> Green financing could save £600K in interest costs. Prioritize projects with net zero benefits (Canary Wharf) for preferential rates.
          </p>
          <p>
            <strong>Quick Wins:</strong> Glasgow Hub retrofit offers 38% ROI with 7.9-year payback—consider accelerating this project.
          </p>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button size="lg" className="gap-2">
          <Zap className="w-4 h-4" />
          Generate Investment Plan
        </Button>
        <Button size="lg" variant="outline">
          Export ROI Analysis
        </Button>
      </div>
      </div>
    </div>
  );
}

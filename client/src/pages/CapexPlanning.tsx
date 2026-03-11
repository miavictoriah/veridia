import { formatCurrency } from "@/lib/formatters";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { DashboardNav } from "@/components/DashboardNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, Zap, AlertTriangle } from "lucide-react";

export default function CapexPlanning() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  if (!isAuthenticated) {
    setLocation("/");
    return null;
  }

  // Sample capex data
  const capexByYear = [
    { year: "2025", amount: 5200000 },
    { year: "2026", amount: 3800000 },
    { year: "2027", amount: 2900000 },
    { year: "2028", amount: 2100000 },
    { year: "2029", amount: 1500000 },
  ];

  const capexByCategory = [
    { category: "Energy Efficiency", amount: 8500000 },
    { category: "Fire Safety", amount: 4200000 },
    { category: "EPC Improvements", amount: 5100000 },
    { category: "Building Safety", amount: 3200000 },
  ];

  const riskROIMatrix = [
    { name: "Property A - HVAC", risk: 85, roi: 45, cost: 450000 },
    { name: "Property B - Insulation", risk: 72, roi: 38, cost: 320000 },
    { name: "Property C - Windows", risk: 65, roi: 52, cost: 280000 },
    { name: "Property D - Boiler", risk: 88, roi: 35, cost: 180000 },
    { name: "Property E - Lighting", risk: 45, roi: 65, cost: 95000 },
    { name: "Property F - Solar", risk: 60, roi: 48, cost: 420000 },
    { name: "Property G - Retrofit", risk: 92, roi: 42, cost: 650000 },
    { name: "Property H - Facade", risk: 78, roi: 40, cost: 380000 },
  ];

  const prioritizedProjects = [
    {
      property: "Property D - High Street Office",
      project: "Building Safety Act Compliance",
      cost: 850000,
      roi: 0,
      timeline: "Q2-Q3 2025",
      priority: "critical",
      status: "planned",
    },
    {
      property: "Property A - Retail Center",
      project: "Fire Safety Upgrade",
      cost: 450000,
      roi: 45,
      timeline: "Q3-Q4 2025",
      priority: "high",
      status: "planned",
    },
    {
      property: "Property G - Industrial Unit",
      project: "Full Retrofit Package",
      cost: 650000,
      roi: 42,
      timeline: "2025-2026",
      priority: "high",
      status: "planned",
    },
    {
      property: "Property B - Mixed Use",
      project: "Insulation & Windows",
      cost: 320000,
      roi: 38,
      timeline: "Q4 2025",
      priority: "medium",
      status: "planned",
    },
    {
      property: "Property E - Office Space",
      project: "LED Lighting System",
      cost: 95000,
      roi: 65,
      timeline: "Q1 2026",
      priority: "medium",
      status: "planned",
    },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "high":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
      case "medium":
        return "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      {/* Header */}
      <div className="border-b border-border/40">
        <div className="lg:ml-60 p-8">
          <h1 className="text-3xl font-bold mb-2">Capital Expenditure Planning</h1>
          <p className="text-muted-foreground">Optimize investment allocation based on risk reduction and return on investment.</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-60 p-8">
        {/* Key Metrics */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="card-elegant">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total 5-Year Capex</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">£15.5M</div>
              <p className="text-xs text-muted-foreground mt-1">Across all projects</p>
            </CardContent>
          </Card>

          <Card className="card-elegant">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Planned Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">12</div>
              <p className="text-xs text-muted-foreground mt-1">Ready for execution</p>
            </CardContent>
          </Card>

          <Card className="card-elegant">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg ROI</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">42%</div>
              <p className="text-xs text-muted-foreground mt-1">Portfolio-wide return</p>
            </CardContent>
          </Card>

          <Card className="card-elegant">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Risk Reduction</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-teal-600">68%</div>
              <p className="text-xs text-muted-foreground mt-1">Compliance improvement</p>
            </CardContent>
          </Card>
        </div>

        {/* Capex Timeline */}
        <Card className="card-elegant mb-8">
          <CardHeader>
            <CardTitle>Capex Investment Timeline</CardTitle>
            <CardDescription>Annual capital expenditure forecast</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={capexByYear}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip formatter={(value) => `£${(((value as number) || 0) / 1000000).toFixed(1)}M`} />
                <Bar dataKey="amount" fill="var(--primary)" name="Annual Capex" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Risk vs ROI Matrix */}
        <Card className="card-elegant mb-8">
          <CardHeader>
            <CardTitle>Risk vs ROI Analysis</CardTitle>
            <CardDescription>Project prioritization matrix (bubble size = project cost)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis type="number" dataKey="roi" name="ROI %" />
                <YAxis type="number" dataKey="risk" name="Risk Score" />
                <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                <Scatter name="Projects" data={riskROIMatrix} fill="var(--primary)" />
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Capex by Category */}
        <Card className="card-elegant mb-8">
          <CardHeader>
            <CardTitle>Investment by Category</CardTitle>
            <CardDescription>Breakdown of capex allocation</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={capexByCategory} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis type="number" />
                <YAxis dataKey="category" type="category" width={150} />
                <Tooltip formatter={(value) => `£${(((value as number) || 0) / 1000000).toFixed(1)}M`} />
                <Bar dataKey="amount" fill="var(--primary)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Prioritized Projects */}
        <Card className="card-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Prioritized Projects
            </CardTitle>
            <CardDescription>Ranked by risk reduction and ROI</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {prioritizedProjects.map((project, idx) => (
                <div key={idx} className="border-b border-border last:border-0 pb-4 last:pb-0">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold">{project.property}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{project.project}</p>
                    </div>
                    <Badge className={getPriorityColor(project.priority)}>
                      {project.priority.charAt(0).toUpperCase() + project.priority.slice(1)}
                    </Badge>
                  </div>
                  <div className="grid md:grid-cols-5 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Cost</p>
                      <p className="font-semibold">£{(((project.cost as number) || 0) / 1000).toFixed(0)}K</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">ROI</p>
                      <p className="font-semibold">{project.roi}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Timeline</p>
                      <p className="font-semibold">{project.timeline}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Status</p>
                      <Badge variant="outline" className="mt-1">
                        {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                      </Badge>
                    </div>
                    <div>
                      <Button size="sm" variant="outline" className="w-full">
                        View Details
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

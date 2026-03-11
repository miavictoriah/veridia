import { formatCurrency } from "@/lib/formatters";
import { useAuth } from "@/_core/hooks/useAuth";
import { DashboardNav } from "@/components/DashboardNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, TrendingUp, Target, Zap } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from "recharts";

export default function Analytics() {
  const { user } = useAuth();
  const riskSummary = trpc.portfolio.riskSummary.useQuery();
  const analyticsData = trpc.analytics.riskScoring.useQuery();

  // Mock AI risk scoring data
  const riskTrendData = [
    { month: "Jan", score: 58, trend: "stable" },
    { month: "Feb", score: 60, trend: "worsening" },
    { month: "Mar", score: 62, trend: "worsening" },
    { month: "Apr", score: 65, trend: "worsening" },
    { month: "May", score: 68, trend: "worsening" },
    { month: "Jun", score: 72, trend: "critical" },
  ];

  const propertyRiskMatrix = [
    { name: "Canary Wharf", epc: "D", age: 33, risk: 62, urgency: "medium" },
    { name: "Bristol Warehouse", epc: "F", age: 27, risk: 85, urgency: "critical" },
    { name: "Manchester Park", epc: "E", age: 20, risk: 78, urgency: "critical" },
    { name: "Newcastle Campus", epc: "E", age: 31, risk: 82, urgency: "critical" },
    { name: "Glasgow Hub", epc: "E", age: 24, risk: 68, urgency: "high" },
    { name: "Leeds Retail", epc: "D", age: 22, risk: 58, urgency: "medium" },
    { name: "Edinburgh Office", epc: "B", age: 13, risk: 28, urgency: "low" },
    { name: "Cambridge Tech", epc: "A", age: 8, risk: 15, urgency: "low" },
  ];

  const retrofitPriority = [
    { rank: 1, property: "Bristol Warehouse Complex", urgency: "critical", predictedDate: "Q3 2025", cost: "£1.95M", roi: "28%" },
    { rank: 2, property: "Newcastle Office Campus", urgency: "critical", predictedDate: "Q2 2025", cost: "£2.65M", roi: "32%" },
    { rank: 3, property: "Manchester Business Park", urgency: "critical", predictedDate: "Q1 2025", cost: "£3.2M", roi: "35%" },
    { rank: 4, property: "Canary Wharf Office Tower", urgency: "high", predictedDate: "Q4 2025", cost: "£2.8M", roi: "42%" },
    { rank: 5, property: "Glasgow Industrial Hub", urgency: "high", predictedDate: "Q3 2025", cost: "£1.42M", roi: "38%" },
  ];

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "critical":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "high":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      default:
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      <div className="lg:ml-60 pt-16 lg:pt-0 p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold">AI Risk Analytics</h1>
        <p className="text-muted-foreground mt-2">Advanced predictive analytics and risk scoring for your portfolio</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Average AI Risk Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analyticsData.data?.avgRiskScore || 62}</div>
            <p className="text-xs text-muted-foreground mt-1">Portfolio-wide assessment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Critical Properties</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{analyticsData.data?.criticalProperties || 3}</div>
            <p className="text-xs text-muted-foreground mt-1">Require immediate action</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Retrofit Urgency</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">5</div>
            <p className="text-xs text-muted-foreground mt-1">Properties in next 12 months</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Risk Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-orange-600" />
              <span className="text-lg font-semibold">Worsening</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">+10 points in 6 months</p>
          </CardContent>
        </Card>
      </div>

      {/* Risk Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Risk Trend (6-Month Projection)</CardTitle>
          <CardDescription>AI-calculated risk score trajectory</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={riskTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="score" stroke="#3b82f6" name="Risk Score" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Risk vs Age Matrix */}
      <Card>
        <CardHeader>
          <CardTitle>Property Risk Matrix</CardTitle>
          <CardDescription>Risk score vs. property age and EPC rating</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="age" name="Property Age (years)" />
              <YAxis dataKey="risk" name="Risk Score" domain={[0, 100]} />
              <Tooltip cursor={{ strokeDasharray: "3 3" }} />
              <Scatter name="Properties" data={propertyRiskMatrix} fill="#3b82f6" />
            </ScatterChart>
          </ResponsiveContainer>
          <div className="mt-4 text-sm text-muted-foreground">
            <p>Bubble position indicates property age (X-axis) vs. risk score (Y-axis). Older properties with lower EPC ratings cluster in high-risk zones.</p>
          </div>
        </CardContent>
      </Card>

      {/* Retrofit Priority Ranking */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Retrofit Priority Ranking
          </CardTitle>
          <CardDescription>AI-optimized retrofit sequence based on urgency, cost, and ROI</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {retrofitPriority.map((item) => (
              <div key={item.rank} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                    {item.rank}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{item.property}</p>
                    <p className="text-sm text-muted-foreground">Target: {item.predictedDate}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge className={getUrgencyColor(item.urgency)}>{item.urgency}</Badge>
                  <div className="text-right">
                    <p className="font-semibold">{item.cost}</p>
                    <p className="text-sm text-green-600 dark:text-green-400">ROI: {item.roi}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Predictions Summary */}
      <Card className="border-orange-200 dark:border-orange-900/50 bg-orange-50 dark:bg-orange-900/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-600" />
            AI Predictions & Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Immediate Actions (Next 3 Months)</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex gap-2">
                <span className="text-orange-600 font-bold">•</span>
                <span>Manchester Business Park: Begin retrofit planning to avoid non-lettable status in Q1 2025</span>
              </li>
              <li className="flex gap-2">
                <span className="text-orange-600 font-bold">•</span>
                <span>Bristol Warehouse: Initiate emergency retrofit to maintain market value</span>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Strategic Opportunities</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex gap-2">
                <span className="text-green-600 font-bold">•</span>
                <span>Canary Wharf retrofit offers highest ROI (42%) with net zero pathway</span>
              </li>
              <li className="flex gap-2">
                <span className="text-green-600 font-bold">•</span>
                <span>Edinburgh and Cambridge properties have minimal compliance risk</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button size="lg" className="gap-2">
          <Zap className="w-4 h-4" />
          Run Scenario Analysis
        </Button>
        <Button size="lg" variant="outline">
          Export Risk Report
        </Button>
      </div>
      </div>
    </div>
  );
}

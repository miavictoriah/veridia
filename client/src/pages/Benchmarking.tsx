import { useAuth } from "@/_core/hooks/useAuth";
import { DashboardNav } from "@/components/DashboardNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { AlertCircle, Target } from "lucide-react";

export default function Benchmarking() {
  const portfolioVsMarket = [
    { metric: "Avg EPC Rating", yourValue: "D", marketValue: "C", gap: "-1 grade", status: "below" },
    { metric: "Compliance Rate", yourValue: "75%", marketValue: "82%", gap: "-7%", status: "below" },
    { metric: "Avg Retrofit Cost", yourValue: "1.0M", marketValue: "0.95M", gap: "+5%", status: "above" },
    { metric: "Avg Risk Score", yourValue: "62", marketValue: "55", gap: "+7", status: "above" },
    { metric: "Non-Lettable %", yourValue: "25%", marketValue: "18%", gap: "+7%", status: "above" },
  ];

  const regionComparison = [
    { region: "London", yourCompliance: 80, marketCompliance: 85 },
    { region: "Manchester", yourCompliance: 60, marketCompliance: 75 },
    { region: "Bristol", yourCompliance: 40, marketCompliance: 78 },
    { region: "Edinburgh", yourCompliance: 100, marketCompliance: 80 },
    { region: "Glasgow", yourCompliance: 50, marketCompliance: 72 },
  ];

  const radarData = [
    { category: "EPC Performance", yourScore: 55, marketScore: 75 },
    { category: "Compliance Rate", yourScore: 75, marketScore: 82 },
    { category: "Risk Management", yourScore: 38, marketScore: 45 },
    { category: "Capex Efficiency", yourScore: 65, marketScore: 70 },
    { category: "Lettability", yourScore: 75, marketScore: 82 },
  ];

  const complianceByType = [
    { propertyType: "Office", yourCompliance: 67, marketCompliance: 80 },
    { propertyType: "Retail", yourCompliance: 75, marketCompliance: 85 },
    { propertyType: "Industrial", yourCompliance: 50, marketCompliance: 70 },
    { propertyType: "Mixed-Use", yourCompliance: 100, marketCompliance: 88 },
  ];

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      <div className="lg:ml-60 pt-16 lg:pt-0 p-8 space-y-8">
      <div>
        <h1 className="text-4xl font-bold">Peer Benchmarking</h1>
        <p className="text-muted-foreground mt-2">Compare your portfolio performance against anonymized market data</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Competitive Position</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">Below Average</div>
            <p className="text-xs text-muted-foreground mt-1">18 months behind market</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">EPC Gap</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">-1 Grade</div>
            <p className="text-xs text-muted-foreground mt-1">Your D vs Market C average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Compliance Gap</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">-7%</div>
            <p className="text-xs text-muted-foreground mt-1">Your 75% vs Market 82%</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Portfolio vs Market Comparison</CardTitle>
          <CardDescription>Key metrics benchmarked against anonymized peer data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {portfolioVsMarket.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{item.metric}</p>
                  <div className="flex gap-4 mt-1 text-sm">
                    <span>Your: <strong>{item.yourValue}</strong></span>
                    <span className="text-muted-foreground">Market: <strong>{item.marketValue}</strong></span>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className={item.status === "below" ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" : "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"}>
                    {item.gap}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Overall Performance Profile</CardTitle>
          <CardDescription>5-dimension comparison across key performance areas</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="category" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar name="Your Portfolio" dataKey="yourScore" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
              <Radar name="Market Average" dataKey="marketScore" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
              <Legend />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Regional Performance Comparison</CardTitle>
          <CardDescription>How your properties perform in each region vs market average</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={regionComparison}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="region" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="yourCompliance" fill="#3b82f6" name="Your Compliance %" />
              <Bar dataKey="marketCompliance" fill="#10b981" name="Market Compliance %" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Compliance by Property Type</CardTitle>
          <CardDescription>Performance breakdown across office, retail, industrial, and mixed-use</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={complianceByType}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="propertyType" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Bar dataKey="yourCompliance" fill="#3b82f6" name="Your Compliance %" />
              <Bar dataKey="marketCompliance" fill="#10b981" name="Market Compliance %" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="border-orange-200 dark:border-orange-900/50 bg-orange-50 dark:bg-orange-900/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-600" />
            Competitive Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <p className="font-semibold mb-2">Key Findings:</p>
            <ul className="space-y-2 ml-4">
              <li>• Your portfolio is 18 months behind market average in EPC compliance</li>
              <li>• Industrial properties significantly underperform (50% vs 70% market compliance)</li>
              <li>• Bristol region is your weakest area (40% compliance vs 78% market)</li>
              <li>• Edinburgh and Cambridge properties exceed market benchmarks</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold mb-2">Opportunities:</p>
            <ul className="space-y-2 ml-4">
              <li>• Closing the EPC gap could unlock additional rental income</li>
              <li>• Industrial retrofit strategy could improve compliance by 20-30%</li>
              <li>• Peer leaders achieve 85%+ compliance with similar capex spend</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button size="lg" className="gap-2">
          <Target className="w-4 h-4" />
          View Peer Case Studies
        </Button>
        <Button size="lg" variant="outline">
          Export Benchmark Report
        </Button>
      </div>
      </div>
    </div>
  );
}

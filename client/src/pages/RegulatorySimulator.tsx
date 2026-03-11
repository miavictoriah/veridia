import { useAuth } from "@/_core/hooks/useAuth";
import { DashboardNav } from "@/components/DashboardNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Zap, AlertTriangle, TrendingDown } from "lucide-react";

export default function RegulatorySimulator() {
  const [epcTarget, setEpcTarget] = useState(67); // D rating threshold
  const [netZeroYear, setNetZeroYear] = useState(2040);
  const [carbonPrice, setCarbonPrice] = useState(50);

  // Scenario results
  const scenarioResults = [
    {
      name: "Current Trajectory",
      affected: 3,
      cost: 12020,
      timeline: "2025-2026",
      compliance: "75%",
      color: "bg-orange-100 dark:bg-orange-900/30",
    },
    {
      name: "EPC D → C (2028)",
      affected: 6,
      cost: 18500,
      timeline: "2025-2028",
      compliance: "100%",
      color: "bg-red-100 dark:bg-red-900/30",
    },
    {
      name: "Net Zero by 2040",
      affected: 12,
      cost: 28000,
      timeline: "2025-2040",
      compliance: "100%",
      color: "bg-purple-100 dark:bg-purple-900/30",
    },
  ];

  const impactByProperty = [
    { property: "Bristol Warehouse", current: 1950, epcC: 2400, netZero: 3200, carbonTax: 450 },
    { property: "Newcastle Campus", current: 2650, epcC: 3100, netZero: 4200, carbonTax: 680 },
    { property: "Manchester Park", current: 3200, epcC: 3800, netZero: 5100, carbonTax: 720 },
    { property: "Canary Wharf", current: 2800, epcC: 3200, netZero: 4500, carbonTax: 580 },
    { property: "Glasgow Hub", current: 1420, epcC: 1800, netZero: 2400, carbonTax: 340 },
  ];

  const complianceTimeline = [
    { year: 2025, epcD: 75, epcC: 25, netZero: 0, carbon: 0 },
    { year: 2026, epcD: 75, epcC: 50, netZero: 0, carbon: 10 },
    { year: 2027, epcD: 75, epcC: 75, netZero: 5, carbon: 20 },
    { year: 2028, epcD: 75, epcC: 100, netZero: 15, carbon: 35 },
    { year: 2030, epcD: 75, epcC: 100, netZero: 40, carbon: 60 },
    { year: 2040, epcD: 75, epcC: 100, netZero: 100, carbon: 100 },
  ];

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      <div className="lg:ml-60 pt-16 lg:pt-0 p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold">Regulatory Scenario Simulator</h1>
        <p className="text-muted-foreground mt-2">Model the impact of future regulatory changes on your portfolio</p>
      </div>

      {/* Scenario Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Configure Scenarios</CardTitle>
          <CardDescription>Adjust regulatory parameters to see portfolio impact</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="font-medium">EPC Minimum Rating Target</label>
              <Badge variant="outline">{String.fromCharCode(67 - Math.round((epcTarget - 50) / 17))}</Badge>
            </div>
            <Slider
              value={[epcTarget]}
              onValueChange={(val) => setEpcTarget(val[0])}
              min={50}
              max={100}
              step={1}
              className="w-full"
            />
            <p className="text-sm text-muted-foreground mt-2">Current: D (50) → Target: {String.fromCharCode(67 - Math.round((epcTarget - 50) / 17))}</p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="font-medium">Net Zero Deadline</label>
              <Badge variant="outline">{netZeroYear}</Badge>
            </div>
            <Slider
              value={[netZeroYear]}
              onValueChange={(val) => setNetZeroYear(val[0])}
              min={2030}
              max={2050}
              step={1}
              className="w-full"
            />
            <p className="text-sm text-muted-foreground mt-2">Mandatory net zero compliance by {netZeroYear}</p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="font-medium">Carbon Tax (£/tonne)</label>
              <Badge variant="outline">£{carbonPrice}</Badge>
            </div>
            <Slider
              value={[carbonPrice]}
              onValueChange={(val) => setCarbonPrice(val[0])}
              min={0}
              max={200}
              step={10}
              className="w-full"
            />
            <p className="text-sm text-muted-foreground mt-2">Annual carbon pricing impact</p>
          </div>
        </CardContent>
      </Card>

      {/* Scenario Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {scenarioResults.map((scenario, idx) => (
          <Card key={idx} className={scenario.color}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{scenario.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Properties Affected</p>
                <p className="text-2xl font-bold">{scenario.affected}/12</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Cost</p>
                <p className="text-2xl font-bold">£{scenario.cost}M</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Timeline</p>
                <p className="text-sm font-semibold">{scenario.timeline}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Portfolio Compliance</p>
                <p className="text-lg font-bold text-green-600">{scenario.compliance}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Compliance Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Compliance Timeline Projection</CardTitle>
          <CardDescription>Portfolio compliance rate under different regulatory scenarios</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={complianceTimeline}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis domain={[0, 100]} label={{ value: "Compliance %", angle: -90, position: "insideLeft" }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="epcD" stroke="#ef4444" name="EPC D Compliant" strokeWidth={2} />
              <Line type="monotone" dataKey="epcC" stroke="#f97316" name="EPC C Compliant" strokeWidth={2} />
              <Line type="monotone" dataKey="netZero" stroke="#8b5cf6" name="Net Zero Path" strokeWidth={2} />
              <Line type="monotone" dataKey="carbon" stroke="#06b6d4" name="Carbon Neutral" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Impact by Property */}
      <Card>
        <CardHeader>
          <CardTitle>Investment Impact by Property</CardTitle>
          <CardDescription>Retrofit costs under different regulatory scenarios</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={impactByProperty}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="property" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="current" fill="#3b82f6" name="Current Plan" />
              <Bar dataKey="epcC" fill="#f97316" name="EPC C Target" />
              <Bar dataKey="netZero" fill="#8b5cf6" name="Net Zero Path" />
              <Bar dataKey="carbonTax" fill="#06b6d4" name="Carbon Tax Impact" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Critical Findings */}
      <Card className="border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            Critical Findings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <p className="font-semibold mb-1">If EPC minimum increases to C by 2028:</p>
            <ul className="space-y-1 ml-4">
              <li>• 6 properties would require retrofit (vs. 3 currently)</li>
              <li>• Total cost increases to £18.5M (+54%)</li>
              <li>• 3 additional properties at risk of becoming non-lettable</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold mb-1">If net zero deadline moves to 2040:</p>
            <ul className="space-y-1 ml-4">
              <li>• All 12 properties require comprehensive retrofit</li>
              <li>• Total portfolio investment: £28M</li>
              <li>• Requires sustained capex program over 15 years</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold mb-1">Carbon pricing at £{carbonPrice}/tonne adds:</p>
            <ul className="space-y-1 ml-4">
              <li>• Annual operating costs increase significantly</li>
              <li>• Makes energy efficiency retrofits more attractive</li>
              <li>• Accelerates ROI on green investments</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5" />
            Strategic Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>
            <strong>1. Accelerate High-Impact Retrofits:</strong> Begin work on Manchester, Bristol, and Newcastle properties immediately. These are most likely to be affected by tightening regulations.
          </p>
          <p>
            <strong>2. Monitor EPC Tightening:</strong> If EPC minimum moves to C, your retrofit costs increase by £6.5M. Build contingency into capex planning.
          </p>
          <p>
            <strong>3. Prioritize Net Zero Pathways:</strong> Canary Wharf retrofit offers highest ROI and aligns with likely 2040 net zero deadline.
          </p>
          <p>
            <strong>4. Leverage Green Financing:</strong> Carbon pricing makes energy efficiency investments more attractive to lenders offering preferential rates.
          </p>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button size="lg" className="gap-2">
          <Zap className="w-4 h-4" />
          Save This Scenario
        </Button>
        <Button size="lg" variant="outline">
          Compare Scenarios
        </Button>
        <Button size="lg" variant="outline">
          Export Analysis
        </Button>
      </div>
      </div>
    </div>
  );
}

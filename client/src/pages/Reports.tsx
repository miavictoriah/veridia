import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { DashboardNav } from "@/components/DashboardNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Calendar, Filter } from "lucide-react";
import { useState } from "react";

export default function Reports() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedReport, setSelectedReport] = useState<string | null>(null);

  if (!isAuthenticated) {
    setLocation("/");
    return null;
  }

  const reports = [
    {
      id: "portfolio-summary",
      title: "Portfolio Compliance Summary",
      description: "Comprehensive overview of regulatory compliance status across all properties",
      category: "Compliance",
      lastGenerated: "2025-03-05",
      frequency: "Monthly",
      pages: 12,
    },
    {
      id: "epc-analysis",
      title: "EPC Rating Analysis & Roadmap",
      description: "Detailed EPC rating assessment with upgrade requirements and timeline",
      category: "Compliance",
      lastGenerated: "2025-02-28",
      frequency: "Quarterly",
      pages: 8,
    },
    {
      id: "fire-safety",
      title: "Fire Safety Compliance Report",
      description: "Fire safety regulation compliance status and remediation plans",
      category: "Compliance",
      lastGenerated: "2025-02-15",
      frequency: "Quarterly",
      pages: 10,
    },
    {
      id: "capex-budget",
      title: "Capital Expenditure Budget Plan",
      description: "5-year capex forecast with prioritized investment recommendations",
      category: "Capex",
      lastGenerated: "2025-03-01",
      frequency: "Quarterly",
      pages: 15,
    },
    {
      id: "risk-assessment",
      title: "Portfolio Risk Assessment",
      description: "Detailed risk scoring and financial exposure analysis",
      category: "Risk",
      lastGenerated: "2025-03-05",
      frequency: "Monthly",
      pages: 14,
    },
    {
      id: "regulatory-forecast",
      title: "Regulatory Forecast & Impact Analysis",
      description: "Future regulatory changes and projected financial impact",
      category: "Forecasting",
      lastGenerated: "2025-02-20",
      frequency: "Semi-Annual",
      pages: 18,
    },
    {
      id: "due-diligence",
      title: "Acquisition Due Diligence Report",
      description: "Regulatory risk assessment for potential property acquisitions",
      category: "Due Diligence",
      lastGenerated: "On Demand",
      frequency: "On Demand",
      pages: 20,
    },
    {
      id: "compliance-timeline",
      title: "Compliance Timeline & Deadlines",
      description: "Visual timeline of regulatory deadlines and compliance milestones",
      category: "Compliance",
      lastGenerated: "2025-03-05",
      frequency: "Monthly",
      pages: 6,
    },
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Compliance":
        return "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400";
      case "Capex":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "Risk":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "Forecasting":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
      case "Due Diligence":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
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
          <h1 className="text-3xl font-bold mb-2">Reports & Exports</h1>
          <p className="text-muted-foreground">Generate and download compliance, capex, and risk analysis reports.</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-60 p-8">
        {/* Report Templates */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Available Reports</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {reports.map((report) => (
              <Card
                key={report.id}
                className="card-elegant cursor-pointer hover:border-primary/50 transition-all"
                onClick={() => setSelectedReport(report.id)}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2 mb-2">
                        <FileText className="w-5 h-5 text-primary" />
                        {report.title}
                      </CardTitle>
                      <CardDescription>{report.description}</CardDescription>
                    </div>
                    <Badge className={getCategoryColor(report.category)}>
                      {report.category}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Pages</p>
                      <p className="font-semibold">{report.pages}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Frequency</p>
                      <p className="font-semibold">{report.frequency}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Last Generated</p>
                      <p className="font-semibold text-xs">{report.lastGenerated}</p>
                    </div>
                  </div>
                  <Button className="w-full" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Generate Report
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Custom Report Builder */}
        <Card className="card-elegant mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Custom Report Builder
            </CardTitle>
            <CardDescription>Create a customized report with selected sections and properties</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Report Sections */}
              <div>
                <h4 className="font-semibold mb-3">Report Sections</h4>
                <div className="grid md:grid-cols-2 gap-3">
                  {[
                    { label: "Executive Summary", selected: true },
                    { label: "Portfolio Overview", selected: true },
                    { label: "Risk Assessment", selected: true },
                    { label: "Compliance Status", selected: true },
                    { label: "Capex Recommendations", selected: false },
                    { label: "Regulatory Forecast", selected: false },
                    { label: "Property Details", selected: false },
                    { label: "Financial Analysis", selected: false },
                  ].map((section, idx) => (
                    <label key={idx} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked={section.selected}
                        className="w-4 h-4 rounded border-border"
                      />
                      <span className="text-sm">{section.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Property Selection */}
              <div>
                <h4 className="font-semibold mb-3">Properties to Include</h4>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">All Properties</Button>
                  <Button variant="outline" size="sm">High Risk Only</Button>
                  <Button variant="outline" size="sm">Custom Selection</Button>
                </div>
              </div>

              {/* Date Range */}
              <div>
                <h4 className="font-semibold mb-3">Report Period</h4>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">Current Quarter</Button>
                  <Button variant="outline" size="sm">Current Year</Button>
                  <Button variant="outline" size="sm">Custom Range</Button>
                </div>
              </div>

              {/* Export Format */}
              <div>
                <h4 className="font-semibold mb-3">Export Format</h4>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">PDF</Button>
                  <Button variant="outline" size="sm">Excel</Button>
                  <Button variant="outline" size="sm">PowerPoint</Button>
                </div>
              </div>

              <Button className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Generate Custom Report
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Reports */}
        <Card className="card-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Recent Report Downloads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: "Portfolio Compliance Summary - March 2025", date: "2025-03-05", size: "2.4 MB" },
                { name: "Capital Expenditure Budget Plan - Q1 2025", date: "2025-03-01", size: "3.1 MB" },
                { name: "Risk Assessment Report - March 2025", date: "2025-02-28", size: "2.8 MB" },
                { name: "EPC Rating Analysis - Q4 2024", date: "2025-02-20", size: "2.2 MB" },
              ].map((item, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                  <div>
                    <p className="font-semibold text-sm">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.date} • {item.size}</p>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { useAuth } from "@/_core/hooks/useAuth";
import { DashboardNav } from "@/components/DashboardNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, MessageSquare, Send, Copy, Download } from "lucide-react";
import { useState } from "react";

export default function TenantCommunications() {
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);

  const templates = [
    {
      id: 1,
      name: "EPC Rating Alert",
      type: "compliance_notice",
      description: "Notify tenants of EPC rating and compliance status",
      subject: "Important: Your Property EPC Rating Update",
      preview: "Dear Tenant,\n\nWe are writing to inform you of the current EPC rating for your property...",
      properties: 8,
    },
    {
      id: 2,
      name: "Retrofit Notification",
      type: "retrofit_notice",
      description: "Inform tenants about upcoming retrofit works",
      subject: "Planned Energy Efficiency Improvements",
      preview: "Dear Tenant,\n\nWe are pleased to announce planned energy efficiency improvements...",
      properties: 5,
    },
    {
      id: 3,
      name: "Compliance Deadline",
      type: "deadline_notice",
      description: "Alert tenants to upcoming compliance deadlines",
      subject: "Important Compliance Update",
      preview: "Dear Tenant,\n\nAs part of our commitment to regulatory compliance...",
      properties: 3,
    },
    {
      id: 4,
      name: "Fire Safety Update",
      type: "safety_notice",
      description: "Communicate fire safety improvements",
      subject: "Fire Safety Enhancements",
      preview: "Dear Tenant,\n\nWe have completed fire safety improvements to enhance your safety...",
      properties: 12,
    },
  ];

  const faqs = [
    {
      question: "What is an EPC rating?",
      answer: "An Energy Performance Certificate (EPC) rates a property's energy efficiency from A (most efficient) to G (least efficient).",
    },
    {
      question: "Why is my property's EPC rating important?",
      answer: "EPC ratings determine lettability. Properties with ratings below D cannot be let from April 2025.",
    },
    {
      question: "What happens during a retrofit?",
      answer: "Retrofits improve energy efficiency through insulation, heating systems, windows, and renewable energy installations.",
    },
    {
      question: "How long do retrofits take?",
      answer: "Typical retrofits take 4-8 weeks depending on the scope of work and property size.",
    },
    {
      question: "Will I be able to stay in my property during retrofit?",
      answer: "Most retrofits allow partial occupancy. We'll provide a detailed timeline and access plan.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      <div className="lg:ml-60 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Tenant Communications Hub</h1>
          <p className="text-muted-foreground">Manage compliance communications and tenant engagement</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Templates */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Communication Templates
                </CardTitle>
                <CardDescription>Pre-built templates for tenant notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => setSelectedTemplate(template.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold">{template.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
                        <div className="flex items-center gap-2 mt-3">
                          <Badge variant="outline">{template.type}</Badge>
                          <span className="text-xs text-muted-foreground">{template.properties} properties</span>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Selected Template Preview */}
            {selectedTemplate && (
              <Card>
                <CardHeader>
                  <CardTitle>Template Preview</CardTitle>
                  <CardDescription>Review before sending to tenants</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Subject Line</label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {templates.find((t) => t.id === selectedTemplate)?.subject}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Message Preview</label>
                    <div className="bg-muted p-4 rounded-lg mt-2 text-sm whitespace-pre-wrap">
                      {templates.find((t) => t.id === selectedTemplate)?.preview}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button className="gap-2">
                      <Send className="w-4 h-4" />
                      Send to Tenants
                    </Button>
                    <Button variant="outline" className="gap-2">
                      <Copy className="w-4 h-4" />
                      Copy
                    </Button>
                    <Button variant="outline" className="gap-2">
                      <Download className="w-4 h-4" />
                      Export
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* FAQ & Stats */}
          <div className="space-y-6">
            {/* Communication Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Communication Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground">Sent This Month</p>
                  <p className="text-2xl font-bold">24</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Open Rate</p>
                  <p className="text-2xl font-bold text-green-600">68%</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Pending Responses</p>
                  <p className="text-2xl font-bold text-orange-600">12</p>
                </div>
              </CardContent>
            </Card>

            {/* FAQ */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <MessageSquare className="w-4 h-4" />
                  Common Questions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {faqs.map((faq, idx) => (
                  <div key={idx} className="text-sm">
                    <p className="font-medium text-xs mb-1">{faq.question}</p>
                    <p className="text-xs text-muted-foreground">{faq.answer}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

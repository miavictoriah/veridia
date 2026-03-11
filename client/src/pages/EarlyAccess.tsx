import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, ArrowRight, Mail } from "lucide-react";
import { showToast } from "@/components/Toast";
import { trpc } from "@/lib/trpc";

export default function EarlyAccess() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    workEmail: "",
    companyName: "",
    role: "investor",
    portfolioSize: "200-500",
  });

  const createEarlyAccessMutation = trpc.earlyAccess.create.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.workEmail || !formData.companyName) {
      showToast("Please fill in all required fields", "error");
      return;
    }

    setLoading(true);
    try {
      await createEarlyAccessMutation.mutateAsync({
        fullName: formData.fullName,
        workEmail: formData.workEmail,
        companyName: formData.companyName,
        role: formData.role,
        portfolioSize: formData.portfolioSize,
      });
      setSubmitted(true);
      showToast("Thank you! Check your email for confirmation.", "success");
    } catch (error) {
      showToast("Failed to submit. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50 flex items-center justify-center px-4">
        <Card className="w-full max-w-md border-0 shadow-lg">
          <CardContent className="pt-12 pb-12 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">You're on the list</h2>
            <p className="text-gray-600 mb-6">
              We'll be in touch shortly. Check your email for a confirmation and next steps.
            </p>
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-teal-900">
                <strong>What's next?</strong> We'll send you early access details, product updates, and exclusive insights about UK commercial real estate compliance and retrofit capex.
              </p>
            </div>
            <Button
              onClick={() => window.location.href = "/"}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white"
            >
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50">
      {/* Navigation */}
      <nav className="border-b border-gray-200/50 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer hover:opacity-80" onClick={() => window.location.href = "/"}>
            <svg viewBox="0 0 28 28" className="w-7 h-7" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 3C8 3 4 8 4 14c0 6 4 11 10 11 2-4 4-9 4-14 0-3-1-5.5-4-8z" fill="#0d9488" opacity="0.9"/>
              <path d="M14 3c4 2.5 6 5 6 8 0 5-2 10-6 14" stroke="#0d9488" strokeWidth="2" strokeLinecap="round" fill="none"/>
            </svg>
            <span className="text-lg font-semibold text-gray-900">Veridia</span>
          </div>
          <Button
            variant="outline"
            onClick={() => window.location.href = "/"}
            className="text-sm"
          >
            Back to Platform
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
          Get early access to Veridia
        </h1>
        <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
          The UK's first stranded-asset and retrofit-capex screening tool for commercial real estate deals and portfolios.
        </p>

        {/* Signup Form */}
        <div className="max-w-md mx-auto mb-16">
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-lg">Request Early Access</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Your name"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Work Email *</label>
                  <input
                    type="email"
                    value={formData.workEmail}
                    onChange={(e) => setFormData({ ...formData, workEmail: e.target.value })}
                    placeholder="you@company.com"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="Your company"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    <option value="lender">Lender</option>
                    <option value="debt_fund">Debt Fund</option>
                    <option value="investor">Investor</option>
                    <option value="asset_manager">Asset Manager</option>
                    <option value="broker">Broker</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Portfolio Size</label>
                  <select
                    value={formData.portfolioSize}
                    onChange={(e) => setFormData({ ...formData, portfolioSize: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    <option value="1-50">1-50 properties</option>
                    <option value="50-200">50-200 properties</option>
                    <option value="200-500">200-500 properties</option>
                    <option value="500+">500+ properties</option>
                    <option value="individual_deals">I screen individual deals</option>
                  </select>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white h-11 gap-2"
                >
                  {loading ? "Submitting..." : (
                    <>
                      Request Early Access
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  We'll send you a confirmation email and keep you updated on our launch.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white/50 border-t border-gray-200/50 py-16">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">What You'll Get</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Instant Risk Scoring</h3>
              <p className="text-gray-600 text-sm">Stranded asset risk scores for any property in seconds.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">CapEx Estimates</h3>
              <p className="text-gray-600 text-sm">Retrofit capex ranges based on asset type and compliance gap.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Real Data Sources</h3>
              <p className="text-gray-600 text-sm">EPC, flood risk, and Land Registry data integrated.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200/50 bg-white/30 py-8">
        <div className="max-w-4xl mx-auto px-6 text-center text-sm text-gray-600">
          <p>© 2026 Veridia. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}

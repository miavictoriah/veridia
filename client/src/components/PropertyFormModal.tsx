import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { X } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface PropertyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  property?: any;
  onSuccess?: () => void;
}

export function PropertyFormModal({ isOpen, onClose, property, onSuccess }: PropertyFormModalProps) {
  const [formData, setFormData] = useState({
    name: property?.name || "",
    address: property?.address || "",
    propertyType: property?.propertyType || "office",
    yearBuilt: property?.yearBuilt || new Date().getFullYear(),
    epcRating: property?.epcRating || "D",
    riskScore: property?.riskScore || 50,
    complianceStatus: property?.complianceStatus || "compliant",
    estimatedRetrofitCost: property?.estimatedRetrofitCost || 0,
  });

  const createMutation = trpc.properties.create.useMutation();
  const updateMutation = trpc.properties.update.useMutation();
  const utils = trpc.useUtils();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (property?.id) {
        await updateMutation.mutateAsync({
          id: property.id,
          ...formData,
        });
        toast.success("Property updated successfully");
      } else {
        await createMutation.mutateAsync(formData);
        toast.success("Property created successfully");
      }

      await utils.properties.list.invalidate();
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error("Failed to save property");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle>{property ? "Edit Property" : "Add New Property"}</CardTitle>
            <CardDescription>
              {property ? "Update property details and compliance information" : "Add a new commercial property to your portfolio"}
            </CardDescription>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Basic Information</h3>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Property Name</label>
                  <Input
                    placeholder="e.g., London Office Tower"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Property Type</label>
                  <select
                    value={formData.propertyType}
                    onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                  >
                    <option value="office">Office</option>
                    <option value="retail">Retail</option>
                    <option value="industrial">Industrial</option>
                    <option value="mixed-use">Mixed Use</option>
                    <option value="residential">Residential</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Address</label>
                <Input
                  placeholder="e.g., 123 High Street, London, UK"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Year Built</label>
                  <Input
                    type="number"
                    placeholder="2000"
                    value={formData.yearBuilt}
                    onChange={(e) => setFormData({ ...formData, yearBuilt: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">EPC Rating</label>
                  <select
                    value={formData.epcRating}
                    onChange={(e) => setFormData({ ...formData, epcRating: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                  >
                    <option value="A">A (Excellent)</option>
                    <option value="B">B (Very Good)</option>
                    <option value="C">C (Good)</option>
                    <option value="D">D (Average)</option>
                    <option value="E">E (Poor)</option>
                    <option value="F">F (Very Poor)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Compliance Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Compliance</h3>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Risk Score (0-100)</label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.riskScore}
                    onChange={(e) => setFormData({ ...formData, riskScore: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Compliance Status</label>
                  <select
                    value={formData.complianceStatus}
                    onChange={(e) => setFormData({ ...formData, complianceStatus: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                  >
                    <option value="compliant">Compliant</option>
                    <option value="at_risk">At Risk</option>
                    <option value="non_compliant">Non-Compliant</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Estimated Retrofit Cost (£)</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={formData.estimatedRetrofitCost}
                  onChange={(e) => setFormData({ ...formData, estimatedRetrofitCost: parseInt(e.target.value) })}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end pt-4 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {property ? "Update Property" : "Add Property"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

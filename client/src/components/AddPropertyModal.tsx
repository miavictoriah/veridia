import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Search, CheckCircle, AlertTriangle, Building2 } from "lucide-react";

interface AddPropertyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AddPropertyModal({ open, onOpenChange, onSuccess }: AddPropertyModalProps) {
  const [step, setStep] = useState<"input" | "preview" | "saving">("input");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [postcode, setPostcode] = useState("");
  const [propertyType, setPropertyType] = useState("residential");
  const [units, setUnits] = useState("1");
  const [ownershipType, setOwnershipType] = useState("owned");
  const [yearBuilt, setYearBuilt] = useState("");
  const [storeys, setStoreys] = useState("");
  const [notes, setNotes] = useState("");

  // EPC lookup state
  const [epcLookupLoading, setEpcLookupLoading] = useState(false);
  const [epcData, setEpcData] = useState<any>(null);
  const [epcError, setEpcError] = useState<string | null>(null);

  const epcLookup = trpc.properties.lookupEPC.useQuery(
    { postcode, address },
    { enabled: false }
  );

  const createProperty = trpc.properties.create.useMutation({
    onSuccess: () => {
      resetForm();
      onOpenChange(false);
      onSuccess?.();
    },
  });

  const resetForm = () => {
    setStep("input");
    setName("");
    setAddress("");
    setPostcode("");
    setPropertyType("residential");
    setUnits("1");
    setOwnershipType("owned");
    setYearBuilt("");
    setStoreys("");
    setNotes("");
    setEpcData(null);
    setEpcError(null);
  };

  const handleEpcLookup = async () => {
    if (!postcode.trim()) {
      setEpcError("Please enter a postcode");
      return;
    }
    setEpcLookupLoading(true);
    setEpcError(null);
    try {
      const result = await epcLookup.refetch();
      if (result.data && result.data.length > 0) {
        setEpcData(result.data[0]);
        setStep("preview");
      } else {
        setEpcError("No EPC data found for this postcode. You can still add the property manually.");
      }
    } catch (err) {
      setEpcError("EPC lookup failed. You can still add the property manually.");
    } finally {
      setEpcLookupLoading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !address.trim() || !propertyType) return;
    setStep("saving");
    try {
      await createProperty.mutateAsync({
        name: name.trim(),
        address: address.trim(),
        postcode: postcode.trim() || undefined,
        propertyType,
        units: parseInt(units) || 1,
        ownershipType,
        yearBuilt: yearBuilt ? parseInt(yearBuilt) : undefined,
        storeys: storeys ? parseInt(storeys) : undefined,
        notes: notes.trim() || undefined,
        skipEpcLookup: !!epcData, // Skip if we already did a lookup
      });
    } catch (err) {
      setStep("input");
    }
  };

  const getRatingColor = (rating: string) => {
    const colors: Record<string, string> = {
      A: "bg-green-500",
      B: "bg-green-400",
      C: "bg-yellow-400",
      D: "bg-orange-400",
      E: "bg-orange-500",
      F: "bg-red-400",
      G: "bg-red-500",
    };
    return colors[rating] || "bg-gray-400";
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) resetForm(); onOpenChange(v); }}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-teal-600" />
            Add Property
          </DialogTitle>
          <DialogDescription>
            Enter a UK postcode to automatically retrieve EPC data and calculate compliance risk.
          </DialogDescription>
        </DialogHeader>

        {step === "input" && (
          <div className="space-y-4 py-2">
            {/* Property Name */}
            <div className="space-y-1.5">
              <Label htmlFor="name">Property Name *</Label>
              <Input
                id="name"
                placeholder="e.g. 42 High Street Office"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* Address */}
            <div className="space-y-1.5">
              <Label htmlFor="address">Full Address *</Label>
              <Input
                id="address"
                placeholder="e.g. 42 High Street, London"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            {/* Postcode + EPC Lookup */}
            <div className="space-y-1.5">
              <Label htmlFor="postcode">Postcode (for EPC lookup)</Label>
              <div className="flex gap-2">
                <Input
                  id="postcode"
                  placeholder="e.g. SW1A 1AA"
                  value={postcode}
                  onChange={(e) => setPostcode(e.target.value.toUpperCase())}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleEpcLookup}
                  disabled={epcLookupLoading || !postcode.trim()}
                  className="shrink-0"
                >
                  {epcLookupLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  ) : (
                    <Search className="h-4 w-4 mr-1" />
                  )}
                  Lookup EPC
                </Button>
              </div>
              {epcError && (
                <p className="text-sm text-amber-600 flex items-center gap-1 mt-1">
                  <AlertTriangle className="h-3 w-3" />
                  {epcError}
                </p>
              )}
            </div>

            {/* Property Type */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Property Type *</Label>
                <Select value={propertyType} onValueChange={setPropertyType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="residential">Residential</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                    <SelectItem value="mixed">Mixed Use</SelectItem>
                    <SelectItem value="industrial">Industrial</SelectItem>
                    <SelectItem value="retail">Retail</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Ownership</Label>
                <Select value={ownershipType} onValueChange={setOwnershipType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="owned">Owned</SelectItem>
                    <SelectItem value="leasehold">Leasehold</SelectItem>
                    <SelectItem value="freehold">Freehold</SelectItem>
                    <SelectItem value="investment">Investment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Optional fields */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="units">Units</Label>
                <Input
                  id="units"
                  type="number"
                  min="1"
                  value={units}
                  onChange={(e) => setUnits(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="yearBuilt">Year Built</Label>
                <Input
                  id="yearBuilt"
                  type="number"
                  placeholder="e.g. 1985"
                  value={yearBuilt}
                  onChange={(e) => setYearBuilt(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="storeys">Storeys</Label>
                <Input
                  id="storeys"
                  type="number"
                  min="1"
                  placeholder="e.g. 3"
                  value={storeys}
                  onChange={(e) => setStoreys(e.target.value)}
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Input
                id="notes"
                placeholder="Any additional notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
        )}

        {step === "preview" && epcData && (
          <div className="space-y-4 py-2">
            {/* EPC Data Found Banner */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
              <div>
                <p className="text-sm font-medium text-green-800">EPC Data Found</p>
                <p className="text-xs text-green-600">Real data from UK Government EPC Register</p>
              </div>
            </div>

            {/* EPC Rating Display */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div className={`${getRatingColor(epcData.epcRating)} text-white text-3xl font-bold w-16 h-16 rounded-lg flex items-center justify-center`}>
                {epcData.epcRating}
              </div>
              <div>
                <p className="font-semibold text-lg">EPC Rating: {epcData.epcRating}</p>
                <p className="text-sm text-gray-500">SAP Score: {epcData.epcScore}/100</p>
                <p className="text-sm text-gray-500">Potential: {epcData.potentialRating} ({epcData.potentialScore}/100)</p>
              </div>
            </div>

            {/* Property Details */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-2 bg-gray-50 rounded">
                <p className="text-gray-500">Address</p>
                <p className="font-medium">{epcData.address}</p>
              </div>
              <div className="p-2 bg-gray-50 rounded">
                <p className="text-gray-500">Floor Area</p>
                <p className="font-medium">{epcData.floorArea} m²</p>
              </div>
              <div className="p-2 bg-gray-50 rounded">
                <p className="text-gray-500">Annual Energy Cost</p>
                <p className="font-medium">£{epcData.energyCostsAnnual?.toLocaleString()}</p>
              </div>
              <div className="p-2 bg-gray-50 rounded">
                <p className="text-gray-500">CO₂ Emissions</p>
                <p className="font-medium">{epcData.co2Emissions} tonnes/yr</p>
              </div>
              <div className="p-2 bg-gray-50 rounded">
                <p className="text-gray-500">Inspection Date</p>
                <p className="font-medium">{epcData.inspectionDate}</p>
              </div>
              <div className="p-2 bg-gray-50 rounded">
                <p className="text-gray-500">Est. Upgrade Cost</p>
                <p className="font-medium text-amber-600">£{epcData.totalUpgradeCost?.toLocaleString()}</p>
              </div>
            </div>

            {/* Recommendations */}
            {epcData.recommendations && epcData.recommendations.length > 0 && (
              <div>
                <p className="font-medium text-sm mb-2">EPC Recommendations:</p>
                <div className="space-y-1.5">
                  {epcData.recommendations.slice(0, 4).map((rec: any, i: number) => (
                    <div key={i} className="text-xs p-2 bg-teal-50 rounded flex justify-between items-center">
                      <span>{rec.improvement}</span>
                      <span className="text-gray-500 shrink-0 ml-2">{rec.indicativeCost}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button variant="outline" size="sm" onClick={() => setStep("input")} className="w-full">
              ← Back to Edit Details
            </Button>
          </div>
        )}

        {step === "saving" && (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
            <p className="text-sm text-gray-500">Adding property and calculating risk score...</p>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => { resetForm(); onOpenChange(false); }}>
            Cancel
          </Button>
          <Button
            onClick={step === "preview" ? handleSave : handleSave}
            disabled={!name.trim() || !address.trim() || step === "saving"}
          >
            {step === "saving" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
                Saving...
              </>
            ) : epcData ? (
              "Add Property with EPC Data"
            ) : (
              "Add Property"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

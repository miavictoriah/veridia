import { useAuth } from "@/_core/hooks/useAuth";
import { DashboardNav } from "@/components/DashboardNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, Trash2, Eye, Link2, Clock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export default function ShareLinkManager() {
  const { user } = useAuth();
  const [expiryHours, setExpiryHours] = useState("24");
  const [accessType, setAccessType] = useState<"dashboard" | "specific_property" | "report">("dashboard");
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);

  const shareLinksQuery = trpc.shareLinks.list.useQuery();
  const createLinkMutation = trpc.shareLinks.create.useMutation({
    onSuccess: (data) => {
      const baseUrl = window.location.origin;
      const fullLink = `${baseUrl}/share/${data.token}`;
      setGeneratedLink(fullLink);
      toast.success("Share link created successfully!");
      shareLinksQuery.refetch();
    },
    onError: () => {
      toast.error("Failed to create share link");
    },
  });

  const revokeLinkMutation = trpc.shareLinks.revoke.useMutation({
    onSuccess: () => {
      toast.success("Share link revoked");
      shareLinksQuery.refetch();
    },
  });

  const handleCreateLink = () => {
    createLinkMutation.mutate({
      expiryHours: parseInt(expiryHours),
      accessType,
    });
  };

  const handleCopyLink = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink);
      toast.success("Link copied to clipboard!");
    }
  };

  const handleRevokeLink = (token: string) => {
    revokeLinkMutation.mutate({ token });
  };

  const formatExpiry = (expiresAt: Date) => {
    const now = new Date();
    const diff = new Date(expiresAt).getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? "s" : ""} left`;
    if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} left`;
    return "Expired";
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      <div className="lg:ml-60 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Share Links</h1>
          <p className="text-muted-foreground">Create temporary public access links to share your portfolio with others</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create Link */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link2 className="w-5 h-5" />
                  Generate New Share Link
                </CardTitle>
                <CardDescription>Create a temporary public access link</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Access Type */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Access Type</label>
                  <Select value={accessType} onValueChange={(value: any) => setAccessType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dashboard">Full Dashboard</SelectItem>
                      <SelectItem value="specific_property">Specific Property</SelectItem>
                      <SelectItem value="report">Report Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Expiry */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Link Expires In</label>
                  <Select value={expiryHours} onValueChange={setExpiryHours}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Hour</SelectItem>
                      <SelectItem value="24">24 Hours</SelectItem>
                      <SelectItem value="168">7 Days</SelectItem>
                      <SelectItem value="720">30 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Generated Link */}
                {generatedLink && (
                  <div className="bg-muted p-4 rounded-lg space-y-3">
                    <p className="text-sm font-medium">Your Share Link</p>
                    <div className="flex gap-2">
                      <Input value={generatedLink} readOnly className="flex-1" />
                      <Button size="sm" variant="outline" onClick={handleCopyLink} className="gap-2">
                        <Copy className="w-4 h-4" />
                        Copy
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Share this link with others. They can access your portfolio without logging in.
                    </p>
                  </div>
                )}

                <Button onClick={handleCreateLink} disabled={createLinkMutation.isPending} className="w-full">
                  {createLinkMutation.isPending ? "Creating..." : "Generate Share Link"}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Stats */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Active Links</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{shareLinksQuery.data?.filter(l => !l.isRevoked).length || 0}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Total Views</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {shareLinksQuery.data?.reduce((sum, l) => sum + (l.viewCount || 0), 0) || 0}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Links History */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Share Link History
            </CardTitle>
            <CardDescription>Manage your active and expired share links</CardDescription>
          </CardHeader>
          <CardContent>
            {!shareLinksQuery.data || shareLinksQuery.data.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No share links created yet</p>
            ) : (
              <div className="space-y-3">
                {shareLinksQuery.data.map((link) => (
                  <div key={link.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                      <Badge variant={link.isRevoked ? "destructive" : "default"}>
                        {(link.accessType || "dashboard").replace("_", " ")}
                        </Badge>
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatExpiry(link.expiresAt)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Views: {link.viewCount || 0} • Last accessed: {link.lastAccessedAt ? new Date(link.lastAccessedAt).toLocaleDateString() : "Never"}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRevokeLink(link.token)}
                      disabled={Boolean(link.isRevoked) || revokeLinkMutation.isPending}
                      className="gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      {link.isRevoked ? "Revoked" : "Revoke"}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

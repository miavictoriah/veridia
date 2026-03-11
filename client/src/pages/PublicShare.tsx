import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Lock } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function PublicShare(props: any) {
  const token = props.token || "";

  const shareLinkQuery = trpc.shareLinks.getByToken.useQuery(
    { token },
    { enabled: !!token, retry: false }
  );

  if (!token) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              Invalid Link
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              The share link is invalid or missing. Please check the URL and try again.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (shareLinkQuery.isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Verifying share link...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!shareLinkQuery.data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-red-600" />
              Link Expired or Revoked
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This share link has expired or been revoked. Please request a new link from the portfolio owner.
            </p>
            <Button variant="outline" onClick={() => window.location.href = "/"}>
              Return Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const link = shareLinkQuery.data;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Veridia Portfolio</h1>
              <p className="text-muted-foreground mt-1">Shared Portfolio View</p>
            </div>
            <Badge variant="outline" className="gap-2">
              <Lock className="w-3 h-3" />
              Read-Only Access
            </Badge>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Access Type</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold capitalize">{(link.accessType || "dashboard").replace("_", " ")}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Link Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant={link.isRevoked ? "destructive" : "default"}>
                {link.isRevoked ? "Revoked" : "Active"}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Expires</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                {new Date(link.expiresAt).toLocaleDateString()} at{" "}
                {new Date(link.expiresAt).toLocaleTimeString()}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Dashboard Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Portfolio Overview</CardTitle>
            <CardDescription>This is a read-only preview of the shared portfolio</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Total Properties</p>
                <p className="text-3xl font-bold">12</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Compliance Rate</p>
                <p className="text-3xl font-bold text-green-600">75%</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">High Risk Assets</p>
                <p className="text-3xl font-bold text-red-600">3</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">5-Year Capex</p>
                <p className="text-3xl font-bold">£8.2M</p>
              </div>
            </div>

            <div className="bg-muted p-6 rounded-lg text-center">
              <Lock className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-4">
                This is a preview of the shared portfolio. For full access and interactive features, please contact the portfolio owner.
              </p>
              <Button variant="outline">Request Full Access</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

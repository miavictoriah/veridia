import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function CardSkeleton() {
  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-2">
        <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
      </CardHeader>
      <CardContent>
        <div className="h-8 bg-muted rounded w-1/3 animate-pulse mb-2" />
        <div className="h-3 bg-muted rounded w-1/2 animate-pulse" />
      </CardContent>
    </Card>
  );
}

export function ChartSkeleton() {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <div className="h-4 bg-muted rounded w-1/3 animate-pulse mb-2" />
        <div className="h-3 bg-muted rounded w-1/2 animate-pulse" />
      </CardHeader>
      <CardContent>
        <div className="h-64 bg-muted rounded animate-pulse" />
      </CardContent>
    </Card>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <div className="h-4 bg-muted rounded w-1/3 animate-pulse" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <div className="h-4 bg-muted rounded flex-1 animate-pulse" />
              <div className="h-4 bg-muted rounded flex-1 animate-pulse" />
              <div className="h-4 bg-muted rounded flex-1 animate-pulse" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function MetricSkeletons() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <MetricSkeletons />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
    </div>
  );
}

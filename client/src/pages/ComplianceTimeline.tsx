import { useAuth } from "@/_core/hooks/useAuth";
import { DashboardNav } from "@/components/DashboardNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, Clock, Zap } from "lucide-react";

export default function ComplianceTimeline() {
  const tasks = [
    {
      id: 1,
      property: "Manchester Business Park",
      task: "EPC Assessment & Planning",
      dueDate: "2025-01-15",
      status: "pending",
      priority: "critical",
      onCriticalPath: true,
    },
    {
      id: 2,
      property: "Manchester Business Park",
      task: "Retrofit Design & Approvals",
      dueDate: "2025-03-30",
      status: "pending",
      priority: "critical",
      onCriticalPath: true,
    },
    {
      id: 3,
      property: "Manchester Business Park",
      task: "Retrofit Construction Phase 1",
      dueDate: "2025-09-30",
      status: "pending",
      priority: "critical",
      onCriticalPath: true,
    },
    {
      id: 4,
      property: "Bristol Warehouse Complex",
      task: "Emergency Retrofit Assessment",
      dueDate: "2025-01-30",
      status: "pending",
      priority: "critical",
      onCriticalPath: true,
    },
    {
      id: 5,
      property: "Bristol Warehouse Complex",
      task: "Retrofit Execution",
      dueDate: "2025-08-31",
      status: "pending",
      priority: "critical",
      onCriticalPath: true,
    },
    {
      id: 6,
      property: "Newcastle Office Campus",
      task: "Energy Audit & Planning",
      dueDate: "2025-02-28",
      status: "pending",
      priority: "high",
      onCriticalPath: true,
    },
    {
      id: 7,
      property: "Newcastle Office Campus",
      task: "Retrofit Implementation",
      dueDate: "2025-10-31",
      status: "pending",
      priority: "high",
      onCriticalPath: true,
    },
  ];

  const getPriorityColor = (priority: string) => {
    if (priority === "critical") return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
    if (priority === "high") return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
    return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
  };

  const getStatusColor = (status: string) => {
    if (status === "completed") return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    if (status === "in_progress") return "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400";
    return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
  };

  const criticalPathTasks = tasks.filter(t => t.onCriticalPath);

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      <div className="lg:ml-60 pt-16 lg:pt-0 p-8 space-y-8">
      <div>
        <h1 className="text-4xl font-bold">Compliance Timeline</h1>
        <p className="text-muted-foreground mt-2">Gantt chart and critical path analysis for regulatory compliance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{tasks.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Across 5 properties</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Critical Path</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{criticalPathTasks.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Tasks on critical path</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">24 months</div>
            <p className="text-xs text-muted-foreground mt-1">Jan 2025 - Dec 2026</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">12.02M</div>
            <p className="text-xs text-muted-foreground mt-1">Capex allocation</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            Critical Path Tasks
          </CardTitle>
          <CardDescription>Tasks that directly impact project completion date</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {criticalPathTasks.map((task) => (
              <div key={task.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <p className="font-semibold">{task.task}</p>
                    <p className="text-sm text-muted-foreground">{task.property}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                    <Badge className={getStatusColor(task.status)}>{task.status}</Badge>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">Due: {task.dueDate}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Compliance Tasks</CardTitle>
          <CardDescription>Complete task list with status and priority</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {tasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                <div className="flex items-center gap-3 flex-1">
                  {task.status === "completed" ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ) : (
                    <Clock className="w-5 h-5 text-muted-foreground" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-sm">{task.task}</p>
                    <p className="text-xs text-muted-foreground">{task.property}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {task.onCriticalPath && (
                    <Badge variant="outline" className="bg-red-50 text-red-700 dark:bg-red-900/20">Critical</Badge>
                  )}
                  <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                  <span className="text-sm text-muted-foreground min-w-fit">{task.dueDate}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-teal-200 dark:border-teal-900/50 bg-teal-50 dark:bg-teal-900/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-teal-600" />
            Critical Path Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>
            <strong>Project Completion Date:</strong> December 2026 (assuming no delays)
          </p>
          <p>
            <strong>Key Bottleneck:</strong> Manchester Business Park retrofit design approval (due March 2025). Any delay cascades to entire project.
          </p>
          <p>
            <strong>Recommended Action:</strong> Begin Manchester assessment immediately. This is the first critical path task and must start on schedule.
          </p>
          <p>
            <strong>Risk Mitigation:</strong> Parallel track Bristol emergency retrofit to ensure portfolio compliance even if Manchester faces delays.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button size="lg" className="gap-2">
          <Zap className="w-4 h-4" />
          Export Gantt Chart
        </Button>
        <Button size="lg" variant="outline">
          View Dependencies
        </Button>
      </div>
      </div>
    </div>
  );
}

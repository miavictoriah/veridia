import { Button } from "@/components/ui/button";
import { LogOut, Menu, X, LayoutDashboard, Building2, ShieldCheck, FileBarChart, Settings, ChevronLeft, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";

export function DashboardNav() {
  const [, setLocation] = useLocation();
  const [location] = useLocation();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const logoutMutation = trpc.auth.logout.useMutation();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location, isMobile]);

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    setLocation("/");
  };

  const navItems = [
    { label: "Portfolio", path: "/dashboard", icon: LayoutDashboard, description: "Overview & analytics" },
    { label: "Properties", path: "/assets", icon: Building2, description: "Asset management" },
    { label: "Compliance", path: "/forecasting", icon: ShieldCheck, description: "Forecasting & timeline" },
    { label: "Deal Screen", path: "/deal-screen", icon: TrendingUp, description: "Risk screening" },
    { label: "Reports", path: "/reports", icon: FileBarChart, description: "Insights & exports" },
    { label: "Settings", path: "/pricing", icon: Settings, description: "Plan & preferences" },
  ];

  const isActive = (path: string) => location === path;

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-60" : "w-[68px]"
        } border-r border-border bg-sidebar transition-all duration-200 flex flex-col overflow-hidden fixed h-screen left-0 top-0 z-40 ${
          !sidebarOpen && isMobile ? "-translate-x-full" : ""
        } lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="h-[60px] border-b border-border flex items-center justify-between px-4">
          <div
            className={`flex items-center gap-2.5 cursor-pointer hover:opacity-80 transition-opacity ${
              !sidebarOpen && "justify-center w-full"
            }`}
            onClick={() => setLocation("/")}
          >
            {/* Veridia Logo - Leaf/Shield hybrid */}
            <svg viewBox="0 0 28 28" className="w-7 h-7 flex-shrink-0" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 3C8 3 4 8 4 14c0 6 4 11 10 11 2-4 4-9 4-14 0-3-1-5.5-4-8z" fill="#0d9488" opacity="0.9"/>
              <path d="M14 3c4 2.5 6 5 6 8 0 5-2 10-6 14" stroke="#0d9488" strokeWidth="2" strokeLinecap="round" fill="none"/>
              <path d="M8 12c2-1 4-1 6 0" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
              <path d="M9 16c2-1 3.5-1 5 0" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
            </svg>
            {sidebarOpen && (
              <span className="text-[17px] font-semibold text-foreground tracking-tight">Veridia</span>
            )}
          </div>
          {sidebarOpen && (
            <button
              className="hidden lg:flex items-center justify-center w-6 h-6 rounded hover:bg-secondary/80 text-muted-foreground transition-colors"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto py-3 px-2.5 space-y-0.5">
          {!sidebarOpen && !isMobile && (
            <button
              className="w-full flex items-center justify-center py-2.5 mb-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-[18px] h-[18px]" />
            </button>
          )}
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => setLocation(item.path)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150 ${
                  isActive(item.path)
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                } ${!sidebarOpen ? "justify-center px-0" : ""}`}
                title={!sidebarOpen ? item.label : ""}
              >
                <Icon className={`w-[18px] h-[18px] flex-shrink-0 ${isActive(item.path) ? "text-primary" : ""}`} />
                {sidebarOpen && (
                  <div className="flex flex-col items-start">
                    <span>{item.label}</span>
                    <span className="text-[11px] font-normal text-muted-foreground/70">{item.description}</span>
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Section */}
        {sidebarOpen && (
          <div className="border-t border-border p-3 space-y-3">
            <div className="flex items-center gap-2.5 px-1">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-semibold text-primary">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-medium text-foreground truncate">{user?.name}</p>
                <p className="text-[11px] text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="w-full gap-2 text-[13px] text-muted-foreground hover:text-foreground h-8"
              onClick={handleLogout}
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign out
            </Button>
          </div>
        )}
      </div>

      {/* Spacer for sidebar width */}
      <div className={`${sidebarOpen ? "w-60" : "w-[68px]"} transition-all duration-200 hidden lg:block flex-shrink-0`} />

      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 border-b border-border bg-background/95 backdrop-blur-sm flex items-center px-4 gap-3 z-50">
        <button
          className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-secondary/60 text-muted-foreground transition-colors"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        <div className="flex items-center gap-2">
          <svg viewBox="0 0 28 28" className="w-6 h-6" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 3C8 3 4 8 4 14c0 6 4 11 10 11 2-4 4-9 4-14 0-3-1-5.5-4-8z" fill="#0d9488" opacity="0.9"/>
            <path d="M14 3c4 2.5 6 5 6 8 0 5-2 10-6 14" stroke="#0d9488" strokeWidth="2" strokeLinecap="round" fill="none"/>
          </svg>
          <span className="text-[15px] font-semibold text-foreground">Veridia</span>
        </div>
        <div className="flex-1" />
        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-[11px] font-semibold text-primary">
            {user?.name?.charAt(0).toUpperCase()}
          </span>
        </div>
      </div>
    </>
  );
}

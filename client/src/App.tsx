import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ToastContainer } from "./components/Toast";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Assets from "./pages/Assets";
import Forecasting from "./pages/Forecasting";
import Reports from "./pages/Reports";
import Pricing from "./pages/Pricing";
import PublicShare from "./pages/PublicShare";
import PropertyDetail from "./pages/PropertyDetail";
import DealScreen from "./pages/DealScreen";
import EarlyAccess from "./pages/EarlyAccess";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/assets"} component={Assets} />
      <Route path={"/forecasting"} component={Forecasting} />
      <Route path={"/reports"} component={Reports} />
      <Route path={"/pricing"} component={Pricing} />
      <Route path={"/share/:token"} component={PublicShare} />
      <Route path={"/property/:id"} component={PropertyDetail} />
      <Route path={"/deal-screen"} component={DealScreen} />
      <Route path={"/early-access"} component={EarlyAccess} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <ToastContainer />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

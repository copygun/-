import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/layout/app-layout";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Orders from "@/pages/orders";
import Materials from "@/pages/materials";
import Production from "@/pages/production";
import Documents from "@/pages/documents";
import Customers from "@/pages/customers";
import LabelLibrary from "@/pages/label-library";
import Reports from "@/pages/reports";
import { useEffect } from "react";
import { installMockApi } from "@/mock/mockApi";

function Router() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/orders" component={Orders} />
        <Route path="/label-library" component={LabelLibrary} />
        <Route path="/materials" component={Materials} />
        <Route path="/production" component={Production} />
        <Route path="/documents" component={Documents} />
        <Route path="/customers" component={Customers} />
        <Route path="/reports" component={Reports} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  // Initialize app
  useEffect(() => {
    // Install mock API for static build
    if (import.meta.env.VITE_STATIC_BUILD === 'true') {
      installMockApi();
    }
    
    // Force dark mode on app load
    document.documentElement.classList.add('dark');
    document.body.classList.add('dark');
    document.body.style.backgroundColor = 'hsl(222.2, 84%, 4.9%)';
    document.body.style.color = 'hsl(210, 40%, 98%)';
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

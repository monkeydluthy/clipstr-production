import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PixelTooltipProvider } from "@/components/ui/pixel-tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import DashboardLayout from "./components/Dashboard/DashboardLayout";
import Generate from "./components/Dashboard/Generate";
import Library from "./components/Dashboard/Library";
import Styles from "./components/Dashboard/Styles";
import Integrations from "./components/Dashboard/Integrations";
import Arena from "./components/Dashboard/Arena";
import Analytics from "./components/Dashboard/Analytics";
import ComingSoon from "./components/Dashboard/ComingSoon";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <PixelTooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route path="generate" element={<Generate />} />
              <Route path="library" element={<Library />} />
              <Route path="styles" element={<Styles />} />
              <Route path="integrations" element={<Integrations />} />
              <Route path="arena" element={<Arena />} />
              <Route path="analytics" element={<Analytics />} />
            </Route>
            {/* Direct dashboard routes (for easier navigation) */}
            <Route path="/generate" element={<DashboardLayout />}>
              <Route index element={<Generate />} />
            </Route>
            <Route path="/library" element={<DashboardLayout />}>
              <Route index element={<Library />} />
            </Route>
            <Route path="/styles" element={<DashboardLayout />}>
              <Route index element={<Styles />} />
            </Route>
            <Route path="/integrations" element={<DashboardLayout />}>
              <Route index element={<Integrations />} />
            </Route>
            <Route path="/arena" element={<DashboardLayout />}>
              <Route index element={<Arena />} />
            </Route>
            <Route path="/analytics" element={<DashboardLayout />}>
              <Route index element={<Analytics />} />
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </PixelTooltipProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

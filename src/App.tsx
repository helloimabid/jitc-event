import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import Index from "./pages/Index";
import Events from "./pages/Events";
import EventDetail from "./pages/EventDetail";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import { initializeAdmin } from "./services/authService";
import { testSupabaseConnection } from "./lib/supabase";
import { toast } from "sonner";
import Loader from "./components/ui/loader";

const queryClient = new QueryClient();

const App = () => {
  const [connectionTested, setConnectionTested] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        // Simulate minimum loading time for better UX
        const minLoadingTime = new Promise(resolve => setTimeout(resolve, 1500));
        
        
        const connectionSuccess = await testSupabaseConnection();
        setConnectionTested(true);

        if (connectionSuccess) {
          
          // Initialize the admin account when the app first loads
          await initializeAdmin();
        } else {
          console.error("Failed to connect to Supabase");
          toast.error("Database connection failed", {
            description: "Check console for details. The app may not function correctly."
          });
        }
        
        // Wait for minimum loading time to complete
        await minLoadingTime;
        setIsLoading(false);
      } catch (error) {
        console.error("Initialization error:", error);
        toast.error("Initialization failed", {
          description: "There was a problem setting up the application."
        });
        setIsLoading(false);
      }
    };

    init();
  }, []);

  if (isLoading) {
    return <Loader fullScreen />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/events" element={<Events />} />
              <Route path="/events/:category" element={<Events />} />
              <Route path="/event/:id" element={<EventDetail />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/admin-dashboard" element={<Admin />} /> {/* Fallback route */}
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

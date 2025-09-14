import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "@/components/ErrorBoundary";
import Home from "@/pages/Home";
import ProductDetails from "@/pages/ProductDetails";
import ProjectDetails from "@/pages/ProjectDetails";
import Calculator from "@/pages/Calculator";
import CertificatesPage from "@/pages/CertificatesPage";
import FAQPage from "@/pages/FAQPage";
import VideoPage from "@/pages/VideoPage";
import Contact from "@/pages/Contact";
import Gallery from "@/pages/Gallery";
import ImageGalleryDemo from "@/pages/ImageGalleryDemo";
import WhereToBuy from "@/pages/WhereToBuy";
import NotFound from "@/pages/not-found";
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import AdminPanel from "@/components/AdminPanel";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/catalog" component={Home} />
      <Route path="/product/:id" component={ProductDetails} />
      <Route path="/project/:id" component={ProjectDetails} />
      <Route path="/gallery" component={Gallery} />
      <Route path="/gallery-demo" component={ImageGalleryDemo} />
      <Route path="/where-to-buy" component={WhereToBuy} />
      <Route path="/calculator" component={Calculator} />
      <Route path="/certificates" component={CertificatesPage} />
      <Route path="/faq" component={FAQPage} />
      <Route path="/video" component={VideoPage} />
      <Route path="/contact" component={Contact} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Shift + A opens admin panel
      if (e.shiftKey && e.key === 'A') {
        e.preventDefault();
        setIsAdminOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <FavoritesProvider>
            <Toaster />
            <Router />
            <AdminPanel 
              isOpen={isAdminOpen} 
              onClose={() => setIsAdminOpen(false)} 
            />
          </FavoritesProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;

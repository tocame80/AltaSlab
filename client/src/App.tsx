import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/Home";
import ProductDetails from "@/pages/ProductDetails";
import Calculator from "@/pages/Calculator";
import CertificatesPage from "@/pages/CertificatesPage";
import FAQPage from "@/pages/FAQPage";
import VideoPage from "@/pages/VideoPage";
import Contact from "@/pages/Contact";
import NotFound from "@/pages/not-found";
import { FavoritesProvider } from "@/contexts/FavoritesContext";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/product/:id" component={ProductDetails} />
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
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <FavoritesProvider>
          <Toaster />
          <Router />
        </FavoritesProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

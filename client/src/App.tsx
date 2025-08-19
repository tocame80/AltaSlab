import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/Home";
import ProductDetails from "@/pages/ProductDetails";
import Calculator from "@/pages/Calculator";
import Certificates from "@/pages/Certificates";
import FAQ from "@/pages/FAQ";
import VideoInstructions from "@/pages/VideoInstructions";
import Contact from "@/pages/Contact";
import NotFound from "@/pages/not-found";
import { FavoritesProvider } from "@/contexts/FavoritesContext";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/product/:id" component={ProductDetails} />
      <Route path="/calculator" component={Calculator} />
      <Route path="/certificates" component={Certificates} />
      <Route path="/faq" component={FAQ} />
      <Route path="/video" component={VideoInstructions} />
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

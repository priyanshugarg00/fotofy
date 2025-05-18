import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

import NotFound from "@/pages/not-found";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Home from "@/pages/Home";
import Photographers from "@/pages/Photographers";
import PhotographerProfile from "@/pages/PhotographerProfile";
import CustomerDashboard from "@/pages/CustomerDashboard";
import PhotographerDashboard from "@/pages/PhotographerDashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import Booking from "@/pages/Booking";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import JoinPhotographer from "@/pages/JoinPhotographer";

const stripePromise = import.meta.env.VITE_STRIPE_PUBLIC_KEY
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
  : Promise.resolve(null);

function Router() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/photographers" component={Photographers} />
          <Route path="/photographers/:id">
            {(params) => <PhotographerProfile id={params.id} />}
          </Route>
          <Route path="/booking/:id">
            {(params) => <Booking photographerId={params.id} />}
          </Route>
          <Route path="/dashboard/customer" component={CustomerDashboard} />
          <Route path="/dashboard/photographer" component={PhotographerDashboard} />
          <Route path="/dashboard/admin" component={AdminDashboard} />
          <Route path="/about" component={About} />
          <Route path="/contact" component={Contact} />
          <Route path="/join-photographer" component={JoinPhotographer} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Elements stripe={stripePromise}>
          <Toaster />
          <Router />
        </Elements>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  Search, 
  Clipboard, 
  CreditCard, 
  Image, 
  UserPlus, 
  Calendar, 
  Check, 
  DollarSign
} from "lucide-react";

const HowItWorks = () => {
  return (
    <section className="py-12 bg-white" id="how-it-works">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-secondary-800 sm:text-4xl">How Fotofy Works</h2>
          <p className="mt-3 max-w-2xl mx-auto text-lg text-secondary-500">Book your perfect photo shoot in just a few simple steps</p>
        </div>
        
        <div className="mt-16">
          <div className="relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-white text-lg font-medium text-secondary-600">For Customers</span>
            </div>
          </div>
          
          <div className="mt-10">
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary text-white">
                  <Search className="h-6 w-6" />
                </div>
                <div className="ml-16">
                  <h3 className="text-lg font-medium text-secondary-800">1. Search</h3>
                  <p className="mt-2 text-base text-secondary-500">Search for photographers in your city, filter by shoot type, date, and price.</p>
                </div>
              </div>
              
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary text-white">
                  <Clipboard className="h-6 w-6" />
                </div>
                <div className="ml-16">
                  <h3 className="text-lg font-medium text-secondary-800">2. Book</h3>
                  <p className="mt-2 text-base text-secondary-500">Select a photographer, pick a date from their live calendar, and book instantly.</p>
                </div>
              </div>
              
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary text-white">
                  <CreditCard className="h-6 w-6" />
                </div>
                <div className="ml-16">
                  <h3 className="text-lg font-medium text-secondary-800">3. Pay</h3>
                  <p className="mt-2 text-base text-secondary-500">Secure payment via credit/debit card or UPI. Only pay when you're satisfied.</p>
                </div>
              </div>
              
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary text-white">
                  <Image className="h-6 w-6" />
                </div>
                <div className="ml-16">
                  <h3 className="text-lg font-medium text-secondary-800">4. Enjoy</h3>
                  <p className="mt-2 text-base text-secondary-500">Receive your professionally edited photos directly to your account.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-16 relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-white text-lg font-medium text-secondary-600">For Photographers</span>
            </div>
          </div>
          
          <div className="mt-10">
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-accent-600 text-white">
                  <UserPlus className="h-6 w-6" />
                </div>
                <div className="ml-16">
                  <h3 className="text-lg font-medium text-secondary-800">1. Register</h3>
                  <p className="mt-2 text-base text-secondary-500">Create your profile, showcase your portfolio, and set your service details.</p>
                </div>
              </div>
              
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-accent-600 text-white">
                  <Calendar className="h-6 w-6" />
                </div>
                <div className="ml-16">
                  <h3 className="text-lg font-medium text-secondary-800">2. Manage</h3>
                  <p className="mt-2 text-base text-secondary-500">Control your schedule, pricing, and availability through your dashboard.</p>
                </div>
              </div>
              
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-accent-600 text-white">
                  <Check className="h-6 w-6" />
                </div>
                <div className="ml-16">
                  <h3 className="text-lg font-medium text-secondary-800">3. Accept</h3>
                  <p className="mt-2 text-base text-secondary-500">Review and accept booking requests from clients in your area.</p>
                </div>
              </div>
              
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-accent-600 text-white">
                  <DollarSign className="h-6 w-6" />
                </div>
                <div className="ml-16">
                  <h3 className="text-lg font-medium text-secondary-800">4. Get Paid</h3>
                  <p className="mt-2 text-base text-secondary-500">Receive direct payments to your account after successful deliveries.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-16 text-center">
          <Link href="/photographers">
            <Button size="lg" className="mr-4">
              Find a Photographer
            </Button>
          </Link>
          <Link href="/join">
            <Button variant="outline" size="lg" asChild>
              <Link href="/photographer-signup">Join as Photographer</Link>
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;

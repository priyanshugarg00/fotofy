import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StarRating } from "@/components/ui/stars";
import { Badge } from "@/components/ui/badge";
import BookingForm from "@/components/BookingForm";
import CheckoutForm from "@/components/checkout/CheckoutForm";
import { ArrowLeft, CalendarCheck, CheckCircle, MapPin } from "lucide-react";

interface BookingProps {
  photographerId: string;
}

const Booking = ({ photographerId }: BookingProps) => {
  const [location, setLocation] = useLocation();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [currentStep, setCurrentStep] = useState<"booking" | "payment">("booking");
  const [bookingData, setBookingData] = useState<any>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      localStorage.setItem("redirectAfterLogin", location);
      window.location.href = "/api/login";
    }
  }, [isAuthLoading, isAuthenticated, location]);

  // Fetch photographer data
  const { data: photographer, isLoading: isPhotographerLoading } = useQuery({
    queryKey: [`/api/photographers/${photographerId}`],
    enabled: !isAuthLoading && isAuthenticated,
    queryFn: async () => {
      const response = await fetch(`/api/photographers/${photographerId}`);
      if (!response.ok) throw new Error("Failed to fetch photographer");
      return response.json();
    },
  });

  // Set page title and description
  useEffect(() => {
    if (photographer) {
      document.title = `Book ${photographer.firstName} ${photographer.lastName} | Fotofy`;
      
      // Update meta description
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.setAttribute('name', 'description');
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute('content', 
        `Book a photoshoot session with ${photographer.firstName} ${photographer.lastName}. Select date, time, and pay securely online.`
      );
    }
  }, [photographer]);

  const handleBookingSubmit = async (data: any) => {
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          photographerId: parseInt(photographerId),
          totalAmount: photographer.baseRate,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create booking');
      }
      
      const result = await response.json();
      
      // Set booking data and client secret
      setBookingData(result.booking);
      if (result.clientSecret) {
        setClientSecret(result.clientSecret);
      }
      
      // Move to payment step
      setCurrentStep("payment");
      
      // If no client secret (Stripe not configured), redirect to dashboard
      if (!result.clientSecret) {
        setTimeout(() => {
          setLocation("/dashboard/customer");
        }, 3000);
      }
    } catch (error) {
      console.error('Error creating booking:', error);
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`;
  };

  // Show loading state
  if (isAuthLoading || isPhotographerLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="h-12 bg-gray-300 rounded w-3/4 mb-4"></div>
              <div className="space-y-4">
                <div className="h-6 bg-gray-300 rounded"></div>
                <div className="h-6 bg-gray-300 rounded"></div>
                <div className="h-6 bg-gray-300 rounded"></div>
              </div>
            </div>
            <div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="h-8 bg-gray-300 rounded w-1/2 mb-4"></div>
                <div className="space-y-4">
                  <div className="h-10 bg-gray-300 rounded"></div>
                  <div className="h-10 bg-gray-300 rounded"></div>
                  <div className="h-10 bg-gray-300 rounded"></div>
                  <div className="h-12 bg-gray-300 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!photographer) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6 text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-2">Photographer Not Found</h1>
            <p className="text-gray-600 mb-6">The photographer you're trying to book doesn't exist or may have been removed.</p>
            <Button onClick={() => setLocation("/photographers")}>
              Browse Photographers
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4">
        <Button 
          variant="ghost" 
          className="mb-6" 
          onClick={() => setLocation(`/photographers/${photographerId}`)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Photographer Profile
        </Button>
        
        <Tabs defaultValue={currentStep} value={currentStep} onValueChange={(value) => setCurrentStep(value as any)}>
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="booking" disabled={currentStep === "payment"}>
              1. Booking Details
            </TabsTrigger>
            <TabsTrigger value="payment" disabled={currentStep === "booking"}>
              2. Review & Payment
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="booking">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              <div className="md:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Photographer</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center mb-4">
                      <Avatar className="h-12 w-12 mr-3">
                        <AvatarImage 
                          src={photographer.profileImageUrl} 
                          alt={`${photographer.firstName} ${photographer.lastName}`} 
                        />
                        <AvatarFallback>
                          {getInitials(photographer.firstName, photographer.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-lg">
                          {photographer.firstName} {photographer.lastName}
                        </h3>
                        <div className="flex items-center">
                          <StarRating rating={photographer.rating.average} size="sm" />
                          <span className="ml-2 text-sm text-gray-500">
                            ({photographer.rating.count})
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center text-gray-600 mb-2">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{photographer.city}, {photographer.state}</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mt-4">
                      {photographer.categories.map((category: any) => (
                        <Badge key={category.id} variant="outline">
                          {category.name}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="mt-6 p-4 bg-gray-50 rounded-md">
                      <h4 className="font-semibold mb-2">Pricing</h4>
                      <p className="text-2xl font-bold text-primary">
                        ₹{photographer.baseRate.toLocaleString('en-IN')}
                        <span className="text-sm font-normal text-gray-500 ml-1">per session</span>
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="md:col-span-3">
                <Card>
                  <CardHeader>
                    <CardTitle>Book a Session</CardTitle>
                    <CardDescription>
                      Select the date, time, and details for your photoshoot
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <BookingForm 
                      photographer={photographer}
                      onSubmit={handleBookingSubmit}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="payment">
            {bookingData ? (
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <div className="md:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Booking Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center">
                          <Avatar className="h-10 w-10 mr-3">
                            <AvatarImage 
                              src={photographer.profileImageUrl} 
                              alt={`${photographer.firstName} ${photographer.lastName}`} 
                            />
                            <AvatarFallback>
                              {getInitials(photographer.firstName, photographer.lastName)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold">
                              {photographer.firstName} {photographer.lastName}
                            </h3>
                            <div className="text-sm text-gray-500">
                              {photographer.city}, {photographer.state}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-start pt-4 border-t border-gray-200">
                          <CalendarCheck className="h-5 w-5 text-gray-400 mr-2" />
                          <div>
                            <div className="font-medium">Session Date & Time</div>
                            <div className="text-gray-600">
                              {new Date(bookingData.bookingDate).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </div>
                            <div className="text-gray-600">
                              {bookingData.startTime.slice(0, 5)} - {bookingData.endTime.slice(0, 5)}
                            </div>
                          </div>
                        </div>
                        
                        {bookingData.location && (
                          <div className="flex items-start pt-4 border-t border-gray-200">
                            <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                            <div>
                              <div className="font-medium">Session Location</div>
                              <div className="text-gray-600">{bookingData.location}</div>
                            </div>
                          </div>
                        )}
                        
                        {bookingData.notes && (
                          <div className="pt-4 border-t border-gray-200">
                            <div className="font-medium">Additional Notes</div>
                            <div className="text-gray-600 mt-1">{bookingData.notes}</div>
                          </div>
                        )}
                        
                        <div className="pt-4 border-t border-gray-200">
                          <div className="flex justify-between mb-2">
                            <span className="font-medium">Session Fee</span>
                            <span>₹{bookingData.totalAmount.toLocaleString('en-IN')}</span>
                          </div>
                          <div className="flex justify-between font-bold text-lg">
                            <span>Total</span>
                            <span className="text-primary">₹{bookingData.totalAmount.toLocaleString('en-IN')}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="md:col-span-3">
                  <Card>
                    <CardHeader>
                      <CardTitle>Payment</CardTitle>
                      <CardDescription>
                        Complete your booking by making a secure payment
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {clientSecret ? (
                        <CheckoutForm clientSecret={clientSecret} />
                      ) : (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                          <h3 className="text-lg font-medium text-green-800 mb-2">Booking Successful!</h3>
                          <p className="text-green-700 mb-4">
                            Your booking has been confirmed. You will be redirected to your dashboard shortly.
                          </p>
                          <Button onClick={() => setLocation("/dashboard/customer")}>
                            Go to Dashboard
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <h3 className="text-lg font-medium text-red-600 mb-2">Error</h3>
                  <p className="text-gray-600 mb-4">Failed to create booking. Please try again.</p>
                  <Button onClick={() => setCurrentStep("booking")}>
                    Back to Booking
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Booking;

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Card, 
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StarRating } from "@/components/ui/stars";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Mail, Phone, Calendar, DollarSign, Clock, Camera, Award, Shield, CheckCircle } from "lucide-react";

interface PhotographerProfileProps {
  id: string;
}

const PhotographerProfile = ({ id }: PhotographerProfileProps) => {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Fetch photographer data
  const { data: photographer, isLoading } = useQuery({
    queryKey: [`/api/photographers/${id}`],
    queryFn: async () => {
      const response = await fetch(`/api/photographers/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch photographer");
      }
      return response.json();
    },
  });

  // Fetch reviews
  const { data: reviews } = useQuery({
    queryKey: [`/api/photographers/${id}/reviews`],
    queryFn: async () => {
      const response = await fetch(`/api/photographers/${id}/reviews`);
      if (!response.ok) {
        throw new Error("Failed to fetch reviews");
      }
      return response.json();
    },
  });

  // Fetch availability
  const { data: availability } = useQuery({
    queryKey: [`/api/photographers/${id}/availability`],
    queryFn: async () => {
      const response = await fetch(`/api/photographers/${id}/availability`);
      if (!response.ok) {
        throw new Error("Failed to fetch availability");
      }
      return response.json();
    },
  });

  // Handle booking button click
  const handleBooking = () => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please login to book a session.",
        variant: "destructive",
      });
      
      // Store the intended destination for post-login redirect
      localStorage.setItem("redirectAfterLogin", `/photographers/${id}`);
      window.location.href = "/api/login";
      return;
    }
    
    setLocation(`/booking/${id}`);
  };

  // Set page title and description
  useEffect(() => {
    if (photographer) {
      document.title = `${photographer.firstName} ${photographer.lastName} | Fotofy`;
      
      // Update meta description
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.setAttribute('name', 'description');
        document.head.appendChild(metaDescription);
      }
      
      const categories = photographer.categories.map((c: any) => c.name).join(", ");
      metaDescription.setAttribute('content', 
        `Book ${photographer.firstName} ${photographer.lastName}, professional photographer specializing in ${categories}. Based in ${photographer.city}, ${photographer.state}. View portfolio and book sessions online.`
      );
    }
  }, [photographer]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="h-48 bg-gray-300 rounded-lg mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center mb-6">
                  <div className="h-20 w-20 bg-gray-300 rounded-full mr-4"></div>
                  <div>
                    <div className="h-6 bg-gray-300 rounded w-40 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
                <div className="mt-6">
                  <div className="h-10 bg-gray-300 rounded"></div>
                </div>
              </div>
            </div>
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="h-6 bg-gray-300 rounded w-32 mb-4"></div>
                <div className="grid grid-cols-2 gap-4">
                  {Array(6).fill(0).map((_, i) => (
                    <div key={i} className="h-48 bg-gray-300 rounded"></div>
                  ))}
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
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <Card>
          <CardContent className="p-6 text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-2">Photographer Not Found</h1>
            <p className="text-gray-600 mb-6">The photographer you're looking for doesn't exist or may have been removed.</p>
            <Button onClick={() => setLocation("/photographers")}>
              Browse Photographers
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`;
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Cover Image or Header */}
        <div className="h-48 bg-gradient-to-r from-primary-700 to-primary-500 rounded-lg shadow-md mb-8 flex items-center justify-center">
          <Camera className="h-16 w-16 text-white opacity-20" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar with personal info */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center mb-6">
                  <Avatar className="h-20 w-20 mr-4">
                    <AvatarImage 
                      src={photographer.profileImageUrl} 
                      alt={`${photographer.firstName} ${photographer.lastName}`} 
                    />
                    <AvatarFallback className="text-lg">
                      {getInitials(photographer.firstName, photographer.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      {photographer.firstName} {photographer.lastName}
                      {photographer.isVerified && (
                        <Badge variant="outline" className="ml-2 bg-blue-50 border-blue-200 text-blue-600">
                          <Shield className="h-3 w-3 mr-1" /> Verified
                        </Badge>
                      )}
                    </h1>
                    <div className="flex items-center mt-1">
                      <StarRating rating={photographer.rating.average} />
                      <span className="ml-2 text-sm text-gray-500">
                        {photographer.rating.average.toFixed(1)} ({photographer.rating.count} reviews)
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4 text-gray-600">
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                    <span>{photographer.city}, {photographer.state}</span>
                  </div>
                  
                  {photographer.email && (
                    <div className="flex items-start">
                      <Mail className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                      <span>{photographer.email}</span>
                    </div>
                  )}
                  
                  {photographer.phone && (
                    <div className="flex items-start">
                      <Phone className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                      <span>{photographer.phone}</span>
                    </div>
                  )}
                  
                  <div className="flex items-start">
                    <DollarSign className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                    <span>₹{photographer.baseRate.toLocaleString('en-IN')} per session</span>
                  </div>
                  
                  <div className="mt-4 flex flex-wrap gap-2">
                    {photographer.categories.map((category: any) => (
                      <Badge key={category.id} variant="outline" className="bg-gray-100">
                        {category.name}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="mt-6">
                  <Button className="w-full" onClick={handleBooking}>
                    Book a Session
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {photographer.bio && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{photographer.bio}</p>
                </CardContent>
              </Card>
            )}
          </div>
          
          {/* Main content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="portfolio">
              <TabsList className="mb-6">
                <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                <TabsTrigger value="availability">Availability</TabsTrigger>
              </TabsList>
              
              <TabsContent value="portfolio">
                <Card>
                  <CardHeader>
                    <CardTitle>Portfolio</CardTitle>
                    <CardDescription>
                      Sample work from previous photoshoots
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {photographer.portfolioPreview?.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4">
                        {photographer.portfolioPreview.map((item: any) => (
                          <div key={item.id} className="relative aspect-square overflow-hidden rounded-md">
                            <img 
                              src={item.imageUrl} 
                              alt={item.title || "Portfolio item"} 
                              className="w-full h-full object-cover transition-transform hover:scale-105"
                            />
                            {item.title && (
                              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                                <h3 className="text-white font-medium">{item.title}</h3>
                                {item.description && (
                                  <p className="text-white/80 text-sm line-clamp-2">{item.description}</p>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Camera className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                        <h3 className="text-lg font-medium text-gray-900">No portfolio items yet</h3>
                        <p className="text-gray-500 mt-1">
                          This photographer hasn't uploaded any portfolio items.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="reviews">
                <Card>
                  <CardHeader>
                    <CardTitle>Client Reviews</CardTitle>
                    <CardDescription>
                      Feedback from previous clients
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {reviews && reviews.length > 0 ? (
                      <div className="space-y-6">
                        {reviews.map((review: any) => (
                          <div key={review.id} className="border-b border-gray-200 pb-6 last:border-0 last:pb-0">
                            <div className="flex items-center mb-3">
                              <Avatar className="h-10 w-10 mr-3">
                                <AvatarImage 
                                  src={review.customer.profileImageUrl} 
                                  alt={`${review.customer.firstName} ${review.customer.lastName}`} 
                                />
                                <AvatarFallback>
                                  {getInitials(review.customer.firstName, review.customer.lastName)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium text-gray-900">
                                  {review.customer.firstName} {review.customer.lastName}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {new Date(review.createdAt).toLocaleDateString()}
                                </div>
                              </div>
                              <div className="ml-auto">
                                <StarRating rating={review.rating} size="sm" />
                              </div>
                            </div>
                            {review.review && (
                              <p className="text-gray-600">{review.review}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Award className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                        <h3 className="text-lg font-medium text-gray-900">No reviews yet</h3>
                        <p className="text-gray-500 mt-1">
                          This photographer hasn't received any reviews yet.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="availability">
                <Card>
                  <CardHeader>
                    <CardTitle>Availability</CardTitle>
                    <CardDescription>
                      Check when this photographer is available for booking
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {availability && availability.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {/* Group availability by date */}
                        {Object.entries(
                          availability.reduce((acc: any, slot: any) => {
                            if (!acc[slot.date]) {
                              acc[slot.date] = [];
                            }
                            
                            if (!slot.isBooked) {
                              acc[slot.date].push(slot);
                            }
                            
                            return acc;
                          }, {})
                        ).map(([date, slots]: [string, any]) => (
                          <div key={date} className="border rounded-md p-4">
                            <div className="flex items-center mb-3">
                              <Calendar className="h-5 w-5 text-primary mr-2" />
                              <h3 className="font-medium text-gray-900">
                                {new Date(date).toLocaleDateString('en-US', {
                                  weekday: 'short',
                                  month: 'short', 
                                  day: 'numeric'
                                })}
                              </h3>
                            </div>
                            <div className="grid grid-cols-1 gap-2">
                              {slots.map((slot: any) => (
                                <div 
                                  key={slot.id} 
                                  className="flex items-center justify-between bg-gray-50 rounded p-2"
                                >
                                  <div className="flex items-center text-sm">
                                    <Clock className="h-4 w-4 text-gray-400 mr-1" />
                                    <span>
                                      {slot.startTime.slice(0, 5)} - {slot.endTime.slice(0, 5)}
                                    </span>
                                  </div>
                                  <Button size="sm" onClick={() => handleBooking()}>
                                    Book
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                        <h3 className="text-lg font-medium text-gray-900">No available slots</h3>
                        <p className="text-gray-500 mt-1">
                          This photographer hasn't set any available time slots.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotographerProfile;

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Booking } from "@/types/booking";
import { apiRequest } from "@/lib/queryClient";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { StarRating } from "@/components/ui/stars";
import { Icons } from "@/components/ui/icons";
import { 
  Calendar, 
  Clock, 
  Download, 
  FileText, 
  Image, 
  MessageSquare, 
  MoreVertical,
  Star,
  CheckCircle
} from "lucide-react";

const CustomerDashboard = () => {
  const [_, setLocation] = useLocation();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { toast } = useToast();
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);
  const [reviewData, setReviewData] = useState<{ rating: number; review: string }>({
    rating: 5,
    review: "",
  });
  const [message, setMessage] = useState("");
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      window.location.href = "/api/login";
    }
  }, [isAuthLoading, isAuthenticated]);

  // Set page title
  useEffect(() => {
    document.title = "Customer Dashboard | Fotofy";
  }, []);

  // Fetch bookings
 const { data: bookings, isLoading: isBookingsLoading, refetch: refetchBookings } = useQuery<Booking[]>({
  queryKey: ["/api/bookings"],
  enabled: !isAuthLoading && isAuthenticated,
});

  // Fetch messages for selected booking
  const { data: messages, isLoading: isMessagesLoading, refetch: refetchMessages } = useQuery({
    queryKey: ["/api/bookings", selectedBookingId, "messages"],
    enabled: !!selectedBookingId,
    queryFn: async () => {
      const response = await fetch(`/api/bookings/${selectedBookingId}/messages`);
      if (!response.ok) throw new Error("Failed to fetch messages");
      return response.json();
    },
  });

  // Fetch deliverables for selected booking
  const { data: deliverables, isLoading: isDeliverablesLoading, refetch: refetchDeliverables } = useQuery({
    queryKey: ["/api/bookings", selectedBookingId, "deliverables"],
    enabled: !!selectedBookingId,
    queryFn: async () => {
      const response = await fetch(`/api/bookings/${selectedBookingId}/deliverables`);
      if (!response.ok) throw new Error("Failed to fetch deliverables");
      return response.json();
    },
  });

  const handleCancelBooking = async (bookingId: number) => {
    try {
      await apiRequest('PATCH', `/api/bookings/${bookingId}/status`, { status: 'cancelled' });
      
      toast({
        title: "Booking Cancelled",
        description: "Your booking has been successfully cancelled.",
      });
      
      refetchBookings();
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast({
        title: "Error",
        description: "Failed to cancel booking. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSubmitReview = async (bookingId: number) => {
    try {
      await apiRequest('POST', '/api/reviews', {
        bookingId,
        photographerId: bookings?.find((b: Booking) => b.id === bookingId)?.photographerId,
        rating: reviewData.rating,
        review: reviewData.review,
      });
      
      toast({
        title: "Review Submitted",
        description: "Thank you for your feedback!",
      });
      
      refetchBookings();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedBookingId) return;
    
    try {
      await apiRequest('POST', '/api/messages', {
        bookingId: selectedBookingId,
        content: message,
      });
      
      setMessage("");
      refetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getBookingStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; label: string }> = {
      pending: { color: "bg-yellow-100 text-yellow-800", label: "Pending" },
      confirmed: { color: "bg-green-100 text-green-800", label: "Confirmed" },
      completed: { color: "bg-blue-100 text-blue-800", label: "Completed" },
      cancelled: { color: "bg-red-100 text-red-800", label: "Cancelled" },
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    
    return (
      <Badge variant="outline" className={`${config.color} border-0`}>
        {config.label}
      </Badge>
    );
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return "U";
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`;
  };

  // Show loading state
  if (isAuthLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <div className="h-10 bg-gray-300 rounded mb-4"></div>
              <div className="space-y-2">
                {Array(5).fill(0).map((_, i) => (
                  <div key={i} className="h-12 bg-gray-300 rounded"></div>
                ))}
              </div>
            </div>
            <div className="lg:col-span-3">
              <div className="h-12 bg-gray-300 rounded mb-6"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array(4).fill(0).map((_, i) => (
                  <div key={i} className="h-40 bg-gray-300 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Customer Dashboard</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>My Bookings</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {isBookingsLoading ? (
                  <div className="p-6">
                    <Icons.spinner className="h-6 w-6 animate-spin mx-auto" />
                  </div>
                ) : bookings!.length > 0 ? (
                  <ScrollArea className="h-[500px]">
                    <div className="divide-y">
                      {bookings?.map((booking: any) => (
                        <div
                          key={booking.id}
                          className={`p-4 cursor-pointer hover:bg-gray-50 ${selectedBookingId === booking.id ? 'bg-gray-50' : ''}`}
                          onClick={() => setSelectedBookingId(booking.id)}
                        >
                          <div className="flex items-center mb-2">
                            <Avatar className="h-8 w-8 mr-2">
                              <AvatarImage 
                                src={booking.photographer.profileImageUrl} 
                                alt={`${booking.photographer.firstName} ${booking.photographer.lastName}`} 
                              />
                              <AvatarFallback>
                                {getInitials(booking.photographer.firstName, booking.photographer.lastName)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium text-sm text-gray-900">
                                {booking.photographer.firstName} {booking.photographer.lastName}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center text-xs text-gray-500 mb-1">
                            <Calendar className="h-3.5 w-3.5 mr-1" />
                            <span>
                              {new Date(booking.bookingDate).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="text-xs text-gray-500">
                              <Clock className="h-3.5 w-3.5 inline mr-1" />
                              <span>
                                {booking.startTime.slice(0, 5)} - {booking.endTime.slice(0, 5)}
                              </span>
                            </div>
                            {getBookingStatusBadge(booking.status)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="p-6 text-center">
                    <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-600">You don't have any bookings yet.</p>
                    <Button 
                      className="mt-4" 
                      onClick={() => setLocation("/photographers")}
                      size="sm"
                    >
                      Find a Photographer
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Main content */}
          <div className="lg:col-span-3">
            {selectedBookingId && bookings ? (
              <Tabs defaultValue="details">
                <TabsList className="mb-6">
                  <TabsTrigger value="details">Booking Details</TabsTrigger>
                  <TabsTrigger value="messages">Messages</TabsTrigger>
                  <TabsTrigger value="deliverables">Deliverables</TabsTrigger>
                  <TabsTrigger value="review">Review</TabsTrigger>
                </TabsList>
                
                <TabsContent value="details">
                  {(() => {
                    const booking = bookings.find((b: any) => b.id === selectedBookingId);
                    if (!booking) return null;
                    
                    return (
                      <Card>
                        <CardHeader className="flex flex-row items-start justify-between">
                          <div>
                            <CardTitle>Booking Details</CardTitle>
                            <CardDescription>
                              {new Date(booking.bookingDate).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </CardDescription>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {booking.status === 'pending' || booking.status === 'confirmed' ? (
                                <DropdownMenuItem onClick={() => handleCancelBooking(booking.id)}>
                                  Cancel Booking
                                </DropdownMenuItem>
                              ) : null}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                              <h3 className="font-semibold text-lg mb-4">Session Information</h3>
                              <div className="space-y-4">
                                <div>
                                  <div className="text-sm font-medium text-gray-500">Status</div>
                                  <div className="mt-1">{getBookingStatusBadge(booking.status)}</div>
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-500">Date & Time</div>
                                  <div className="mt-1 text-gray-900">
                                    {new Date(booking.bookingDate).toLocaleDateString('en-US', {
                                      weekday: 'long',
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric'
                                    })}
                                    <br />
                                    {booking.startTime.slice(0, 5)} - {booking.endTime.slice(0, 5)}
                                  </div>
                                </div>
                                {booking.location && (
                                  <div>
                                    <div className="text-sm font-medium text-gray-500">Location</div>
                                    <div className="mt-1 text-gray-900">{booking.location}</div>
                                  </div>
                                )}
                                <div>
                                  <div className="text-sm font-medium text-gray-500">Amount</div>
                                  <div className="mt-1 text-gray-900 font-semibold">
                                    ₹{booking.totalAmount.toLocaleString('en-IN')}
                                  </div>
                                </div>
                                {booking.notes && (
                                  <div>
                                    <div className="text-sm font-medium text-gray-500">Additional Notes</div>
                                    <div className="mt-1 text-gray-900">{booking.notes}</div>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div>
                              <h3 className="font-semibold text-lg mb-4">Photographer</h3>
                              <div className="flex items-center mb-4">
                                <Avatar className="h-12 w-12 mr-3">
                                  <AvatarImage
                                    src={booking.photographer.profileImageUrl ?? undefined}
                                    alt={`${booking.photographer.firstName} ${booking.photographer.lastName}`}
                                  />
                                  <AvatarFallback>
                                    {getInitials(booking.photographer.firstName, booking.photographer.lastName)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">
                                    {booking.photographer.firstName} {booking.photographer.lastName}
                                  </div>
                                  <Button 
                                    variant="link" 
                                    className="h-auto p-0 text-primary"
                                    onClick={() => setLocation(`/photographers/${booking.photographer.id}`)}
                                  >
                                    View Profile
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })()}
                </TabsContent>
                
                <TabsContent value="messages">
                  <Card>
                    <CardHeader>
                      <CardTitle>Messages</CardTitle>
                      <CardDescription>
                        Communicate with your photographer
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isMessagesLoading ? (
                        <div className="flex justify-center p-6">
                          <Icons.spinner className="h-8 w-8 animate-spin" />
                        </div>
                      ) : (
                        <div className="flex flex-col h-[400px]">
                          <ScrollArea className="flex-grow mb-4 border rounded-md p-4">
                            {messages?.length > 0 ? (
                              <div className="space-y-4">
                                {messages.map((msg: any) => {
                                  const isMe = msg.senderId === user?.id;
                                  return (
                                    <div 
                                      key={msg.id}
                                      className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                    >
                                      <div 
                                        className={`max-w-[70%] px-4 py-2 rounded-lg ${
                                          isMe ? 'bg-primary text-white' : 'bg-gray-100 text-gray-900'
                                        }`}
                                      >
                                        <p className="text-sm">{msg.content}</p>
                                        <div 
                                          className={`text-xs mt-1 ${
                                            isMe ? 'text-primary-100' : 'text-gray-500'
                                          }`}
                                        >
                                          {new Date(msg.sentAt).toLocaleTimeString('en-US', {
                                            hour: '2-digit', 
                                            minute: '2-digit'
                                          })}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <div className="h-full flex flex-col items-center justify-center text-center">
                                <MessageSquare className="h-12 w-12 text-gray-300 mb-2" />
                                <p className="text-gray-500">No messages yet. Start the conversation!</p>
                              </div>
                            )}
                          </ScrollArea>
                          
                          <div className="flex gap-2">
                            <textarea
                              value={message}
                              onChange={(e) => setMessage(e.target.value)}
                              placeholder="Type your message..."
                              className="flex-grow min-h-[80px] p-2 border rounded-md resize-none"
                            />
                            <Button 
                              onClick={handleSendMessage}
                              disabled={!message.trim()}
                              className="self-end"
                            >
                              Send
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="deliverables">
                  <Card>
                    <CardHeader>
                      <CardTitle>Deliverables</CardTitle>
                      <CardDescription>
                        Photos and videos from your session
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isDeliverablesLoading ? (
                        <div className="flex justify-center p-6">
                          <Icons.spinner className="h-8 w-8 animate-spin" />
                        </div>
                      ) : deliverables?.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {deliverables.map((item: any) => (
                            <div key={item.id} className="border rounded-md overflow-hidden">
                              <div className="aspect-video bg-gray-100 flex items-center justify-center">
                                {item.fileUrl.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                                  <img 
                                    src={item.fileUrl} 
                                    alt={item.title}
                                    className="w-full h-full object-cover"
                                  />
                                ) : item.fileUrl.match(/\.(mp4|mov|avi|wmv)$/i) ? (
                                  <div className="w-full h-full flex items-center justify-center bg-gray-800">
                                    <FileText className="h-12 w-12 text-white" />
                                  </div>
                                ) : (
                                  <FileText className="h-12 w-12 text-gray-400" />
                                )}
                              </div>
                              <div className="p-3">
                                <h3 className="font-medium">{item.title}</h3>
                                {item.description && (
                                  <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                                )}
                                <div className="mt-3 flex justify-between items-center">
                                  <div className="text-xs text-gray-500">
                                    {new Date(item.uploadedAt).toLocaleDateString()}
                                  </div>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => window.open(item.fileUrl, '_blank')}
                                  >
                                    <Download className="h-4 w-4 mr-1" /> Download
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <Image className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                          <h3 className="text-lg font-medium text-gray-900">No Deliverables Yet</h3>
                          <p className="text-gray-500 mt-1">
                            Your photographer will upload photos or videos here after your session.
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="review">
                  {(() => {
                    const booking = bookings.find((b: any) => b.id === selectedBookingId);
                    if (!booking) return null;
                    
                    // Check if booking is completed
                    const canReview = booking.status === 'completed';
                    
                    // Check if already reviewed
                    const hasReviewed = false; // This would need to be fetched from the API
                    
                    return (
                      <Card>
                        <CardHeader>
                          <CardTitle>Leave a Review</CardTitle>
                          <CardDescription>
                            Share your experience with this photographer
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          {!canReview ? (
                            <div className="text-center py-8">
                              <Star className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                              <h3 className="text-lg font-medium text-gray-900">Session Not Completed</h3>
                              <p className="text-gray-500 mt-1">
                                You can leave a review after your session is completed.
                              </p>
                            </div>
                          ) : hasReviewed ? (
                            <div className="text-center py-8">
                              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                              <h3 className="text-lg font-medium text-gray-900">Review Submitted</h3>
                              <p className="text-gray-500 mt-1">
                                Thank you for sharing your feedback!
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-6">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Rating
                                </label>
                                <div className="flex items-center">
                                  {[1, 2, 3, 4, 5].map((rating) => (
                                    <button
                                      key={rating}
                                      type="button"
                                      className="text-2xl focus:outline-none"
                                      onClick={() => setReviewData({ ...reviewData, rating })}
                                    >
                                      <Star
                                        className={`h-8 w-8 ${
                                          rating <= reviewData.rating
                                            ? "text-yellow-400 fill-yellow-400"
                                            : "text-gray-300"
                                        }`}
                                      />
                                    </button>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Your Review
                                </label>
                                <textarea
                                  rows={5}
                                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                                  placeholder="Share your experience with this photographer..."
                                  value={reviewData.review}
                                  onChange={(e) => setReviewData({ ...reviewData, review: e.target.value })}
                                ></textarea>
                              </div>
                              <Button onClick={() => handleSubmitReview(booking.id)}>
                                Submit Review
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })()}
                </TabsContent>
              </Tabs>
            ) : (
              <Card className="h-[500px] flex flex-col items-center justify-center text-center">
                <Calendar className="h-16 w-16 text-gray-300 mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">No Booking Selected</h2>
                <p className="text-gray-600 max-w-md mb-6">
                  {(() => {
                    const bookingsLength = bookings?.length ?? 0;
                    return bookingsLength > 0
                      ? "Select a booking from the sidebar to view details."
                      : "You don't have any bookings yet. Start by finding a photographer.";
                  })()}
                </p>
                {!(bookings?.length ?? 0) && (
                  <Button onClick={() => setLocation("/photographers")}>
                    Find a Photographer
                  </Button>
                )}
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;

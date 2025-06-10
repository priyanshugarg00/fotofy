import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Booking } from "@/types/booking";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
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
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Icons } from "@/components/ui/icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { 
  Calendar, 
  Check,
  Clock, 
  DollarSign, 
  Image, 
  MessageSquare, 
  Upload,
  User,
  X,
  FileText
} from "lucide-react";

const PhotographerDashboard = () => {
  const [_, setLocation] = useLocation();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  
  // Form dialogs state
  const [isAvailabilityOpen, setIsAvailabilityOpen] = useState(false);
  const [isPortfolioOpen, setIsPortfolioOpen] = useState(false);
  const [isDeliverableOpen, setIsDeliverableOpen] = useState(false);
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      window.location.href = "/api/login";
      return;
    }
    
    // Redirect to customer dashboard if not a photographer
    if (!isAuthLoading && isAuthenticated && user?.role !== "photographer") {
      setLocation("/dashboard/customer");
    }
  }, [isAuthLoading, isAuthenticated, user, setLocation]);

  // Set page title
  useEffect(() => {
    document.title = "Photographer Dashboard | Fotofy";
  }, []);

  // Fetch photographer profile
  const { data: photographerProfile, isLoading: isProfileLoading } = useQuery({
    queryKey: ["/api/photographers/profile"],
    enabled: !isAuthLoading && isAuthenticated && user?.role === "photographer",
    queryFn: async () => {
      const response = await fetch("/api/photographers/profile");
      if (!response.ok) throw new Error("Failed to fetch profile");
      return response.json();
    },
  });

  // Fetch photographer bookings
  const { data: bookings, isLoading: isBookingsLoading, refetch: refetchBookings } = useQuery<Booking[]>({
    queryKey: ["/api/bookings"],
    enabled: !isAuthLoading && isAuthenticated && user?.role === "photographer",
    queryFn: async () => {
      const response = await fetch("/api/bookings");
      if (!response.ok) throw new Error("Failed to fetch bookings");
      return response.json();
    },
    initialData: [],
  });

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
    enabled: !isAuthLoading && isAuthenticated && user?.role === "photographer",
    initialData: [],
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

  // Mutation to update booking status
  const updateBookingStatus = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return apiRequest("PATCH", `/api/bookings/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      toast({
        title: "Success",
        description: "Booking status updated successfully",
      });
    },
    onError: (error) => {
      console.error("Error updating booking status:", error);
      toast({
        title: "Error",
        description: "Failed to update booking status",
        variant: "destructive",
      });
    },
  });

  // Mutation to send a message
  const sendMessage = useMutation({
    mutationFn: async ({ bookingId, content }: { bookingId: number; content: string }) => {
      return apiRequest("POST", "/api/messages", { bookingId, content });
    },
    onSuccess: () => {
      setMessage("");
      refetchMessages();
      toast({
        title: "Message Sent",
        description: "Your message has been sent successfully",
      });
    },
    onError: (error) => {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    },
  });

  // Handle booking status update
  const handleStatusUpdate = (id: number, status: string) => {
    updateBookingStatus.mutate({ id, status });
  };

  // Handle send message
  const handleSendMessage = () => {
    if (!message.trim() || !selectedBookingId) return;
    sendMessage.mutate({ bookingId: selectedBookingId, content: message });
  };

  // Availability form schema
  const availabilityFormSchema = z.object({
    date: z.string().min(1, "Date is required"),
    startTime: z.string().min(1, "Start time is required"),
    endTime: z.string().min(1, "End time is required"),
  });

  // Portfolio form schema
  const portfolioFormSchema = z.object({
    title: z.string().min(1, "Title is required"),
    imageUrl: z.string().url("Must be a valid URL").min(1, "Image URL is required"),
    description: z.string().optional(),
    categoryId: z.string().min(1, "Category is required"),
  });

  // Deliverable form schema
  const deliverableFormSchema = z.object({
    title: z.string().min(1, "Title is required"),
    fileUrl: z.string().url("Must be a valid URL").min(1, "File URL is required"),
    description: z.string().optional(),
  });

  // Availability form
  const availabilityForm = useForm<z.infer<typeof availabilityFormSchema>>({
    resolver: zodResolver(availabilityFormSchema),
    defaultValues: {
      date: "",
      startTime: "",
      endTime: "",
    },
  });

  // Portfolio form
  const portfolioForm = useForm<z.infer<typeof portfolioFormSchema>>({
    resolver: zodResolver(portfolioFormSchema),
    defaultValues: {
      title: "",
      imageUrl: "",
      description: "",
      categoryId: "",
    },
  });

  // Deliverable form
  const deliverableForm = useForm<z.infer<typeof deliverableFormSchema>>({
    resolver: zodResolver(deliverableFormSchema),
    defaultValues: {
      title: "",
      fileUrl: "",
      description: "",
    },
  });

  // Handle availability form submission
  const onSubmitAvailability = async (data: z.infer<typeof availabilityFormSchema>) => {
    if (!photographerProfile?.id) return;
    
    try {
      await apiRequest("POST", "/api/availability", {
        ...data,
        photographerId: photographerProfile.id,
      });
      
      toast({
        title: "Success",
        description: "Availability slot added successfully",
      });
      
      availabilityForm.reset();
      setIsAvailabilityOpen(false);
    } catch (error) {
      console.error("Error adding availability:", error);
      toast({
        title: "Error",
        description: "Failed to add availability slot",
        variant: "destructive",
      });
    }
  };

  // Handle portfolio form submission
  const onSubmitPortfolio = async (data: z.infer<typeof portfolioFormSchema>) => {
    if (!photographerProfile?.id) return;
    
    try {
      await apiRequest("POST", "/api/portfolio", {
        ...data,
        photographerId: photographerProfile.id,
        categoryId: parseInt(data.categoryId),
      });
      
      toast({
        title: "Success",
        description: "Portfolio item added successfully",
      });
      
      portfolioForm.reset();
      setIsPortfolioOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/photographers/profile"] });
    } catch (error) {
      console.error("Error adding portfolio item:", error);
      toast({
        title: "Error",
        description: "Failed to add portfolio item",
        variant: "destructive",
      });
    }
  };

  // Handle deliverable form submission
  const onSubmitDeliverable = async (data: z.infer<typeof deliverableFormSchema>) => {
    if (!selectedBookingId) return;
    
    try {
      await apiRequest("POST", "/api/deliverables", {
        ...data,
        bookingId: selectedBookingId,
      });
      
      toast({
        title: "Success",
        description: "Deliverable added successfully",
      });
      
      deliverableForm.reset();
      setIsDeliverableOpen(false);
      refetchDeliverables();
    } catch (error) {
      console.error("Error adding deliverable:", error);
      toast({
        title: "Error",
        description: "Failed to add deliverable",
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
  if (isAuthLoading || isProfileLoading) {
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

  // If user is not a photographer, redirect
  if (!isAuthLoading && user?.role !== "photographer") {
    return null;
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Photographer Dashboard</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center mb-4">
                  <Avatar className="h-12 w-12 mr-3">
                    <AvatarImage src={user?.profileImageUrl} alt={user?.firstName} />
                    <AvatarFallback>
                      {getInitials(user?.firstName, user?.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">
                      {user?.firstName} {user?.lastName}
                    </div>
                    <div className="text-sm text-gray-500">{user?.email}</div>
                  </div>
                </div>
                
                {photographerProfile?.isVerified ? (
                  <Badge className="bg-green-100 text-green-800 mb-4">Verified Photographer</Badge>
                ) : (
                  <Badge className="bg-yellow-100 text-yellow-800 mb-4">Verification Pending</Badge>
                )}
                
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setIsAvailabilityOpen(true)}
                  >
                    <Calendar className="h-4 w-4 mr-2" /> Add Availability
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setIsPortfolioOpen(true)}
                  >
                    <Image className="h-4 w-4 mr-2" /> Add Portfolio Item
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>My Bookings</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {isBookingsLoading ? (
                  <div className="p-6">
                    <Icons.spinner className="h-6 w-6 animate-spin mx-auto" />
                  </div>
                ) : bookings?.length > 0 ? (
                  <ScrollArea className="h-[400px]">
                    <div className="divide-y">
                      {bookings.map((booking: any) => (
                        <div 
                          key={booking.id} 
                          className={`p-4 cursor-pointer hover:bg-gray-50 ${selectedBookingId === booking.id ? 'bg-gray-50' : ''}`}
                          onClick={() => setSelectedBookingId(booking.id)}
                        >
                          <div className="flex items-center mb-2">
                            <Avatar className="h-8 w-8 mr-2">
                              <AvatarImage 
                                src={booking.customer.profileImageUrl} 
                                alt={`${booking.customer.firstName} ${booking.customer.lastName}`} 
                              />
                              <AvatarFallback>
                                {getInitials(booking.customer.firstName, booking.customer.lastName)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium text-sm text-gray-900">
                                {booking.customer.firstName} {booking.customer.lastName}
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
                          {booking.status === 'pending' && (
                            <div className="flex space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="border-green-500 text-green-600 hover:bg-green-50"
                                onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
                              >
                                <Check className="h-4 w-4 mr-1" /> Confirm
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="border-red-500 text-red-600 hover:bg-red-50"
                                onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                              >
                                <X className="h-4 w-4 mr-1" /> Decline
                              </Button>
                            </div>
                          )}
                          {booking.status === 'confirmed' && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="border-blue-500 text-blue-600 hover:bg-blue-50"
                              onClick={() => handleStatusUpdate(booking.id, 'completed')}
                            >
                              <Check className="h-4 w-4 mr-1" /> Mark as Completed
                            </Button>
                          )}
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
                              <h3 className="font-semibold text-lg mb-4">Customer Information</h3>
                              <div className="space-y-4">
                                <div className="flex items-center">
                                  <Avatar className="h-12 w-12 mr-3">
                                    <AvatarImage
                                      src={booking.customer.profileImageUrl ?? ""}
                                      alt={`${booking.customer.firstName} ${booking.customer.lastName}`}
                                    />
                                    <AvatarFallback>
                                      {getInitials(booking.customer.firstName, booking.customer.lastName)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="font-medium">
                                      {booking.customer.firstName} {booking.customer.lastName}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {booking.customer.email}
                                    </div>
                                  </div>
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
                        Communicate with your client
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
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle>Deliverables</CardTitle>
                        <CardDescription>
                          Upload photos and videos for your client
                        </CardDescription>
                      </div>
                      <Button 
                        size="sm"
                        onClick={() => {
                          deliverableForm.reset();
                          setIsDeliverableOpen(true);
                        }}
                      >
                        <Upload className="h-4 w-4 mr-2" /> Add Deliverable
                      </Button>
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
                                ) : (
                                  <FileText className="h-12 w-12 text-gray-400" />
                                )}
                              </div>
                              <div className="p-3">
                                <h3 className="font-medium">{item.title}</h3>
                                {item.description && (
                                  <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                                )}
                                <div className="mt-3 text-xs text-gray-500">
                                  Uploaded on {new Date(item.uploadedAt).toLocaleDateString()}
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
                            Upload photos or videos for your client.
                          </p>
                          <Button 
                            className="mt-4"
                            onClick={() => {
                              deliverableForm.reset();
                              setIsDeliverableOpen(true);
                            }}
                          >
                            <Upload className="h-4 w-4 mr-2" /> Add Deliverable
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Dashboard Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    <div className="bg-white p-6 rounded-lg border shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-900">Bookings</h3>
                        <Calendar className="h-5 w-5 text-primary" />
                      </div>
                      <p className="text-3xl font-bold">
                        {bookings?.length || 0}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">Total bookings</p>
                    </div>
                    
                    <div className="bg-white p-6 rounded-lg border shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-900">Earnings</h3>
                        <DollarSign className="h-5 w-5 text-green-500" />
                      </div>
                      <p className="text-3xl font-bold">
                        ₹{bookings?.reduce((sum: number, booking: any) => sum + booking.totalAmount, 0).toLocaleString('en-IN') || 0}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">Total earnings</p>
                    </div>
                    
                    <div className="bg-white p-6 rounded-lg border shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-900">Portfolio</h3>
                        <Image className="h-5 w-5 text-blue-500" />
                      </div>
                      <p className="text-3xl font-bold">
                        {photographerProfile?.portfolioPreview?.length || 0}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">Portfolio items</p>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="text-lg font-medium mb-4">Recent Bookings</h3>
                    {isBookingsLoading ? (
                      <div className="flex justify-center p-6">
                        <Icons.spinner className="h-6 w-6 animate-spin" />
                      </div>
                    ) : bookings?.length > 0 ? (
                      <div className="overflow-hidden border rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Client
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Amount
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {bookings.slice(0, 5).map((booking: any) => (
                              <tr 
                                key={booking.id}
                                className="hover:bg-gray-50 cursor-pointer"
                                onClick={() => setSelectedBookingId(booking.id)}
                              >
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <Avatar className="h-8 w-8 mr-2">
                                      <AvatarImage 
                                        src={booking.customer.profileImageUrl} 
                                        alt={`${booking.customer.firstName} ${booking.customer.lastName}`} 
                                      />
                                      <AvatarFallback>
                                        {getInitials(booking.customer.firstName, booking.customer.lastName)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <div className="text-sm font-medium text-gray-900">
                                        {booking.customer.firstName} {booking.customer.lastName}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">
                                    {new Date(booking.bookingDate).toLocaleDateString()}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {booking.startTime.slice(0, 5)} - {booking.endTime.slice(0, 5)}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  {getBookingStatusBadge(booking.status)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  ₹{booking.totalAmount.toLocaleString('en-IN')}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-12 border rounded-lg">
                        <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-600">You don't have any bookings yet.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
      
      {/* Add Availability Dialog */}
      <Dialog open={isAvailabilityOpen} onOpenChange={setIsAvailabilityOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Availability</DialogTitle>
            <DialogDescription>
              Set your available time slots for bookings
            </DialogDescription>
          </DialogHeader>
          <Form {...availabilityForm}>
            <form onSubmit={availabilityForm.handleSubmit(onSubmitAvailability)} className="space-y-6">
              <FormField
                control={availabilityForm.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={availabilityForm.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={availabilityForm.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter>
                <Button type="submit">Add Availability</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Add Portfolio Item Dialog */}
      <Dialog open={isPortfolioOpen} onOpenChange={setIsPortfolioOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Portfolio Item</DialogTitle>
            <DialogDescription>
              Showcase your work to attract more clients
            </DialogDescription>
          </DialogHeader>
          <Form {...portfolioForm}>
            <form onSubmit={portfolioForm.handleSubmit(onSubmitPortfolio)} className="space-y-6">
              <FormField
                control={portfolioForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Wedding Photoshoot" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={portfolioForm.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/image.jpg" {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter the URL of your portfolio image
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={portfolioForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe your work..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={portfolioForm.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories?.map((category: any) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="submit">Add to Portfolio</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Add Deliverable Dialog */}
      <Dialog open={isDeliverableOpen} onOpenChange={setIsDeliverableOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Deliverable</DialogTitle>
            <DialogDescription>
              Upload photos or videos for your client
            </DialogDescription>
          </DialogHeader>
          <Form {...deliverableForm}>
            <form onSubmit={deliverableForm.handleSubmit(onSubmitDeliverable)} className="space-y-6">
              <FormField
                control={deliverableForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Wedding Album" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={deliverableForm.control}
                name="fileUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>File URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/file.jpg" {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter the URL of your photo or video
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={deliverableForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe the deliverable..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="submit">Add Deliverable</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PhotographerDashboard;

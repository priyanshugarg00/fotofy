import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Icons } from "@/components/ui/icons";
import {
  AlertTriangle,
  BarChart,
  CheckCircle2,
  DollarSign,
  ShieldCheck,
  Users
} from "lucide-react";

























start_line:66






import { User } from "@/types/user";




start_line:79



const AdminDashboard = () => {
  const [_, setLocation] = useLocation();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      window.location.href = "/api/login";
      return;
    }
    
    if (!isAuthLoading && isAuthenticated && user?.role !== "admin") {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access the admin dashboard.",
        variant: "destructive",
      });
      setLocation("/");
    }
  }, [isAuthLoading, isAuthenticated, user, setLocation, toast]);

  // Set page title
  useEffect(() => {
    document.title = "Admin Dashboard | ClickPro";
  }, []);









  // Fetch all users


  const { data: users, isLoading: isUsersLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    enabled: !isAuthLoading && isAuthenticated && user?.role === "admin",
    initialData: [],
  });

  // Fetch all photographers
  const { data: photographers, isLoading: isPhotographersLoading } = useQuery({
    queryKey: ["/api/photographers"],
    enabled: !isAuthLoading && isAuthenticated && user?.role === "admin",
    initialData: [],
  });








  // Fetch all bookings

  const { data: bookings = [], isLoading: isBookingsLoading } = useQuery({
    queryKey: ["/api/bookings"],
    enabled: !isAuthLoading && isAuthenticated && user?.role === "admin",
    initialData: [],
  });

  // Mutation to verify/unverify photographer
  const verifyPhotographerMutation = useMutation({
    mutationFn: async ({ id, isVerified }: { id: number; isVerified: boolean }) => {
      return apiRequest("PATCH", `/api/admin/photographers/${id}/verify`, { isVerified });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/photographers"] });
      toast({
        title: "Success",
        description: "Photographer verification status updated successfully",
      });
    },
    onError: (error) => {
      console.error("Error updating photographer verification:", error);
      toast({
        title: "Error",
        description: "Failed to update photographer verification status",
        variant: "destructive",
      });
    },
  });

  const handleVerificationToggle = (id: number, currentStatus: boolean) => {
    verifyPhotographerMutation.mutate({ id, isVerified: !currentStatus });
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return "U";
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`;
  };

  // Calculate dashboard stats
  const stats = {
    totalUsers: users?.length || 0,
    totalPhotographers: photographers?.filter((p: any) => p.isActive).length || 0,
    pendingVerifications: photographers?.filter((p: any) => !p.isVerified && p.isActive).length || 0,
    totalBookings: bookings?.length || 0,
    totalRevenue: bookings?.reduce((sum: number, booking: any) => sum + booking.totalAmount, 0) || 0,
    completedBookings: bookings?.filter((b: any) => b.status === "completed").length || 0,
  };

  // Show loading state













if (isAuthLoading || (isAuthenticated && user?.role !== "admin")) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="h-32 bg-gray-300 rounded"></div>
            ))}
          </div>
          <div className="h-12 bg-gray-300 rounded mb-4"></div>
          <div className="h-64 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Users</p>
                  <p className="text-3xl font-bold">{stats.totalUsers}</p>
                </div>
                <div className="rounded-full p-3 bg-blue-100">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Pending Verifications</p>
                  <p className="text-3xl font-bold">{stats.pendingVerifications}</p>
                </div>
                <div className="rounded-full p-3 bg-yellow-100">
                  <AlertTriangle className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                  <p className="text-3xl font-bold">₹{stats.totalRevenue.toLocaleString('en-IN')}</p>
                </div>
                <div className="rounded-full p-3 bg-green-100">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Photographers</p>
                  <p className="text-3xl font-bold">{stats.totalPhotographers}</p>
                </div>
                <div className="rounded-full p-3 bg-purple-100">
                  <Icons.camera className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Bookings</p>
                  <p className="text-3xl font-bold">{stats.totalBookings}</p>
                </div>
                <div className="rounded-full p-3 bg-indigo-100">
                  <Icons.calendar className="h-6 w-6 text-indigo-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Completed Bookings</p>
                  <p className="text-3xl font-bold">{stats.completedBookings}</p>
                </div>
                <div className="rounded-full p-3 bg-teal-100">
                  <CheckCircle2 className="h-6 w-6 text-teal-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main Content */}
        <Tabs defaultValue="photographers">
          <TabsList className="mb-6">
            <TabsTrigger value="photographers">Photographers</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="financials">Financials</TabsTrigger>
          </TabsList>
          
          <TabsContent value="photographers">
            <Card>
              <CardHeader>
                <CardTitle>Photographer Management</CardTitle>
                <CardDescription>
                  Approve or reject photographer applications and manage their verification status
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isPhotographersLoading ? (
                  <div className="flex justify-center py-8">
                    <Icons.spinner className="h-8 w-8 animate-spin" />
                  </div>
                ) : photographers?.length > 0 ? (
                  <ScrollArea className="h-[600px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Photographer</TableHead>
                          <TableHead>Categories</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Rating</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {photographers.map((photographer: any) => (
                          <TableRow key={photographer.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar>
                                  <AvatarImage src={photographer.profileImageUrl} />
                                  <AvatarFallback>
                                    {getInitials(photographer.firstName, photographer.lastName)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">
                                    {photographer.firstName} {photographer.lastName}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    ID: {photographer.id}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1 max-w-[200px]">
                                {photographer.categories?.map((category: any) => (
                                  <Badge 
                                    key={category.id} 
                                    variant="outline" 
                                    className="text-xs bg-gray-100"
                                  >
                                    {category.name}
                                  </Badge>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell>
                              {photographer.city}, {photographer.state}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Icons.star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                                <span>{photographer.rating?.average.toFixed(1)}</span>
                                <span className="text-gray-500 text-xs ml-1">
                                  ({photographer.rating?.count})
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {photographer.isVerified ? (
                                <Badge className="bg-green-100 text-green-800 border-0">
                                  <ShieldCheck className="h-3 w-3 mr-1" /> Verified
                                </Badge>
                              ) : (
                                <Badge className="bg-yellow-100 text-yellow-800 border-0">
                                  <AlertTriangle className="h-3 w-3 mr-1" /> Pending
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button 
                                  variant={photographer.isVerified ? "outline" : "default"}
                                  size="sm"
                                  onClick={() => handleVerificationToggle(photographer.id, photographer.isVerified)}
                                >
                                  {photographer.isVerified ? "Unverify" : "Verify"}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setLocation(`/photographers/${photographer.id}`)}
                                >
                                  View
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                ) : (
                  <div className="text-center py-12">
                    <Icons.camera className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600">No photographers found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  View and manage all registered users on the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isUsersLoading ? (
                  <div className="flex justify-center py-8">
                    <Icons.spinner className="h-8 w-8 animate-spin" />
                  </div>
                ) : users?.length > 0 ? (
                  <ScrollArea className="h-[600px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Joined</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users!.map((user: any) => (
                          <TableRow key={user.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar>
                                  <AvatarImage src={user.profileImageUrl} />
                                  <AvatarFallback>
                                    {getInitials(user.firstName, user.lastName)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">
                                    {user.firstName} {user.lastName}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    ID: {user.id}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              <Badge 
                                variant="outline" 
                                className={`${
                                  user.role === 'admin' 
                                    ? 'bg-purple-100 text-purple-800' 
                                    : user.role === 'photographer'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-gray-100 text-gray-800'
                                } border-0`}
                              >
                                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {new Date(user.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                              >
                                View Details
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                ) : (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600">No users found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="bookings">
            <Card>
              <CardHeader>
                <CardTitle>Booking Management</CardTitle>
                <CardDescription>
                  View and manage all bookings across the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isBookingsLoading ? (
                  <div className="flex justify-center py-8">
                    <Icons.spinner className="h-8 w-8 animate-spin" />
                  </div>
                ) : bookings?.length > 0 ? (
                  <ScrollArea className="h-[600px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Booking ID</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Photographer</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {bookings.map((booking: any) => (
                          <TableRow key={booking.id}>
                            <TableCell>#{booking.id}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={booking.customer.profileImageUrl} />
                                  <AvatarFallback>
                                    {getInitials(booking.customer.firstName, booking.customer.lastName)}
                                  </AvatarFallback>
                                </Avatar>
                                <span>
                                  {booking.customer.firstName} {booking.customer.lastName}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={booking.photographer.profileImageUrl} />
                                  <AvatarFallback>
                                    {getInitials(booking.photographer.firstName, booking.photographer.lastName)}
                                  </AvatarFallback>
                                </Avatar>
                                <span>
                                  {booking.photographer.firstName} {booking.photographer.lastName}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {new Date(booking.bookingDate).toLocaleDateString()}
                              <div className="text-xs text-gray-500">
                                {booking.startTime.slice(0, 5)} - {booking.endTime.slice(0, 5)}
                              </div>
                            </TableCell>
                            <TableCell>
                              ₹{booking.totalAmount.toLocaleString('en-IN')}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={`${
                                  booking.status === 'completed'
                                    ? 'bg-green-100 text-green-800'
                                    : booking.status === 'confirmed'
                                    ? 'bg-blue-100 text-blue-800'
                                    : booking.status === 'cancelled'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                } border-0`}
                              >
                                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm">
                                View Details
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                ) : (
                  <div className="text-center py-12">
                    <Icons.calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600">No bookings found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="financials">
            <Card>
              <CardHeader>
                <CardTitle>Financial Dashboard</CardTitle>
                <CardDescription>
                  Revenue, commissions, and payout management
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex flex-col gap-1">
                        <p className="text-sm font-medium text-gray-500">Gross Volume</p>
                        <p className="text-3xl font-bold">₹{stats.totalRevenue.toLocaleString('en-IN')}</p>
                        <p className="text-sm text-gray-500">Total bookings: {stats.totalBookings}</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex flex-col gap-1">
                        <p className="text-sm font-medium text-gray-500">Platform Commission</p>
                        <p className="text-3xl font-bold">₹{(stats.totalRevenue * 0.15).toLocaleString('en-IN')}</p>
                        <p className="text-sm text-gray-500">15% of gross volume</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex flex-col gap-1">
                        <p className="text-sm font-medium text-gray-500">Photographer Payouts</p>
                        <p className="text-3xl font-bold">₹{(stats.totalRevenue * 0.85).toLocaleString('en-IN')}</p>
                        <p className="text-sm text-gray-500">85% of gross volume</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="rounded-lg border p-6 flex items-center justify-center">
                  <div className="text-center">
                    <BarChart className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">Revenue Charts</h3>
                    <p className="text-gray-500 mb-4">Detailed financial analytics would be displayed here</p>
                    <Button disabled>Generate Reports</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;

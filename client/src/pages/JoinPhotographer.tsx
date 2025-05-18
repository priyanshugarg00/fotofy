import React, { useState } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";

const photographerFormSchema = z.object({
  bio: z.string().min(20, { message: "Bio must be at least 20 characters." }),
  experience: z.string().min(1, { message: "Please select your experience level." }),
  city: z.string().min(2, { message: "City must be at least 2 characters." }),
  state: z.string().min(2, { message: "State must be at least 2 characters." }),
  baseRate: z.coerce.number().min(500, { message: "Base rate must be at least ₹500." }),
  phone: z.string().min(10, { message: "Please enter a valid phone number." }),
  categories: z.array(z.string()).min(1, { message: "Please select at least one category." }),
  equipmentDetails: z.string().min(10, { message: "Please provide details about your equipment." }),
});

type PhotographerFormValues = z.infer<typeof photographerFormSchema>;

export default function JoinPhotographer() {
  const { toast } = useToast();
  const [_, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const experienceLevels = [
    { label: "0-1 years", value: "beginner" },
    { label: "1-3 years", value: "intermediate" },
    { label: "3-5 years", value: "experienced" },
    { label: "5+ years", value: "expert" },
  ];

  const categoryOptions = [
    { id: 1, name: "Wedding" },
    { id: 2, name: "Portrait" },
    { id: 3, name: "Fashion" },
    { id: 4, name: "Event" },
    { id: 5, name: "Family" },
    { id: 6, name: "Product" },
    { id: 7, name: "Real Estate" },
    { id: 8, name: "Landscape" },
    { id: 9, name: "Travel" },
    { id: 10, name: "Food" },
  ];

  const form = useForm<PhotographerFormValues>({
    resolver: zodResolver(photographerFormSchema),
    defaultValues: {
      bio: "",
      experience: "",
      city: "",
      state: "",
      baseRate: 1000,
      phone: "",
      categories: [],
      equipmentDetails: "",
    },
  });

  const handleCategoryChange = (category: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(category)) {
        return prev.filter((c) => c !== category);
      } else {
        return [...prev, category];
      }
    });
    
    form.setValue("categories", 
      selectedCategories.includes(category) 
        ? selectedCategories.filter(c => c !== category) 
        : [...selectedCategories, category],
      { shouldValidate: true }
    );
  };

  async function onSubmit(data: PhotographerFormValues) {
    if (!isAuthenticated) {
      toast({
        title: "Not logged in",
        description: "You need to be logged in to register as a photographer",
        variant: "destructive",
      });
      setLocation("/api/login");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const categoryIds = data.categories.map(catName => {
        const category = categoryOptions.find(c => c.name === catName);
        return category ? category.id : null;
      }).filter(id => id !== null);
      
      const photographerData = {
        ...data,
        categoryIds,
      };
      
      const response = await apiRequest("POST", "/api/photographers", photographerData);
      
      if (response.ok) {
        toast({
          title: "Registration successful",
          description: "Your photographer profile has been created successfully!",
        });
        setLocation("/dashboard/photographer");
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create photographer profile");
      }
    } catch (error) {
      console.error("Error creating photographer profile:", error);
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto py-12 px-4 max-w-3xl text-center">
        <h1 className="text-3xl font-bold mb-6">Join as a Photographer</h1>
        <p className="mb-6">You need to be logged in to register as a photographer.</p>
        <Button asChild>
          <a href="/api/login">Log In to Continue</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4 max-w-3xl">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-4">Join as a Photographer</h1>
        <p className="text-gray-600 max-w-xl mx-auto">
          Share your photography skills with clients across the country. Fill out the form below to create your photographer profile.
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Basic Information</h2>
              
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Professional Bio</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell potential clients about yourself, your photography style, and experience..."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      This will be displayed on your profile to help clients know you better.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="Your city" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input placeholder="Your state" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Your contact number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="baseRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Base Rate (₹ per hour)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormDescription>
                        Your starting hourly rate for bookings
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <div className="space-y-6 pt-6 border-t">
              <h2 className="text-xl font-semibold">Professional Details</h2>
              
              <FormField
                control={form.control}
                name="experience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Experience Level</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your experience level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {experienceLevels.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="categories"
                render={() => (
                  <FormItem>
                    <FormLabel>Photography Categories</FormLabel>
                    <FormDescription>
                      Select all categories that you specialize in
                    </FormDescription>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-1">
                      {categoryOptions.map((category) => (
                        <div 
                          key={category.id} 
                          className={`
                            flex items-center border rounded-md px-3 py-2 cursor-pointer
                            ${selectedCategories.includes(category.name) 
                              ? 'bg-primary/10 border-primary' 
                              : 'border-gray-200 hover:border-gray-300'
                            }
                          `}
                          onClick={() => handleCategoryChange(category.name)}
                        >
                          <div className={`w-4 h-4 mr-2 rounded-sm border flex items-center justify-center ${
                            selectedCategories.includes(category.name) ? 'bg-primary border-primary' : 'border-gray-400'
                          }`}>
                            {selectedCategories.includes(category.name) && (
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-3 h-3 text-white">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          {category.name}
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="equipmentDetails"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Equipment Details</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your camera, lenses, lighting equipment, etc."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Let clients know what professional equipment you use for your shoots.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="space-y-4 pt-6 border-t">
              <h2 className="text-xl font-semibold">Agreement</h2>
              <p className="text-sm text-gray-600">
                By submitting this form, you agree to ClickPro's terms of service and photographer guidelines. 
                You understand that your profile will need to be reviewed and approved before it becomes visible to clients.
              </p>
              
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Application"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import PhotographerCard from "@/components/PhotographerCard";

const Photographers = () => {
  const [location, ] = useLocation();
  const searchParams = new URLSearchParams(location.includes('?') ? location.split('?')[1] : '');
  
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    city: searchParams.get('city') || '',
    date: searchParams.get('date') || '',
    minPrice: searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice') || '0') : 0,
    maxPrice: searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice') || '50000') : 50000,
  });
  
  const [priceRange, setPriceRange] = useState<number[]>([filters.minPrice, filters.maxPrice]);
  
  // Set page title and description
  useEffect(() => {
    document.title = "Browse Photographers | Fotofy";
    
    // Update meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', 'Search and filter professional photographers by category, location, date, and price. Find the perfect photographer for your needs.');
  }, []);

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
    initialData: [],
  });

  // Fetch photographers with filters
  const { data: photographers, isLoading } = useQuery({
    queryKey: ["/api/photographers", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.category) params.append("category", filters.category);
      if (filters.city) params.append("city", filters.city);
      if (filters.date) params.append("date", filters.date);
      params.append("minPrice", filters.minPrice.toString());
      params.append("maxPrice", filters.maxPrice.toString());
      
      const response = await fetch(`/api/photographers?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch photographers");
      return response.json();
    },
  });

  const handleFilterChange = (name: string, value: any) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handlePriceChange = (value: number[]) => {
    setPriceRange(value);
    setFilters(prev => ({
      ...prev,
      minPrice: value[0],
      maxPrice: value[1]
    }));
  };

  const cities = [
    "Mumbai",
    "Delhi",
    "Bangalore",
    "Chennai",
    "Hyderabad",
    "Kolkata",
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Hero section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">Find Your Perfect Photographer</h1>
          <p className="mt-2 text-lg text-gray-600">Browse and filter professional photographers for your next shoot</p>
        </div>
        
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <h2 className="font-semibold text-lg mb-4">Filters</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <Select 
                    value={filters.category} 
                    onValueChange={(value) => handleFilterChange("category", value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories && categories.map((category: any) => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <Select 
                    value={filters.city} 
                    onValueChange={(value) => handleFilterChange("city", value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="All Cities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Cities</SelectItem>
                      {cities.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <Calendar
                    mode="single"
                    selected={filters.date ? new Date(filters.date) : undefined}
                    onSelect={(date) => {
                      if (date) {
                        handleFilterChange("date", date.toISOString().split('T')[0]);
                      }
                    }}
                    className="rounded-md border w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price Range (₹)</label>
                  <div className="pt-6 px-2">
                    <Slider
                      defaultValue={[filters.minPrice, filters.maxPrice]}
                      max={50000}
                      step={1000}
                      value={priceRange}
                      onValueChange={handlePriceChange}
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
                    <span>₹{priceRange[0].toLocaleString()}</span>
                    <span>₹{priceRange[1].toLocaleString()}</span>
                  </div>
                </div>
                
                <Button 
                  onClick={() => {
                    setFilters({
                      category: '',
                      city: '',
                      date: '',
                      minPrice: 0,
                      maxPrice: 50000
                    });
                    setPriceRange([0, 50000]);
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Reset Filters
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Photographers grid */}
          <div className="md:col-span-3">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {Array(4).fill(0).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="h-48 bg-gray-300"></div>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-gray-300 rounded-full mr-4"></div>
                        <div>
                          <div className="h-4 bg-gray-300 rounded w-32 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-24"></div>
                        </div>
                      </div>
                      <div className="mt-4">
                        <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                        <div className="flex flex-wrap gap-2 mb-4">
                          <div className="h-5 bg-gray-200 rounded w-16"></div>
                          <div className="h-5 bg-gray-200 rounded w-20"></div>
                          <div className="h-5 bg-gray-200 rounded w-14"></div>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="h-6 bg-gray-300 rounded w-24"></div>
                          <div className="h-8 bg-gray-300 rounded w-24"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : photographers?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {photographers.map((photographer: any) => (
                  <PhotographerCard key={photographer.id} photographer={photographer} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No photographers found</h3>
                <p className="text-gray-600 mb-4">
                  We couldn't find any photographers matching your filters.
                </p>
                <Button 
                  onClick={() => {
                    setFilters({
                      category: '',
                      city: '',
                      date: '',
                      minPrice: 0,
                      maxPrice: 50000
                    });
                    setPriceRange([0, 50000]);
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Photographers;

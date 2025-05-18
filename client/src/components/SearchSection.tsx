import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const SearchSection = () => {
  const [_, setLocation] = useLocation();
  const [searchParams, setSearchParams] = useState({
    category: "",
    city: "",
    date: "",
    priceRange: "",
  });
  
  // Set default date to tomorrow
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const formattedDate = tomorrow.toISOString().split('T')[0];
    setSearchParams(prev => ({ ...prev, date: formattedDate }));
  }, []);

  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
  });

  const cities = [
    "Mumbai",
    "Delhi",
    "Bangalore",
    "Chennai",
    "Hyderabad",
    "Kolkata",
  ];

  const priceRanges = [
    { label: "Any price", value: "" },
    { label: "₹1,000 - ₹5,000", value: "1000-5000" },
    { label: "₹5,000 - ₹10,000", value: "5000-10000" },
    { label: "₹10,000 - ₹25,000", value: "10000-25000" },
    { label: "₹25,000 - ₹50,000", value: "25000-50000" },
    { label: "₹50,000+", value: "50000+" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Build query params
    const params = new URLSearchParams();
    if (searchParams.category) params.append("category", searchParams.category);
    if (searchParams.city) params.append("city", searchParams.city);
    if (searchParams.date) params.append("date", searchParams.date);
    if (searchParams.priceRange) {
      const [min, max] = searchParams.priceRange.split('-');
      if (min) params.append("minPrice", min);
      if (max) params.append("maxPrice", max);
    }
    
    // Navigate to photographers page with filters
    setLocation(`/photographers?${params.toString()}`);
  };

  const handleChange = (name: string, value: string) => {
    setSearchParams(prev => ({ ...prev, [name]: value }));
  };

  return (
    <section className="relative -mt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <Card className="shadow-xl overflow-hidden">
        <CardContent className="px-6 py-8 md:p-10">
          <h2 className="text-2xl font-bold text-secondary-800 mb-6">Find Your Perfect Shoot</h2>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              <div>
                <label htmlFor="shoot-type" className="block text-sm font-medium text-gray-700 mb-1">Shoot Type</label>
                <Select 
                  value={searchParams.category} 
                  onValueChange={(value) => handleChange("category", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {categories?.map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <Select 
                  value={searchParams.city} 
                  onValueChange={(value) => handleChange("city", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select City" />
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
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input 
                  type="date" 
                  name="date" 
                  id="date" 
                  value={searchParams.date}
                  onChange={(e) => handleChange("date", e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
              
              <div>
                <label htmlFor="price-range" className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
                <Select 
                  value={searchParams.priceRange} 
                  onValueChange={(value) => handleChange("priceRange", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any price" />
                  </SelectTrigger>
                  <SelectContent>
                    {priceRanges.map((range) => (
                      <SelectItem key={range.value} value={range.value}>
                        {range.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button type="submit" size="lg">
                Search Photographers
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </section>
  );
};

export default SearchSection;

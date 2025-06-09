import { useQuery } from "@tanstack/react-query";
import PhotographerCard from "@/components/PhotographerCard";
import type { Photographer } from "@/components/PhotographerCard";
import PhotoCategories from "@/components/PhotoCategories";
import type { Category } from "@/components/PhotoCategories";
import { useEffect } from "react";
import { Link } from "wouter";
import HeroSection from "@/components/HeroSection";
import SearchSection from "@/components/SearchSection";
import HowItWorks from "@/components/HowItWorks";
import Testimonials from "@/components/Testimonials";
import PhotographerCTA from "@/components/PhotographerCTA";

const Home = () => {
  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: featuredPhotographers, isLoading: isLoadingPhotographers } = useQuery({
    queryKey: ["/api/photographers"],
    queryFn: async () => {
      const response = await fetch("/api/photographers?featured=true");
      if (!response.ok) throw new Error("Failed to fetch photographers");
      return response.json();
    },
  });

  // Set page title and meta description
  useEffect(() => {
    document.title = "ClickPro - Professional Photography Services On Demand";
    
    // Update meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', 'Book top photographers for your special moments - weddings, family portraits, fashion shoots, and more. Professional photography on demand.');
  }, []);

  return (
    <div>
      <HeroSection />
      
      <SearchSection />
      
      <PhotoCategories categories={categories || []} />
      
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-secondary-800 sm:text-4xl">Featured Photographers</h2>
            <p className="mt-3 max-w-2xl mx-auto text-lg text-secondary-500">Work with the best professionals in your area</p>
          </div>
          
          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {isLoadingPhotographers ? (
              // Loading skeleton
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="animate-pulse bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="relative h-48 bg-gray-300"></div>
                  <div className="p-6">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gray-300 mr-4"></div>
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
                  </div>
                </div>
              ))
            ) : (
              featuredPhotographers?.slice(0, 3).map((photographer: Photographer) => (
                <PhotographerCard key={photographer.id} photographer={photographer} />
              ))
            )}
          </div>
          
          <div className="mt-12 text-center">
            <Link href="/photographers">
              <a className="inline-flex items-center px-6 py-3 border border-primary text-base font-medium rounded-md text-primary bg-white hover:bg-primary-50">
                Browse All Photographers
                <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 -mr-1 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </a>
            </Link>
          </div>
        </div>
      </section>
      
      <HowItWorks />
      
      <Testimonials />
      
      <PhotographerCTA />
    </div>
  );
};

export default Home;

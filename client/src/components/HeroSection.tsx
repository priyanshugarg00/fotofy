import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const HeroSection = () => {
  const { isAuthenticated, user } = useAuth();

  const getActionLink = () => {
    if (!isAuthenticated) {
      return "/api/login";
    }
    
    if (user?.role === "photographer") {
      return "/dashboard/photographer";
    }
    
    return "/photographers";
  };

  return (
    <div className="relative bg-gray-50">
      {/* Hero background image with gradient overlay */}
      <div className="absolute inset-0 overflow-hidden">
        <img 
          className="w-full h-full object-cover" 
          src="https://images.unsplash.com/photo-1603574670812-d24560880210?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&h=800&q=80" 
          alt="Professional photography session" 
        />
        <div className="absolute inset-0 bg-gradient-to-r from-secondary-900/80 to-secondary-900/40"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
        <div className="max-w-xl">
          <h1 className="text-4xl font-extrabold tracking-tight text-white md:text-5xl">Professional Photos, On Demand</h1>
          <p className="mt-5 text-xl text-gray-100">Book top photographers for your special moments - weddings, family portraits, fashion shoots, and more.</p>
          <div className="mt-8 flex">
            <div className="inline-flex rounded-md shadow">
              <Button asChild variant="secondary">
                <Link href="/photographers">
                  Find a Photographer
                </Link>
              </Button>
            </div>
            <div className="ml-3 inline-flex">
              <Button asChild>
                <Link href={getActionLink()}>
                  {user?.role === "photographer" ? "Photographer Dashboard" : "Join as Photographer"}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;

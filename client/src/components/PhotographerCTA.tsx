import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";

const PhotographerCTA = () => {
  const { user, isAuthenticated } = useAuth();
  
  const isPhotographer = isAuthenticated && user?.role === "photographer";
  
  return (
    <section className="bg-gradient-to-r from-primary-600 to-primary-800 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:flex lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              {isPhotographer 
                ? "Manage Your Photography Business"
                : "Are you a photographer?"}
            </h2>
            <p className="mt-3 text-lg text-primary-100">
              {isPhotographer
                ? "Access your dashboard to manage bookings, update your portfolio, and grow your business."
                : "Join our platform to showcase your work, grow your business, and connect with clients looking for your expertise."}
            </p>
            <div className="mt-8 flex space-x-4">
              {isPhotographer ? (
                <Button 
                  asChild
                  variant="secondary"
                >
                  <Link href="/dashboard/photographer">
                    Go to Dashboard
                  </Link>
                </Button>
              ) : (
                <>
                  <Button 
                    asChild
                    variant="secondary"
                  >
                    <Link href={isAuthenticated ? "/dashboard/customer" : "/api/login"}>
                      Join as Photographer
                    </Link>
                  </Button>
                  <Button 
                    asChild
                    variant="outline"
                    className="text-white border-white hover:bg-primary-700"
                  >
                    <Link href="/photographers">
                      Learn More
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
          <div className="mt-10 lg:mt-0 lg:ml-8 lg:flex-shrink-0">
            <div className="relative overflow-hidden rounded-lg shadow-xl">
              <img 
                className="h-64 w-auto object-cover" 
                src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80" 
                alt="Photographer at work" 
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PhotographerCTA;

import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/ui/stars";
import { MapPin } from "lucide-react";

interface Category {
  id: number;
  name: string;
}

interface Photographer {
  id: number;
  firstName: string;
  lastName: string;
  profileImageUrl: string;
  city: string;
  state: string;
  baseRate: number;
  categories: Category[];
  portfolioSample?: string;
  isVerified: boolean;
  rating: {
    average: number;
    count: number;
  };
}

interface PhotographerCardProps {
  photographer: Photographer;
}

const PhotographerCard = ({ photographer }: PhotographerCardProps) => {
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`;
  };

  return (
    <Card className="overflow-hidden transition transform hover:scale-[1.02] hover:shadow-lg">
      <div className="relative pb-2/3 h-48">
        <img 
          className="absolute h-full w-full object-cover" 
          src={photographer.portfolioSample || "https://images.unsplash.com/photo-1537633552985-df8429e8048b?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=300&q=80"} 
          alt={`${photographer.firstName} ${photographer.lastName}'s portfolio sample`} 
        />
      </div>
      <CardContent className="p-6">
        <div className="flex items-center">
          <Avatar className="h-10 w-10 mr-4">
            <AvatarImage src={photographer.profileImageUrl} alt={`${photographer.firstName} ${photographer.lastName}`} />
            <AvatarFallback>
              {getInitials(photographer.firstName, photographer.lastName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-lg font-semibold text-secondary-800">
              {photographer.firstName} {photographer.lastName}
              {photographer.isVerified && (
                <span className="ml-1 inline-flex items-center text-primary-600" title="Verified Photographer">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </span>
              )}
            </h3>
            <div className="flex items-center mt-1">
              <StarRating rating={photographer.rating.average} />
              <span className="ml-2 text-sm text-gray-500">
                {photographer.rating.average.toFixed(1)} ({photographer.rating.count} reviews)
              </span>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-center text-sm text-gray-500 mb-2">
            <MapPin className="h-5 w-5 mr-1 text-gray-400" />
            {photographer.city}, {photographer.state}
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {photographer.categories?.map((category) => (
              <Badge key={category.id} variant="secondary" className="bg-primary-100 text-primary-800 hover:bg-primary-200">
                {category.name}
              </Badge>
            ))}
          </div>
          <div className="flex justify-between items-center">
            <div className="text-lg font-bold text-secondary-800">
              ₹{photographer.baseRate.toLocaleString('en-IN')}
              <span className="text-sm font-normal text-gray-500">/session</span>
            </div>
            <Button asChild size="sm">
              <Link href={`/photographers/${photographer.id}`}>
                View Profile
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
export { Photographer };
export default PhotographerCard;

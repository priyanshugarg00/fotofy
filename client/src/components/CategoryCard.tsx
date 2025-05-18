import { Link } from "wouter";

interface Category {
  id: number;
  name: string;
  description?: string;
  imageUrl?: string;
}

interface CategoryCardProps {
  category: Category;
}

const CategoryCard = ({ category }: CategoryCardProps) => {
  const defaultImages: Record<string, string> = {
    "Wedding": "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=600&q=80",
    "Fashion": "https://images.unsplash.com/photo-1555529771-7888783a18d3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=600&q=80",
    "Baby & Family": "https://pixabay.com/get/gfada59a771dcef7c42a25231227ad9b2be584a11fdc465b48be6f216acc80cd632830038931585cae1defd563bfcf21b1685d849fae2fe7f8431937d88583de7_1280.jpg",
    "Pre-Wedding": "https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=600&q=80",
    "Cinematic": "https://images.unsplash.com/photo-1585951237318-9ea5e175b891?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=600&q=80",
    "Portrait": "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=600&q=80",
    "Event": "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=600&q=80",
    "Maternity": "https://images.unsplash.com/photo-1595924737006-3cdf0f37e0a1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=600&q=80",
  };

  const defaultDescriptions: Record<string, string> = {
    "Wedding": "Capture every magical moment",
    "Fashion": "Professional studio sessions",
    "Baby & Family": "Preserve precious memories",
    "Pre-Wedding": "Romance before the big day",
    "Cinematic": "Professional video production",
    "Portrait": "Professional headshots & profiles",
    "Event": "Document special gatherings",
    "Maternity": "Celebrate new beginnings",
  };

  const imageUrl = category.imageUrl || 
    defaultImages[category.name] || 
    "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=600&q=80";
  
  const description = category.description || 
    defaultDescriptions[category.name] || 
    "Professional photography services";

  return (
    <div className="relative group">
      <div className="relative overflow-hidden rounded-lg h-80">
        <img 
          className="w-full h-full object-cover transform transition duration-300 group-hover:scale-105" 
          src={imageUrl} 
          alt={`${category.name} photography`} 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-secondary-900/70"></div>
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h3 className="text-xl font-bold text-white">{category.name}</h3>
          <p className="mt-1 text-gray-200">{description}</p>
        </div>
      </div>
      <Link href={`/photographers?category=${encodeURIComponent(category.name)}`}>
        <a className="absolute inset-0 focus:outline-none">
          <span className="sr-only">View {category.name} category</span>
        </a>
      </Link>
    </div>
  );
};

export default CategoryCard;

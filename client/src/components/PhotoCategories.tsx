import { Link } from "wouter";

interface Category {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
}

interface PhotoCategoriesProps {
  categories: Category[];
}

const CategoryCard = ({ category }: { category: any }) => {
  const defaultImages = {
    "Wedding": "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=600&q=80",
    "Fashion": "https://images.unsplash.com/photo-1555529771-7888783a18d3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=600&q=80",
    "Baby & Family": "https://images.unsplash.com/photo-1657912230172-23f8b31665ed?w=600&auto=format&fit=crop&q=60",
    "Pre-Wedding": "https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=600&q=80",
    "Cinematic": "https://images.unsplash.com/photo-1585951237318-9ea5e175b891?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=600&q=80",
    "Portrait": "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=600&q=80",
    "Event": "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=600&q=80",
    "Maternity": "https://images.unsplash.com/photo-1595924737006-3cdf0f37e0a1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=600&q=80",
  };

  const getDescription = (categoryName: string) => {
    const descriptions = {
      "Wedding": "Capture every magical moment",
      "Fashion": "Professional studio sessions",
      "Baby & Family": "Preserve precious memories",
      "Pre-Wedding": "Romance before the big day",
      "Cinematic": "Professional video production",
      "Portrait": "Professional headshots & profiles",
      "Event": "Document special gatherings",
      "Maternity": "Celebrate new beginnings",
    };
    
    return descriptions[categoryName as keyof typeof descriptions] || "Professional photography services";
  };

  const imageUrl = category.imageUrl || defaultImages[category.name as keyof typeof defaultImages] || "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=600&q=80";
  const description = category.description || getDescription(category.name);

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

const PhotoCategories = ({ categories }: PhotoCategoriesProps) => {
  // If no categories are provided, use default ones
  const defaultCategories = [
    { id: 1, name: "Wedding", description: "", imageUrl: "" },
    { id: 2, name: "Fashion", description: "", imageUrl: "" },
    { id: 3, name: "Baby & Family", description: "", imageUrl: "" },
    { id: 4, name: "Pre-Wedding", description: "", imageUrl: "" },
    { id: 5, name: "Cinematic", description: "", imageUrl: "" },
    { id: 6, name: "Portrait", description: "", imageUrl: "" },
    { id: 7, name: "Event", description: "", imageUrl: "" },
    { id: 8, name: "Maternity", description: "", imageUrl: "" },
  ];

  const displayCategories = categories.length > 0 ? categories : defaultCategories;

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-secondary-800 sm:text-4xl">Explore Shoot Categories</h2>
          <p className="mt-3 max-w-2xl mx-auto text-lg text-secondary-500">Find the perfect photographer for any occasion</p>
        </div>
        
        <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {displayCategories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </div>
    </section>
  );
};

export { Category };
export default PhotoCategories;

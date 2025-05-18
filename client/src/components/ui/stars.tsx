import { Star, StarHalf } from "lucide-react";

interface StarRatingProps {
  rating: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function StarRating({ rating, max = 5, size = "md", className = "" }: StarRatingProps) {
  if (rating > max) rating = max;
  
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = max - fullStars - (hasHalfStar ? 1 : 0);
  
  const starSizeClass = {
    sm: "h-3.5 w-3.5",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  }[size];
  
  return (
    <div className={`flex text-yellow-400 ${className}`}>
      {[...Array(fullStars)].map((_, i) => (
        <Star key={`full-${i}`} className={starSizeClass} fill="currentColor" />
      ))}
      {hasHalfStar && <StarHalf className={starSizeClass} fill="currentColor" />}
      {[...Array(emptyStars)].map((_, i) => (
        <Star key={`empty-${i}`} className={`${starSizeClass} text-gray-300`} />
      ))}
    </div>
  );
}

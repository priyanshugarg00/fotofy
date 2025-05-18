import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StarRating } from "@/components/ui/stars";

const testimonials = [
  {
    id: 1,
    name: "Neha & Vikram",
    location: "Wedding, Mumbai",
    rating: 5,
    testimonial: "We booked Rajiv for our wedding and pre-wedding shoot. The booking process was so seamless, and the photos turned out absolutely beautiful. Worth every rupee!",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80"
  },
  {
    id: 2,
    name: "Rahul Mehra",
    location: "Fashion Portfolio, Delhi",
    rating: 5,
    testimonial: "As someone starting out in modeling, I needed professional photographs for my portfolio. Priya was amazing! The shoot was comfortable and the results exceeded my expectations.",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80"
  },
  {
    id: 3,
    name: "Maya & Aditya",
    location: "Baby Photoshoot, Bangalore",
    rating: 5,
    testimonial: "Arjun captured the most precious moments of our baby's first months. He was patient, kind, and really understood how to work with infants. The photos are treasures we'll cherish forever.",
    avatar: "https://images.unsplash.com/photo-1543269664-56d93c1b41a6?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80"
  }
];

const Testimonials = () => {
  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-secondary-800 sm:text-4xl">What Our Customers Say</h2>
          <p className="mt-3 max-w-2xl mx-auto text-lg text-secondary-500">Hear from people who've found their perfect photographers</p>
        </div>
        
        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id}>
              <CardContent className="p-6">
                <StarRating rating={testimonial.rating} className="mb-4" />
                <blockquote className="text-secondary-600 mb-4">
                  "{testimonial.testimonial}"
                </blockquote>
                <div className="flex items-center">
                  <Avatar className="h-10 w-10 mr-4">
                    <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                    <AvatarFallback>
                      {testimonial.name.split(' ').map(name => name[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-secondary-800">{testimonial.name}</p>
                    <p className="text-sm text-secondary-500">{testimonial.location}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;

import React from 'react';
import { Star } from 'lucide-react';

const reviews = [
  {
    id: 1,
    name: "Sarah Jenkins",
    role: "Adventure Traveler",
    image: "https://i.pravatar.cc/150?u=sarah",
    content: "Yatra Setu completely changed how I plan my trips! The AI understood my need for hidden cafes and scenic trails perfectly. Highly recommended!",
    rating: 5,
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Business Consultant",
    image: "https://i.pravatar.cc/150?u=michael",
    content: "I used to spend hours researching flights and hotels. Now, I just tell Yatra Setu my schedule, and it builds the perfect itinerary in seconds.",
    rating: 5,
  },
  {
    id: 3,
    name: "Elena Rodriguez",
    role: "Family Vacationer",
    image: "https://i.pravatar.cc/150?u=elena",
    content: "Planning a trip for a family of 5 is usually a nightmare. Yatra Setu suggested kid-friendly activities that we all actually enjoyed. Truly magical.",
    rating: 5,
  },
  {
    id: 4,
    name: "David Kim",
    role: "Solo Backpacker",
    image: "https://i.pravatar.cc/150?u=david",
    content: "The smart routing feature saved me so much transit time in Tokyo. I got to see 30% more places without feeling rushed.",
    rating: 5,
  }
];

export const Testimonials = () => {
  return (
    <section className="relative w-full py-24 overflow-hidden bg-transparent z-[2]">
      <div className="max-w-[1360px] mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-sans text-[40px] font-medium text-vstara-text mb-4">
            Loved by Travelers Worldwide
          </h2>
          <p className="font-sans text-xl text-vstara-muted max-w-2xl mx-auto">
            See how our AI-powered itineraries are creating unforgettable journeys.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {reviews.map((review) => (
            <div 
              key={review.id} 
              className="relative p-6 bg-black backdrop-blur-[24px] border border-white/20 rounded-[32px] shadow-[0_8px_32px_0_rgba(0,0,0,0.05)] transition-transform hover:-translate-y-2 duration-300"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="font-sans text-[15px] leading-relaxed text-white mb-6 min-h-[80px]">
                "{review.content}"
              </p>
              <div className="flex items-center gap-3">
                <img 
                  src={review.image} 
                  alt={review.name} 
                  className="w-10 h-10 rounded-full object-cover shadow-sm border border-white/80" 
                />
                <div>
                  <h4 className="font-sans text-sm font-semibold text-white leading-tight">
                    {review.name}
                  </h4>
                  <span className="font-sans text-xs text-white/70">
                    {review.role}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

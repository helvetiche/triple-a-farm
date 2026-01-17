'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { Spinner as LoadingSpinner } from '@/components/ui/spinner';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel"

interface Testimonial {
  id: string;
  customer: string;
  rating: number;
  comment: string;
  rooster: string;
  date: string;
}

// Fallback testimonials in case API fails
const fallbackTestimonials = [
  {
    name: "Juan Dela Cruz",
    role: "Gamefowl Competitor",
    rating: 5,
    text: "The quality of Triple A's gamefowl is exceptional. My champion bird came from their breeding program and has won multiple competitions. Their bloodlines are truly championship-grade."
  },
  {
    name: "Pedro Santos",
    role: "Breeding Enthusiast",
    rating: 5,
    text: "I've been purchasing from Triple A Gamefarm for over 5 years. Their birds are healthy, well-trained, and have excellent genetics. The customer service is outstanding!"
  },
  {
    name: "Maria Garcia",
    role: "Competition Judge",
    rating: 4,
    text: "As a judge, I see birds from many farms. Triple A consistently produces some of the finest specimens I've evaluated. Their dedication to quality breeding shows in every bird."
  },
  {
    name: "Ricardo Reyes",
    role: "Professional Breeder",
    rating: 5,
    text: "The training program at Triple A is second to none. Their birds arrive disciplined and ready for competition. I've recommended them to all my fellow breeders."
  },
  {
    name: "Elena Martinez",
    role: "Gamefowl Collector",
    rating: 5,
    text: "My collection has grown exponentially with Triple A's birds. Each one is a masterpiece of breeding. The health certificates and documentation are always thorough."
  },
  {
    name: "Antonio Chavez",
    role: "Competition Sponsor",
    rating: 4,
    text: "Triple A Gamefarm sponsors some of the most prestigious competitions. Their birds consistently place in the top ranks. A name synonymous with excellence."
  },
  {
    name: "Sofia Lim",
    role: "Long-time Client",
    rating: 5,
    text: "Three generations of my family have trusted Triple A Gamefarm. Their reputation for quality and integrity is unmatched in the industry."
  }
];

export function Ratings() {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const [testimonials, setTestimonials] = useState(fallbackTestimonials);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        console.log(' Fetching testimonials from Firebase...');
        const response = await fetch('/api/public/testimonials?limit=10');
        console.log(' API Response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log(' API Response data:', data);
          
          if (data.data && data.data.length > 0) {
            // Transform API data to match component format
            const formattedTestimonials = data.data.map((review: Testimonial) => ({
              name: review.customer,
              role: `Verified Buyer - ${review.rooster}`,
              rating: review.rating,
              text: review.comment
            }));
            console.log(' Replacing fallback testimonials with database data...');
            console.log(' Formatted testimonials:', formattedTestimonials);
            setTestimonials(formattedTestimonials);
            console.log(' Loaded', formattedTestimonials.length, 'testimonials from database');
          } else {
            console.log(' No published reviews found in database, using fallback');
          }
        } else {
          console.error(' API request failed with status:', response.status);
        }
      } catch (error) {
        console.error(' Error fetching testimonials:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  useEffect(() => {
    if (!api || isLoading) return;

    const interval = setInterval(() => {
      api.scrollNext();
    }, 5000); // Move every 5 seconds

    return () => clearInterval(interval);
  }, [api, isLoading]);

  if (isLoading) {
    return (
      <section className="py-20 bg-[#2f8466]">
        <div className="max-w-8xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">Ano ang Sabi ng Aming mga Kliyente</h2>
            <p className="text-white/80 text-lg max-w-2xl mx-auto mb-8">Naglo-load ng mga testimonial...</p>
            <div className="flex justify-center">
              <LoadingSpinner className="w-8 h-8 text-white animate-spin" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-[#2f8466]">
      <div className="max-w-8xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4" data-aos="fade-up">
            Ano ang Sabi ng Aming mga Kliyente
          </h2>
          <p className="text-white/80 text-lg max-w-2xl mx-auto" data-aos="fade-up">
            Pinagkakatiwalaan ng mga mahilig at kompetidor.
          </p>
        </div>

        {/* Testimonial Cards */}
        <div className="relative">
          <Carousel
            setApi={setApi}
            opts={{
              align: "start",
              loop: true,
              dragFree: true,
              containScroll: "keepSnaps",
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {testimonials.map((testimonial, index) => (
                <CarouselItem 
                  key={index} 
                  className="pl-4 md:basis-1/2 lg:basis-1/3 xl:basis-1/4 2xl:basis-1/4"
                >
                  <motion.div 
                    className="bg-white/10 backdrop-blur-sm p-6 border border-white/20 h-full flex flex-col"
                    data-aos="fade-up"
                    data-aos-delay={index * 50}
                  >
                    <Quote className="w-8 h-8 text-white/40 mb-4" />
                    <p className="text-white/90 mb-6 leading-relaxed">
                      "{testimonial.text}"
                    </p>
                    <div className="flex items-center justify-between mt-auto">
                      <div>
                        <p className="text-white font-semibold">{testimonial.name}</p>
                        <p className="text-white/60 text-sm">{testimonial.role}</p>
                      </div>
                      <div className="flex gap-1">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
          
          {/* Progress indicators */}
          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: count }).map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-none transition-all ${
                  index === current - 1 
                    ? "bg-white w-8" 
                    : "bg-white/40 hover:bg-white/60"
                }`}
                onClick={() => api?.scrollTo(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
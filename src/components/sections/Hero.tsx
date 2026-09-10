import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { ArrowRight, Play } from 'lucide-react';
import { fadeInUp } from '../../utils/animations';

export const Hero = () => {
  return (
    <section id="home" className="relative flex flex-col md:block min-h-[90vh] pt-28 md:pt-20 overflow-hidden bg-warm-light">
      {/* Desktop Background Image (Hidden on mobile) */}
      <div className="absolute inset-0 z-0 hidden md:block">
        <img 
          src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
          alt="Beautiful travel destination" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-transparent"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10 max-w-7xl flex flex-col justify-center flex-grow md:h-full md:min-h-[90vh] md:-mt-20 md:pt-20">
        <div className="max-w-3xl">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary font-semibold text-sm mb-6">
              AI-Powered Tourism Platform
            </span>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-[1.1] mb-6">
              Travel smarter,<br /> not harder with <span className="text-primary">TourEase</span>
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-2xl leading-relaxed">
              Unify your hotel bookings, local guides, itinerary planning, and transport into one seamless experience powered by intelligent AI.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="gap-2" onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}>
                Plan Your Trip <ArrowRight className="w-5 h-5" />
              </Button>
              <Button variant="outline" size="lg" className="gap-2 bg-white/50 backdrop-blur-sm">
                <Play className="w-5 h-5" /> See How It Works
              </Button>
            </div>
            
            <div className="mt-12 flex items-center gap-6 text-sm text-gray-500 font-medium">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <img 
                    key={i}
                    src={`https://i.pravatar.cc/100?img=${i + 10}`} 
                    alt="User" 
                    className="w-10 h-10 rounded-full border-2 border-white"
                  />
                ))}
              </div>
              <p>Join [PLACEHOLDER: Number of users] early access travelers</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Mobile Image (Below Text) */}
      <div className="w-full h-64 sm:h-80 md:hidden relative z-0 mt-8">
        <img 
          src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
          alt="Beautiful travel destination" 
          className="w-full h-full object-cover"
        />
      </div>
    </section>
  );
};

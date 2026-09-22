import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { stats } from '../../data/constants';

const StatCard = ({ value, label, delay = 0 }: { value: string, label: string, delay?: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div 
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.6, delay }}
      className="flex flex-col items-center justify-center p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20"
    >
      <div className="text-5xl md:text-6xl font-black text-white font-heading mb-3 tracking-tight">
        {value}
      </div>
      <p className="text-teal-50 text-center font-medium leading-snug">
        {label}
      </p>
    </motion.div>
  );
};

export const ImpactStats = () => {
  return (
    <section id="impact" className="py-24 relative overflow-hidden bg-gradient-to-br from-[#0F766E] to-[#14B8A6]">
      {/* Decorative patterns */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-10">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute w-full h-full">
          <polygon points="0,100 100,0 100,100" fill="white" />
        </svg>
      </div>

      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white font-heading mb-4">
            Projected Impact
          </h2>
          <p className="text-teal-100 text-lg max-w-2xl mx-auto">
            Yatra Setu isn't just about convenience—it's about creating a sustainable, thriving ecosystem for travelers and locals alike.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <StatCard 
              key={index} 
              value={stat.value} 
              label={stat.label} 
              delay={index * 0.15}
            />
          ))}
        </div>
        
        <div className="text-center">
          <p className="text-teal-100/70 text-sm">
            [PLACEHOLDER: brief note on how these projections were estimated, e.g. "Based on regional tourism board data and comparable platform benchmarks"]
          </p>
        </div>
      </div>
    </section>
  );
};

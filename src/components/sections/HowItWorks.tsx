import { SectionHeading } from '../ui/SectionHeading';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, CreditCard, PlaneTakeoff } from 'lucide-react';

import { steps } from '../../data/constants';

export const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 bg-warm-light relative overflow-hidden">
      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <SectionHeading 
          preTitle="How It Works"
          title="From dream to departure"
          subtitle="Four simple steps to the most effortless travel experience of your life."
          align="center"
          className="mb-20"
        />
        
        <div className="relative">
          {/* Connecting Line (Desktop only) */}
          <div className="hidden md:block absolute top-[2.5rem] left-[10%] right-[10%] h-0.5 bg-gray-200 z-0"></div>
          {/* Connecting Line (Mobile only) */}
          <div className="md:hidden absolute top-[2.5rem] bottom-[2.5rem] left-1/2 w-0.5 bg-gray-200 z-0 -translate-x-1/2"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-6">
            {steps.map((step, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="relative z-10 flex flex-col items-center text-center"
              >
                {/* Badge & Icon Container */}
                <div className="relative mb-6">
                  <div className="w-20 h-20 rounded-full bg-white shadow-md border-4 border-warm-light flex items-center justify-center relative z-10 text-primary">
                    {(() => {
                      const icons = { Search, SlidersHorizontal, CreditCard, PlaneTakeoff };
                      const Icon = icons[step.icon as keyof typeof icons] || Search;
                      return <Icon className="w-6 h-6" />;
                    })()}
                  </div>
                  {/* Step Number Badge */}
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gray-900 text-white font-bold text-sm flex items-center justify-center border-2 border-white z-20">
                    {step.number}
                  </div>
                </div>
                
                <h3 className="text-xl font-bold mb-3 text-gray-900">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed max-w-[250px]">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

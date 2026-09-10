import { SectionHeading } from '../ui/SectionHeading';
import { motion } from 'framer-motion';
import { XCircle, CheckCircle2, ArrowRight } from 'lucide-react';

const oldWay = [
  "Juggling multiple disconnected apps and 20+ browser tabs",
  "Zero local insight, relying on generic tourist traps",
  "Hidden booking fees and surprise surcharges",
  "One-size-fits-all generic itineraries",
  "Struggling with language barriers and local transport"
];

const newWay = [
  "One AI-powered platform for your entire trip",
  "Verified local guides for authentic, hidden experiences",
  "Transparent, bundled pricing with no hidden fees",
  "100% personalized plans tailored to your vibe",
  "Multilingual support and seamless transport integration"
];

export const ProblemSolution = () => {
  return (
    <section id="problem-solution" className="py-24 bg-white relative overflow-hidden">
      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <SectionHeading 
            preTitle="The Problem & Solution"
            title="Travel doesn't have to be stressful"
            subtitle="Say goodbye to the headaches of traditional travel planning and hello to the future of smart tourism."
            align="center"
            className="mb-8"
          />
          <p className="text-lg font-medium text-primary bg-primary/5 border border-primary/10 inline-block px-6 py-3 rounded-2xl">
            [PLACEHOLDER: one sentence on what makes TourEase's approach different from existing OTAs/travel apps]
          </p>
        </div>

        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12 relative">
          
          {/* Old Way Column */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="w-full lg:w-1/2 bg-gray-50 rounded-2xl p-8 md:p-10 border border-red-100 shadow-sm relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-100 rounded-bl-full -mr-16 -mt-16 opacity-50"></div>
            
            <h3 className="text-2xl font-bold text-gray-800 mb-8 flex items-center gap-3">
              <span className="text-red-500">The Old Way</span>
            </h3>
            
            <ul className="space-y-6">
              {oldWay.map((item, index) => (
                <li key={index} className="flex items-start gap-4 text-gray-600">
                  <XCircle className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
                  <span className="text-lg leading-snug">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* VS Divider */}
          <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 items-center justify-center w-16 h-16 rounded-full bg-white shadow-xl border border-gray-100">
            <span className="text-xl font-black text-gray-300 font-heading">VS</span>
          </div>
          
          <div className="lg:hidden flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-md border border-gray-100 -my-4 relative z-20">
            <ArrowRight className="w-5 h-5 text-gray-400 rotate-90" />
          </div>

          {/* TourEase Way Column */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full lg:w-1/2 bg-teal-50 rounded-2xl p-8 md:p-10 border border-teal-100 shadow-lg relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-200 rounded-bl-full -mr-16 -mt-16 opacity-30"></div>
            
            <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
              <span className="text-primary">The TourEase Way</span>
            </h3>
            
            <ul className="space-y-6">
              {newWay.map((item, index) => (
                <li key={index} className="flex items-start gap-4 text-gray-800 font-medium">
                  <CheckCircle2 className="w-6 h-6 text-primary shrink-0 mt-0.5" />
                  <span className="text-lg leading-snug">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

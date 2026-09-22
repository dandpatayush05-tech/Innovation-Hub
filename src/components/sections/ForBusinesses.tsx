import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { CheckCircle2 } from 'lucide-react';

import { benefits } from '../../data/constants';

export const ForBusinesses = () => {
  return (
    <section id="for-businesses" className="py-24 bg-primary relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary-light opacity-20 rounded-bl-[100px] -mr-20 -mt-20"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-light opacity-20 rounded-tr-[80px] -ml-10 -mb-10"></div>
      
      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="flex-1 text-white"
          >
            <span className="inline-block py-1 px-3 rounded-full bg-white/20 text-white font-semibold text-sm mb-6 tracking-wide uppercase">
              For Partners
            </span>
            <h2 className="text-4xl md:text-5xl font-bold font-heading leading-tight mb-6">
              Grow Your Business with Yatra Setu
            </h2>
            <p className="text-lg text-teal-100 mb-8 max-w-xl leading-relaxed">
              Whether you're a boutique hotel, an established travel agency, or a passionate local guide, our AI engine connects you directly with travelers who are looking for exactly what you offer.
            </p>
            
            <ul className="space-y-4 mb-10">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-center gap-3 text-teal-50">
                  <CheckCircle2 className="w-6 h-6 text-accent shrink-0" />
                  <span className="text-lg">{benefit}</span>
                </li>
              ))}
            </ul>
            
            <Button 
              variant="accent" 
              size="lg" 
              className="w-full sm:w-auto shadow-xl shadow-accent/20"
              onClick={() => {
                window.dispatchEvent(new CustomEvent('preselect-interest', { detail: 'hotel' }));
                document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Partner With Us
            </Button>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex-1 w-full"
          >
            <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl relative">
              <img 
                src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1000&q=80" 
                alt="Business dashboard and hospitality" 
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-primary/20 mix-blend-multiply"></div>
            </div>
          </motion.div>
          
        </div>
      </div>
    </section>
  );
};

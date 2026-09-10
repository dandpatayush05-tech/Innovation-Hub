import { SectionHeading } from '../ui/SectionHeading';
import { Card } from '../ui/Card';
import { Brain, Map, Users, Wallet, Globe, Zap } from 'lucide-react';
import { features } from '../../data/constants';

export const Features = () => {
  return (
    <section id="features" className="py-24 bg-base-bg">
      <div className="container mx-auto px-6 max-w-7xl">
        <SectionHeading 
          preTitle="Features"
          title="Everything you need in one place"
          subtitle="TourEase replaces dozens of travel apps with a single, unified platform designed to make your journey effortless."
          align="center"
          className="mb-16"
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const icons = { Brain, Map, Users, Wallet, Globe, Zap };
            const Icon = icons[feature.icon as keyof typeof icons] || Brain;
            
            return (
              <Card key={index} delay={index * 0.1} className="flex flex-col h-full group">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed flex-grow">
                  {feature.description}
                </p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

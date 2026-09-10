import { SectionHeading } from '../ui/SectionHeading';
import { Card } from '../ui/Card';
import { motion } from 'framer-motion';

import { team } from '../../data/constants';

export const Team = () => {
  return (
    <section id="team" className="py-24 bg-base-bg">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <SectionHeading 
            preTitle="About Us"
            title="Meet the Innovators"
            align="center"
          />
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-gray-600 mt-6 leading-relaxed"
          >
            We are a team of student innovators who believe the tourism industry is overdue for a technological leap. Our mission is to revive global travel by replacing fragmented, frustrating booking processes with a unified, AI-driven ecosystem that empowers both modern travelers and local economies.
          </motion.p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {team.map((member, index) => (
            <Card 
              key={index} 
              delay={index * 0.15} 
              className="flex flex-col items-center text-center px-6 py-10"
            >
              <div className="w-32 h-32 rounded-full mb-6 ring-4 ring-primary/10 bg-primary/10 flex items-center justify-center transition-transform duration-500 hover:scale-105">
                <span className="text-3xl font-bold text-primary tracking-widest">TM</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
              <p className="text-primary font-medium text-sm mb-4">{member.role}</p>
              <p className="text-gray-600 leading-relaxed text-sm">
                {member.bio}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

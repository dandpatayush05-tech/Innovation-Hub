import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { Mail, MapPin, Phone, MessageSquare, CheckCircle2 } from 'lucide-react';
import { SectionHeading } from '../ui/SectionHeading';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createContactSchema } from '../../lib/validations';
import { FieldError } from '../FieldError';

export const Contact = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(createContactSchema),
    defaultValues: {
      name: '',
      email: '',
      interest: '' as any,
      message: ''
    }
  });

  useEffect(() => {
    const handlePreselect = (e: CustomEvent) => {
      setValue('interest', e.detail);
    };
    window.addEventListener('preselect-interest', handlePreselect as EventListener);
    return () => window.removeEventListener('preselect-interest', handlePreselect as EventListener);
  }, [setValue]);

  const onSubmit = (_data: any) => {
    // We aren't doing actual submission yet, just state update
    setIsSubmitted(true);
  };

  return (
    <section id="contact" className="py-24 bg-white">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="flex flex-col md:flex-row gap-12 md:gap-16 lg:gap-24">
          
          {/* Left Column: Form */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
            className="flex-1 w-full"
          >
            <SectionHeading 
              preTitle="Get in Touch"
              title="Request a Demo"
              subtitle="Ready to revolutionize how you travel or manage bookings? Drop us a line."
              className="mb-8"
            />
            
            {isSubmitted ? (
              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-8 md:p-12 text-center flex flex-col items-center justify-center h-full min-h-[400px]">
                <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Request Received!</h3>
                <p className="text-gray-600">Thanks — we'll be in touch shortly to schedule your demo.</p>
              </div>
            ) : (
              <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-semibold text-gray-700">Full Name *</label>
                    <input 
                      type="text" 
                      id="name" 
                      {...register('name')}
                      className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:border-transparent transition-all ${errors.name ? 'border-red-500 focus:ring-red-500 bg-red-50' : 'border-gray-200 focus:ring-primary'}`}
                      placeholder="John Doe"
                    />
                    <FieldError error={errors.name?.message as string} />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-semibold text-gray-700">Work Email *</label>
                    <input 
                      type="email" 
                      id="email" 
                      {...register('email')}
                      className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:border-transparent transition-all ${errors.email ? 'border-red-500 focus:ring-red-500 bg-red-50' : 'border-gray-200 focus:ring-primary'}`}
                      placeholder="john@example.com"
                    />
                    <FieldError error={errors.email?.message as string} />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="interest" className="text-sm font-semibold text-gray-700">I am a... *</label>
                  <select 
                    id="interest" 
                    {...register('interest')}
                    className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:border-transparent transition-all bg-white ${errors.interest ? 'border-red-500 focus:ring-red-500 bg-red-50' : 'border-gray-200 focus:ring-primary'}`}
                  >
                    <option value="" disabled>Select your profile</option>
                    <option value="traveler">Traveler</option>
                    <option value="hotel">Hotel / Accommodation</option>
                    <option value="agency">Travel Agency</option>
                    <option value="guide">Local Guide</option>
                  </select>
                  <FieldError error={errors.interest?.message as string} />
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-semibold text-gray-700">How can we help?</label>
                  <textarea 
                    id="message" 
                    {...register('message')}
                    rows={4}
                    className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-y ${errors.message ? 'border-red-500 focus:ring-red-500 bg-red-50' : 'border-gray-200'}`}
                    placeholder="Tell us about your needs..."
                  ></textarea>
                  <FieldError error={errors.message?.message as string} />
                </div>
                
                <Button type="submit" variant="accent" size="lg" className="w-full shadow-lg shadow-accent/20">
                  Submit Request
                </Button>
              </form>
            )}
          </motion.div>

          {/* Right Column: Contact Info */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full md:w-5/12 bg-warm-light rounded-3xl p-8 lg:p-12 flex flex-col justify-center border border-gray-100"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-6">See TourEase in action</h3>
            <p className="text-gray-600 mb-10 leading-relaxed">
              Whether you're looking to plan the perfect getaway or integrate your business into our smart ecosystem, our team is ready to show you how TourEase simplifies the journey.
            </p>

            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Email Us</h4>
                  <a href="mailto:hello@tourease.app" className="text-primary hover:underline">hello@tourease.app</a>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Call Us</h4>
                  <p className="text-gray-600">+1 (555) 123-4567</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Visit HQ</h4>
                  <p className="text-gray-600">Innovation Hub, Level 4<br />Tech District, CA 94103</p>
                </div>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-gray-200/60">
              <h4 className="font-semibold text-gray-900 mb-4">Chat with support</h4>
              <Button variant="outline" className="w-full bg-white gap-2">
                <MessageSquare className="w-4 h-4" /> Open Live Chat
              </Button>
            </div>
          </motion.div>
          
        </div>
      </div>
    </section>
  );
};

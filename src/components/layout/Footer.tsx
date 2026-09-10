import { Map, Globe, Mail, MessageCircle } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white pt-20 pb-10">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 lg:col-span-2">
            <a href="#" aria-label="TourEase Home" className="flex items-center gap-2 text-white mb-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg inline-flex">
              <Map className="w-8 h-8 text-primary-light" aria-hidden="true" />
              <span className="text-2xl font-heading font-bold tracking-tight">
                TourEase
              </span>
            </a>
            <p className="text-gray-400 max-w-sm mb-8 leading-relaxed">
              We're rethinking how the world travels. One smart, unified itinerary at a time.
            </p>
            <div className="flex gap-4">
              <a href="#" aria-label="Website" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                <Globe className="w-5 h-5" aria-hidden="true" />
              </a>
              <a href="#" aria-label="Email" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                <Mail className="w-5 h-5" aria-hidden="true" />
              </a>
              <a href="#" aria-label="Chat" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                <MessageCircle className="w-5 h-5" aria-hidden="true" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-lg mb-6">Platform</h4>
            <ul className="space-y-4">
              <li><a href="#how-it-works" className="text-gray-400 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">How it works</a></li>
              <li><a href="#features" className="text-gray-400 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">Features</a></li>
              <li><a href="#for-businesses" className="text-gray-400 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">For Local Guides</a></li>
              <li><a href="#contact" className="text-gray-400 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">Contact</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-lg mb-6">Company</h4>
            <ul className="space-y-4">
              <li><a href="#team" className="text-gray-400 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">About Us / Team</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">Careers</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} TourEase Inc. All rights reserved.
          </p>
          <p className="text-gray-500 text-sm font-medium">
            Made with <span className="text-accent">♥</span> by the Student Innovators Team
          </p>
        </div>
      </div>
    </footer>
  );
};

import { Link } from 'react-router-dom';
import { Facebook, Instagram, Globe, MapPin } from 'lucide-react';

export default function Footer() {
  const year = new Date().getFullYear();
  const mapEmbedUrl = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3651.9026380184683!2d90.37583087599625!3d23.75082088832129!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755bf5503de24b7%3A0x1bea081615a0d1ef!2s97%20Asad%20Ave%2C%20Dhaka%201207!5e0!3m2!1sen!2sbd!4v1711547622039!5m2!1sen!2sbd";
  
  return (
    <footer className="bg-black text-white py-12 px-4">
      <div className="contained">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <img src="/images/logo.png" alt="JITC Logo" className="h-12 w-auto" />
              <h3 className="text-xl font-bold">JITC</h3>
            </div>
            <p className="text-gray-400 mb-4 max-w-md">
              Your premier destination for workshops, competitions, and fests. Stay engaged, learn new skills, and connect with like-minded enthusiasts.
            </p>
            <div className="flex items-center space-x-4 mb-6">
              <a href="https://www.facebook.com/sjs.jitc" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="https://www.instagram.com/jitc.official/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="https://dynamicjitc.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <Globe className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-3">Events</h4>
            <ul className="space-y-2">
              <li><Link to="/events/workshop" className="text-gray-400 hover:text-white transition-colors">Workshops</Link></li>
              <li><Link to="/events/competition" className="text-gray-400 hover:text-white transition-colors">Competitions</Link></li>
              <li><Link to="/events/fest" className="text-gray-400 hover:text-white transition-colors">Fests</Link></li>
            </ul>
            <h4 className="text-lg font-semibold mb-3 mt-6">Visit Us</h4>
            <a href="https://dynamicjitc.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors flex items-center">
              <Globe className="h-4 w-4 mr-2" />
              <span>Main Website</span>
            </a>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-3">Contact</h4>
            <ul className="space-y-2 text-gray-400">
              <li className="flex items-start">
                <MapPin className="h-4 w-4 mr-2 mt-1 flex-shrink-0" />
                <span>97 Asad Ave, Dhaka 1207</span>
              </li>
              <li>Jitc@sjs.edu.bd</li>
              <li>(123) 456-7890</li>
            </ul>
            <div className="mt-4 h-[180px] w-full rounded-md overflow-hidden border border-gray-700">
              <iframe 
                src={mapEmbedUrl}
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen={false} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="JITC Location"
              />
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-400 text-sm mb-4 md:mb-0 flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0">
            <p className="md:mr-4">
              &copy; {year} JITC. All rights reserved.
            </p>
            <p className="text-gray-500">
              Developed by <a href="https://jitc.vercel.app/developers" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">JITC developers</a>
            </p>
          </div>
          <div className="flex space-x-6">
            <Link to="/privacy-policy" className="text-gray-400 hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms-of-service" className="text-gray-400 hover:text-white transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

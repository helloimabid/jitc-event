import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  
  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Workshops', href: '/events/workshop' },
    { name: 'Competitions', href: '/events/competition' },
    { name: 'Fests', href: '/events/fest' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Add effect to prevent scrolling when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      // Save current scroll position
      const scrollY = window.scrollY;
      
      // Add styles to body to prevent scrolling
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
    } else {
      // Restore scroll position when menu is closed
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0', 10) * -1);
      }
    }
    
    // Cleanup function
    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  return (
    <>
      {/* Overlay for mobile menu */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
      
      <nav 
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out",
          isScrolled ? "bg-white/80 dark:bg-black/80 backdrop-blur-lg shadow-md py-3" : "bg-transparent py-5"
        )}
      >
        <div className="contained flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <img src="/images/logo.png" alt="JITC Logo" className="h-10 w-auto" />
            <span className="text-2xl font-bold tracking-tighter">JITC</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "relative font-medium transition-colors",
                  location.pathname === item.href ? "text-black dark:text-white" : "text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white",
                  "after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:-bottom-1 after:left-0 after:bg-black dark:after:bg-white after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left",
                  location.pathname === item.href && "after:scale-x-100"
                )}
              >
                {item.name}
              </Link>
            ))}
          </div>
          
          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden rounded-md p-2 text-gray-700 dark:text-gray-200 z-50"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span className="sr-only">Open main menu</span>
            {isMenuOpen ? (
              <X className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>

        {/* Mobile menu */}
        <div
          className={cn(
            "md:hidden fixed inset-0 top-[60px] bg-white dark:bg-black transition-all duration-300 ease-in-out transform z-50",
            isMenuOpen ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full pointer-events-none"
          )}
        >
          <div className="p-4 space-y-4 max-h-[calc(100vh-60px)] overflow-y-auto">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "block py-3 text-base font-medium transition-colors",
                  location.pathname === item.href ? 
                    "text-black dark:text-white border-b-2 border-black dark:border-white" : 
                    "text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700"
                )}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </>
  );
}

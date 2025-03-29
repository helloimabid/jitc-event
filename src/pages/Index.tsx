import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, Users, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/ui/layout/Navbar';
import Footer from '@/components/ui/layout/Footer';
import FadeIn from '@/components/ui/animations/FadeIn';
import EventCard from '@/components/ui/events/EventCard';
import { Event } from '@/types';
import { getEvents } from '@/services/eventService';

const Index = () => {
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);
  const [nextEvent, setNextEvent] = useState<Event | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        const data = await getEvents();
        setEvents(data);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEvents();
  }, []);
  
  useEffect(() => {
    if (events && events.length > 0) {
      // Take the 3 most recent events for the featured section
      setFeaturedEvents(events.slice(0, 3));
      
      // Find the next upcoming event
      const now = new Date();
      const upcomingEvents = events
        .filter(event => new Date(event.date) > now)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      if (upcomingEvents.length > 0) {
        setNextEvent(upcomingEvents[0]);
      }
    }
  }, [events]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 md:pt-32 md:pb-24 bg-gradient-to-b from-white to-gray-100 dark:from-black dark:to-gray-900">
        <div className="contained">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-full md:w-1/2 mb-8 md:mb-0">
              <FadeIn delay={100}>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                  Discover <span className="text-black dark:text-white">Exceptional</span> Club Events
                </h1>
              </FadeIn>
              
              <FadeIn delay={300}>
                <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-lg">
                  From workshops to competitions to multi-day fests, find the perfect event to enhance your skills and expand your network.
                </p>
              </FadeIn>
              
              <FadeIn delay={500}>
                <div className="flex flex-wrap gap-4">
                  <Button asChild size="lg" className="text-base">
                    <Link to="/events/workshop">Explore Workshops</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="text-base">
                    <Link to="/events/competition">View Competitions</Link>
                  </Button>
                </div>
              </FadeIn>
            </div>
            
            <div className="w-full md:w-1/2">
              <FadeIn direction="left">
                <div className="relative h-[350px] sm:h-[400px] md:h-[450px] lg:h-[500px] rounded-xl overflow-hidden shadow-2xl">
                  <img 
                    src={nextEvent?.image || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1740&auto=format&fit=crop"} 
                    alt={nextEvent?.title || "Club Events"} 
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                    <div className="bg-white dark:bg-black/90 backdrop-blur-sm rounded-lg p-4 inline-block">
                      <p className="text-sm font-semibold">Next Event</p>
                      {nextEvent ? (
                        <>
                          <h3 className="text-xl font-bold">{nextEvent.title}</h3>
                          <p className="text-sm">{new Date(nextEvent.date).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}</p>
                        </>
                      ) : (
                        <>
                          <h3 className="text-xl font-bold">Coming Soon</h3>
                          <p className="text-sm">No upcoming events scheduled</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-black">
        <div className="contained">
          <FadeIn>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">Why Join Our Events?</h2>
          </FadeIn>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <FadeIn delay={100}>
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 flex items-center justify-center rounded-full bg-black text-white dark:bg-white dark:text-black mb-6">
                  <Calendar className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Diverse Events</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  From technical workshops to creative competitions, we offer a wide range of events to match your interests.
                </p>
              </div>
            </FadeIn>
            
            <FadeIn delay={200}>
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 flex items-center justify-center rounded-full bg-black text-white dark:bg-white dark:text-black mb-6">
                  <Users className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Networking</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Connect with like-minded individuals, industry professionals, and potential mentors.
                </p>
              </div>
            </FadeIn>
            
            <FadeIn delay={300}>
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 flex items-center justify-center rounded-full bg-black text-white dark:bg-white dark:text-black mb-6">
                  <Award className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Recognition</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Showcase your talents, win prizes, and build your portfolio through our competitive events.
                </p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>
      
      {/* Featured Events Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="contained">
          <div className="flex justify-between items-end mb-12">
            <FadeIn>
              <h2 className="text-3xl md:text-4xl font-bold">Featured Events</h2>
            </FadeIn>
            
            <FadeIn delay={200}>
              <Link to="/events" className="flex items-center text-sm font-semibold hover:underline group">
                View all events 
                <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </FadeIn>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoading ? (
              // Loading placeholders
              Array(3).fill(0).map((_, index) => (
                <div key={index} className="rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse">
                  <div className="aspect-[16/9] w-full bg-gray-200 dark:bg-gray-700 rounded-t-xl" />
                  <div className="p-6 space-y-3">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                  </div>
                </div>
              ))
            ) : featuredEvents.length > 0 ? (
              featuredEvents.map((event, index) => (
                <FadeIn key={event.id} delay={index * 100}>
                  <EventCard event={event} />
                </FadeIn>
              ))
            ) : (
              <div className="col-span-3 text-center py-8">
                <p>No events available at the moment. Check back soon!</p>
              </div>
            )}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-black text-white">
        <div className="contained text-center">
          <FadeIn>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to join our next event?</h2>
          </FadeIn>
          
          <FadeIn delay={200}>
            <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
              Don't miss out on the opportunity to learn, compete, and connect with our vibrant community.
            </p>
          </FadeIn>
          
          <FadeIn delay={400}>
            <Button asChild size="lg" className="bg-white text-black hover:bg-gray-200 text-base">
              <Link to="/events">Browse All Events</Link>
            </Button>
          </FadeIn>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Index;

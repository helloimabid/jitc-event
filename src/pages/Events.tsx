"use client"

import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import Navbar from "@/components/ui/layout/Navbar"
import Footer from "@/components/ui/layout/Footer"
import EventCard from "@/components/ui/events/EventCard"
import FadeIn from "@/components/ui/animations/FadeIn"
import type { Event, EventCategory } from "@/types"
import { getEvents } from "@/services/eventService"

const Events = () => {
  const { category } = useParams<{ category?: EventCategory }>()
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])

  const {
    data: events,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["events"],
    queryFn: getEvents,
  })

  useEffect(() => {
    
  }, [events])

  const categoryTitles = {
    workshop: "Workshops",
    competition: "Competitions",
    fest: "Fests",
  }

  const categoryDescriptions = {
    workshop: "Enhance your skills with our hands-on workshops led by industry experts.",
    competition: "Put your skills to the test and compete for recognition and prizes.",
    fest: "Immerse yourself in multi-day events packed with activities, competitions, and networking.",
  }

  useEffect(() => {
    if (events) {
      if (category) {
        setFilteredEvents(events.filter((event) => event.category === category))
      } else {
        setFilteredEvents(events)
      }
    }
  }, [category, events])

  const title = category ? categoryTitles[category] : "All Events"
  const description = category
    ? categoryDescriptions[category]
    : "Discover workshops, competitions, and fests to enhance your skills and expand your network."

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow pt-24">
        {/* Header */}
        <section className="py-12 md:py-20 bg-gray-50 dark:bg-gray-900">
          <div className="contained">
            <FadeIn>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">{title}</h1>
            </FadeIn>
            <FadeIn delay={200}>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl">{description}</p>
            </FadeIn>
          </div>
        </section>

        {/* Events Grid */}
        <section className="py-16 bg-white dark:bg-black">
          <div className="contained">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse">
                    <div className="aspect-[16/9] w-full bg-gray-200 dark:bg-gray-700 rounded-t-xl" />
                    <div className="p-6 space-y-3">
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                      <div className="flex justify-between pt-4">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <FadeIn>
                <div className="text-center py-16">
                  <h3 className="text-2xl font-medium mb-2">Error loading events</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {error instanceof Error
                      ? error.message
                      : "An unknown error occurred. Please try refreshing the page."}
                  </p>
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
                  >
                    Refresh Page
                  </button>
                </div>
              </FadeIn>
            ) : filteredEvents && filteredEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredEvents.map((event, index) => (
                  <FadeIn key={event.id} delay={index * 100}>
                    <EventCard event={event} />
                  </FadeIn>
                ))}
              </div>
            ) : (
              <FadeIn>
                <div className="text-center py-16">
                  <h3 className="text-2xl font-medium mb-2">No events found</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {category
                      ? `There are currently no events in the ${categoryTitles[category]} category.`
                      : "There are currently no events available."}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    {events && events.length > 0
                      ? "Try selecting a different category or check back later."
                      : "Please check back later when new events are added."}
                  </p>
                </div>
              </FadeIn>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default Events


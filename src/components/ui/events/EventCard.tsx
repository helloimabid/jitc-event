import { Link } from "react-router-dom";
import { Calendar, MapPin, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Event } from "@/types";
import { format } from "date-fns";

interface EventCardProps {
  event: Event;
  className?: string;
}

export default function EventCard({ event, className }: EventCardProps) {
  const { id, title, description, date, location, category, image, fee } =
    event;

  const eventDate = new Date(date);
  const isPastEvent = eventDate < new Date();

  const formattedDate = (() => {
    try {
      return format(eventDate, "MMMM d, yyyy");
    } catch (error) {
      return date;
    }
  })();

  // Function to create a sanitized version of HTML content
  const createMarkup = (htmlContent: string) => {
    return { __dangerouslySetInnerHTML: { __html: htmlContent } };
  };

  return (
    <Link
      to={`/event/${id}`}
      className={cn(
        "group block overflow-hidden rounded-xl bg-white dark:bg-gray-900 shadow-lg hover:shadow-xl transition-all duration-300",
        isPastEvent ? "opacity-80" : "",
        className
      )}
    >
      <div className="relative">
        <div className="aspect-[16/9] w-full overflow-hidden bg-gray-200">
          {image ? (
            <img
              src={image}
              alt={title}
              className={cn(
                "h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500",
                isPastEvent ? "filter grayscale" : ""
              )}
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700" />
          )}
        </div>

        <div className="absolute top-4 left-4">
          <div className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white bg-black/80 backdrop-blur-sm rounded-full">
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </div>
        </div>

        {isPastEvent ? (
          <div className="absolute top-4 right-4">
            <div className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white bg-red-500/90 backdrop-blur-sm rounded-full flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              Event Ended
            </div>
          </div>
        ) : fee !== undefined && fee > 0 ? (
          <div className="absolute top-4 right-4">
            <div className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white bg-black/80 backdrop-blur-sm rounded-full">
              ৳{fee}
            </div>
          </div>
        ) : null}
      </div>

      <div className="p-6">
        <h3 className="text-xl font-semibold mb-2 group-hover:text-black/70 dark:group-hover:text-white/70 transition-colors">
          {title}
        </h3>

        <div
          className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 event-description"
          {...createMarkup(description)}
        />

        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            <span>{formattedDate}</span>
          </div>

          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{location}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

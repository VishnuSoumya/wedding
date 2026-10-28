import {
  Calendar,
  Clock,
  ExternalLink,
  Gem,
  Heart,
  MapPin,
  Music,
  Shirt,
  Sparkles,
} from "lucide-react";
import { EVENTS, VENUE } from "@/lib/wedding-data";
import AddToCalendarButtons from "./AddToCalendarButtons";
import FadeIn from "./FadeIn";
import SectionHeading from "./SectionHeading";

const iconMap = {
  gem: Gem,
  music: Music,
  heart: Heart,
  sparkles: Sparkles,
};

export default function Itinerary() {
  return (
    <section id="itinerary" className="scroll-mt-4 px-5 py-16 md:py-24">
      <div className="mx-auto max-w-4xl">
        <SectionHeading
          label="Itinerary"
          title="Celebration Schedule"
          subtitle={`Reception on 25 November (7:00 PM) and wedding on 26 November (10:00 AM) at ${VENUE.name}.`}
        />

        <div className="grid gap-6 sm:gap-8">
          {EVENTS.map((event, index) => {
            const Icon = iconMap[event.icon] || Heart;

            return (
              <FadeIn key={event.id} delay={index * 80}>
                <article className="group overflow-hidden rounded-2xl border border-stone-200/70 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <div className="flex items-center gap-3 border-b border-stone-100 bg-gradient-to-r from-sage-50 to-ivory px-5 py-4 sm:px-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sage-100 text-sage-700 transition-colors group-hover:bg-gold/15 group-hover:text-gold">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="font-serif text-xl text-charcoal sm:text-2xl">
                        {event.title}
                      </h3>
                      <p className="flex items-center gap-1.5 text-sm text-stone-500">
                        <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                        {event.date}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 px-5 py-5 sm:px-6 sm:py-6">
                    {event.time && (
                      <div className="flex items-start gap-3 text-sm text-stone-600 sm:text-base">
                        <Clock
                          className="mt-0.5 h-4 w-4 shrink-0 text-gold"
                          aria-hidden="true"
                        />
                        <span>{event.time}</span>
                      </div>
                    )}

                    <div className="flex items-start gap-3 text-sm text-stone-600 sm:text-base">
                      <MapPin
                        className="mt-0.5 h-4 w-4 shrink-0 text-gold"
                        aria-hidden="true"
                      />
                      <div>
                        <p className="font-medium text-charcoal">{event.venue}</p>
                        <p className="mt-0.5 text-stone-500">{event.address}</p>
                      </div>
                    </div>

                    {event.dressCode && (
                      <div className="flex items-start gap-3 text-sm text-stone-600 sm:text-base">
                        <Shirt
                          className="mt-0.5 h-4 w-4 shrink-0 text-gold"
                          aria-hidden="true"
                        />
                        <span>
                          <span className="font-medium text-charcoal">Dress code: </span>
                          {event.dressCode}
                        </span>
                      </div>
                    )}

                    <div className="space-y-3">
                      <AddToCalendarButtons event={event} compact />
                      <a
                        href={event.mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-sage-200 bg-sage-50 px-4 py-2.5 text-sm font-medium text-sage-800 transition-colors hover:border-sage-300 hover:bg-sage-100 sm:w-auto"
                      >
                        <ExternalLink className="h-4 w-4" aria-hidden="true" />
                        Open in Google Maps
                      </a>
                    </div>
                  </div>
                </article>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}

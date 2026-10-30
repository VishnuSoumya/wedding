import { Car, Mail, Phone, Plane, Train } from "lucide-react";
import {
  TRAVEL,
  WEDDING,
  contactPhones,
  phoneTelHref,
} from "@/lib/wedding-data";
import FadeIn from "./FadeIn";
import SectionHeading from "./SectionHeading";

export default function TravelInfo() {
  const phones = contactPhones(WEDDING.contact.phone);

  return (
    <section id="travel" className="scroll-mt-4 bg-sand px-5 py-16 md:py-24">
      <div className="mx-auto max-w-4xl">
        <SectionHeading
          label="Travel & Venue"
          title="Plan Your Visit"
          subtitle="Directions to the venue and how to reach Bengaluru."
        />

        <FadeIn>
          <div className="rounded-2xl border border-stone-200/70 bg-ivory p-6 shadow-sm sm:p-8">
            <h3 className="flex items-center gap-2 font-serif text-xl text-charcoal">
              <Car className="h-5 w-5 text-gold" aria-hidden="true" />
              Getting Here
            </h3>
            <ul className="mt-5 space-y-5">
              <li>
                <div className="flex items-start gap-3">
                  <Plane className="mt-0.5 h-4 w-4 shrink-0 text-sage-600" aria-hidden="true" />
                  <div>
                    <p className="font-medium text-charcoal">{TRAVEL.airport.name}</p>
                    <p className="mt-1 text-sm leading-relaxed text-stone-600">
                      {TRAVEL.airport.note}
                    </p>
                  </div>
                </div>
              </li>
              <li>
                <div className="flex items-start gap-3">
                  <Train className="mt-0.5 h-4 w-4 shrink-0 text-sage-600" aria-hidden="true" />
                  <div>
                    <p className="font-medium text-charcoal">{TRAVEL.train.name}</p>
                    <p className="mt-1 text-sm leading-relaxed text-stone-600">
                      {TRAVEL.train.note}
                    </p>
                  </div>
                </div>
              </li>
              <li>
                <div className="flex items-start gap-3">
                  <Car className="mt-0.5 h-4 w-4 shrink-0 text-sage-600" aria-hidden="true" />
                  <div>
                    <p className="font-medium text-charcoal">{TRAVEL.local.name}</p>
                    <p className="mt-1 text-sm leading-relaxed text-stone-600">
                      {TRAVEL.local.note}
                    </p>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </FadeIn>

        <FadeIn delay={150} className="mt-8">
          <div className="rounded-2xl border border-gold/20 bg-gradient-to-br from-gold/5 to-sage-50 p-6 text-center sm:p-8">
            <p className="text-sm font-medium uppercase tracking-wider text-gold">
              Need Assistance?
            </p>
            <h3 className="mt-2 font-serif text-2xl text-charcoal">
              We&apos;re Here to Help
            </h3>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-stone-600">
              For any questions about the venue, travel, or the celebrations, reach
              out to the Jagalur Family.
            </p>
            <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap sm:gap-x-6 sm:gap-y-3">
              {phones.map((phone) => (
                <a
                  key={phone}
                  href={phoneTelHref(phone)}
                  className="inline-flex items-center gap-2 text-sm font-medium text-charcoal transition-colors hover:text-gold"
                >
                  <Phone className="h-4 w-4 text-gold" aria-hidden="true" />
                  {phone}
                </a>
              ))}
              <a
                href={`mailto:${WEDDING.contact.email}`}
                className="inline-flex items-center gap-2 text-sm font-medium text-charcoal transition-colors hover:text-gold"
              >
                <Mail className="h-4 w-4 text-gold" aria-hidden="true" />
                {WEDDING.contact.email}
              </a>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

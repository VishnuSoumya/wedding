"use client";

import { useState } from "react";
import { ChevronDown, MapPin } from "lucide-react";
import HeroSlideshow from "@/components/HeroSlideshow";
import { HERO_PHOTOS } from "@/lib/hero-photos";
import { WEDDING } from "@/lib/wedding-data";
import { scrollToSection } from "@/lib/utils";

export default function Hero() {
  const [backdropSrc, setBackdropSrc] = useState(HERO_PHOTOS[0]?.src);

  return (
    <section className="relative flex min-h-[100dvh] flex-col justify-center overflow-hidden px-4 pb-20 pt-16 sm:px-6 sm:pt-20 md:pb-16">
      {/* Ambient backdrop from the couple photo */}
      <div className="absolute inset-0" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={backdropSrc}
          alt=""
          className="absolute inset-0 h-full w-full scale-105 object-cover opacity-[0.35] blur-2xl saturate-[1.15]"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ivory/70 via-ivory/88 to-ivory" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_15%,rgba(217,119,6,0.12),transparent_50%)]" />
      </div>

      <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] md:gap-12 lg:gap-16">
        {/* Featured photo */}
        <div className="order-1 mx-auto w-full max-w-md md:order-none md:mx-0 md:max-w-none">
          <div className="relative pb-6 sm:pb-8">
            <div
              className="pointer-events-none absolute inset-0 flex items-center justify-center pb-5 sm:pb-6"
              aria-hidden="true"
            >
              <div className="aspect-[4/5] w-[82%] max-w-[340px] rounded-[1.75rem] bg-gradient-to-br from-gold/30 via-sage-100/35 to-gold/15 opacity-90 blur-2xl md:aspect-[3/4]" />
            </div>
            <HeroSlideshow
              photos={HERO_PHOTOS}
              onActivePhoto={(photo) => {
                if (photo?.src) setBackdropSrc(photo.src);
              }}
            />
            <button
              type="button"
              onClick={() => scrollToSection("itinerary")}
              className="absolute bottom-8 right-[12%] z-40 rounded-full border border-white/70 bg-white/90 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.1em] text-gold shadow-sm backdrop-blur-sm transition-colors hover:bg-white sm:bottom-10 sm:right-[14%]"
            >
              Save the Date
            </button>
          </div>
        </div>

        {/* Copy */}
        <div className="order-2 flex flex-col items-center text-center md:order-none md:items-start md:text-left">
          <p className="text-xs font-medium uppercase tracking-[0.35em] text-sage-700">
            We&apos;re getting married
          </p>

          <h1 className="mt-4 font-serif text-4xl leading-[1.1] text-charcoal sm:text-5xl lg:text-[3.25rem]">
            {WEDDING.bride}
            <span className="mx-2 block text-2xl text-gold sm:mx-3 sm:inline sm:text-3xl">
              &
            </span>
            {WEDDING.groom}
          </h1>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 md:justify-start">
            {WEDDING.hashtags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-gold/20 bg-gold/5 px-3 py-1 font-mono text-[10px] text-gold sm:text-xs"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="mt-6 w-full max-w-md rounded-xl border border-stone-200/50 bg-white/45 px-5 py-4 backdrop-blur-sm sm:px-6 sm:py-5 md:max-w-lg">
            <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-sage-600">
              With the blessings of
            </p>
            <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-5 md:items-start">
              <div className="min-w-0 flex-1 text-center md:text-left">
                <p className="font-serif text-lg leading-snug text-charcoal sm:text-xl">
                  {WEDDING.brideParents.join(" & ")}
                </p>
                <p className="mt-1.5 text-xs text-stone-500">
                  Parents of {WEDDING.bride}
                </p>
              </div>
              <div
                className="flex shrink-0 items-center gap-3 text-gold/70 sm:flex-col sm:gap-2"
                aria-hidden="true"
              >
                <span className="h-px w-12 bg-gradient-to-r from-transparent via-gold/40 to-transparent sm:h-8 sm:w-px sm:bg-gradient-to-b" />
                <span className="font-serif text-xl text-gold">&</span>
                <span className="h-px w-12 bg-gradient-to-r from-transparent via-gold/40 to-transparent sm:h-8 sm:w-px sm:bg-gradient-to-b" />
              </div>
              <div className="min-w-0 flex-1 text-center md:text-left">
                <p className="font-serif text-lg leading-snug text-charcoal sm:text-xl">
                  {WEDDING.groomParents.join(" & ")}
                </p>
                <p className="mt-1.5 text-xs text-stone-500">
                  Parents of {WEDDING.groom}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 w-full max-w-md rounded-2xl border border-stone-200/70 bg-white/60 p-5 shadow-sm backdrop-blur-sm sm:p-6 md:max-w-none">
            <p className="font-serif text-xl text-stone-800 sm:text-2xl">
              {WEDDING.dateDisplay}
            </p>
            <p className="mt-2 text-sm text-stone-500">{WEDDING.dateDetail}</p>
            <div className="mt-4 border-t border-stone-200/80 pt-4 text-sm text-stone-600 sm:text-base">
              <p className="flex items-start justify-center gap-2 md:justify-start">
                <MapPin
                  className="mt-0.5 h-4 w-4 shrink-0 text-sage-600"
                  aria-hidden="true"
                />
                <span>
                  <span className="font-medium text-stone-700">
                    {WEDDING.location}
                  </span>
                  <br />
                  <span className="text-stone-500">{WEDDING.locationDetail}</span>
                </span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => scrollToSection("rsvp")}
            className="mt-8 inline-flex min-h-[48px] w-full max-w-md items-center justify-center rounded-full bg-gold px-10 py-3.5 text-sm font-semibold uppercase tracking-wider text-white shadow-lg shadow-gold/25 transition-all duration-300 hover:-translate-y-0.5 hover:bg-gold-dark hover:shadow-xl active:scale-[0.98] sm:w-auto md:max-w-none"
          >
            RSVP Now
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={() => scrollToSection("countdown")}
        className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 animate-bounce text-stone-500 transition-colors hover:text-gold"
        aria-label="Scroll to countdown"
      >
        <ChevronDown className="h-6 w-6" />
      </button>
    </section>
  );
}

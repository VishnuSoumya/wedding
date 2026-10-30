"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import DrivePhoto from "@/components/DrivePhoto";

const AUTO_MS = 3000;

function roleForIndex(index, active, length) {
  if (length <= 1) return "active";
  const prev = (active - 1 + length) % length;
  const next = (active + 1) % length;
  if (index === active) return "active";
  if (index === prev) return "prev";
  if (index === next) return "next";
  return "hidden";
}

const roleStyles = {
  active:
    "z-30 w-[82%] max-w-[340px] -translate-x-1/2 left-1/2 opacity-100 scale-100 blur-0",
  prev: "z-10 w-[58%] max-w-[240px] left-[2%] -translate-x-0 opacity-[0.42] scale-[0.88] blur-[1px]",
  next: "z-10 w-[58%] max-w-[240px] right-[2%] translate-x-0 opacity-[0.42] scale-[0.88] blur-[1px]",
  hidden: "pointer-events-none z-0 opacity-0 scale-75",
};

const frameStyles = {
  active:
    "shadow-2xl shadow-stone-900/15 ring-1 ring-stone-900/5",
  prev: "shadow-lg shadow-stone-900/5 ring-1 ring-white/60",
  next: "shadow-lg shadow-stone-900/5 ring-1 ring-white/60",
};

export default function HeroSlideshow({ photos, className = "", onActivePhoto }) {
  const list = useMemo(() => photos.filter(Boolean), [photos]);
  const [active, setActive] = useState(0);
  const [motionOk, setMotionOk] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setMotionOk(!mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const go = useCallback(
    (delta) => {
      if (list.length <= 1) return;
      setActive((i) => (i + delta + list.length) % list.length);
    },
    [list.length]
  );

  useEffect(() => {
    if (list.length <= 1 || !motionOk) return undefined;
    const id = window.setInterval(() => go(1), AUTO_MS);
    return () => window.clearInterval(id);
  }, [go, list.length, motionOk]);

  const activePhoto = list[active] ?? list[0];

  useEffect(() => {
    onActivePhoto?.(activePhoto);
  }, [activePhoto, onActivePhoto]);

  if (!list.length) return null;

  return (
    <div className={`relative ${className}`}>
      <div
        className="relative mx-auto h-[min(68vh,580px)] w-full max-w-lg sm:h-[min(72vh,640px)]"
        aria-roledescription="carousel"
        aria-label="Couple photos"
      >
        <div className="relative h-full w-full">
          {list.map((photo, index) => {
            const role = roleForIndex(index, active, list.length);
            if (role === "hidden") return null;

            const isSide = role === "prev" || role === "next";
            return (
              <div
                key={photo.id || photo.src || index}
                className={`absolute top-1/2 flex -translate-y-1/2 justify-center transition-[transform,opacity,filter] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${roleStyles[role]} ${isSide ? "top-[52%]" : ""}`}
                aria-hidden={role !== "active"}
              >
                <button
                  type="button"
                  disabled={!isSide}
                  onClick={() => (role === "prev" ? go(-1) : role === "next" ? go(1) : undefined)}
                  className={`relative aspect-[4/5] w-full overflow-hidden rounded-[1.75rem] border border-white/80 bg-stone-100/80 sm:rounded-[2rem] md:aspect-[3/4] ${frameStyles[role]} ${isSide ? "cursor-pointer hover:opacity-55 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold" : "cursor-default"}`}
                  tabIndex={isSide ? 0 : -1}
                  aria-label={
                    role === "prev"
                      ? "Show previous photo"
                      : role === "next"
                        ? "Show next photo"
                        : undefined
                  }
                >
                  <DrivePhoto
                    photo={photo}
                    className="h-full w-full rounded-[1.65rem] sm:rounded-[1.9rem]"
                    sizes={role === "active" ? "grid" : "grid"}
                  />
                  {role === "active" && (
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-charcoal/25 via-transparent to-transparent" />
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {list.length > 1 && (
          <div className="absolute -bottom-2 left-1/2 z-40 flex -translate-x-1/2 gap-1.5 sm:-bottom-3">
            {list.map((photo, index) => (
              <button
                key={`dot-${photo.id || index}`}
                type="button"
                onClick={() => setActive(index)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === active
                    ? "w-6 bg-gold"
                    : "w-1.5 bg-stone-300 hover:bg-stone-400"
                }`}
                aria-label={`Go to photo ${index + 1}`}
                aria-current={index === active ? "true" : undefined}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

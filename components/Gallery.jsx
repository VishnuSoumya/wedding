"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
import { loadRandomGalleryFromDrive } from "@/lib/gallery-from-drive";
import DrivePhoto from "./DrivePhoto";
import FadeIn from "./FadeIn";
import SectionHeading from "./SectionHeading";

const GALLERY_SLOT_COUNT = 6;

function galleryCellClass(index) {
  return index === 0
    ? "col-span-2 row-span-2 aspect-[4/3] md:col-span-1 md:row-span-1 md:aspect-square"
    : "aspect-square";
}

function GallerySkeleton() {
  return (
    <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 md:gap-4">
      {Array.from({ length: GALLERY_SLOT_COUNT }, (_, index) => (
        <div
          key={`gallery-skeleton-${index}`}
          className={`overflow-hidden rounded-xl bg-stone-200/80 ${galleryCellClass(index)}`}
          aria-hidden="true"
        >
          <div className="h-full w-full animate-pulse bg-gradient-to-br from-stone-200 via-stone-100 to-stone-200" />
        </div>
      ))}
    </div>
  );
}

export default function Gallery() {
  const [photos, setPhotos] = useState([]);
  const [loadState, setLoadState] = useState("loading");
  const [lightboxIndex, setLightboxIndex] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const fromDrive = await loadRandomGalleryFromDrive(GALLERY_SLOT_COUNT);
      if (cancelled) return;
      if (fromDrive?.length) {
        setPhotos(fromDrive);
        setLoadState("ready");
      } else {
        setLoadState("empty");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const openLightbox = (index) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);

  const goNext = () => {
    setLightboxIndex((prev) =>
      prev === null ? null : (prev + 1) % photos.length
    );
  };

  const goPrev = () => {
    setLightboxIndex((prev) =>
      prev === null ? null : (prev - 1 + photos.length) % photos.length
    );
  };

  useEffect(() => {
    if (lightboxIndex === null) return;

    const len = photos.length;

    const handleKey = (e) => {
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowRight") {
        setLightboxIndex((prev) =>
          prev === null ? null : (prev + 1) % len
        );
      }
      if (e.key === "ArrowLeft") {
        setLightboxIndex((prev) =>
          prev === null ? null : (prev - 1 + len) % len
        );
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKey);
    };
  }, [lightboxIndex, photos.length]);

  return (
    <section id="gallery" className="scroll-mt-4 px-5 py-16 md:py-24">
      <div className="mx-auto max-w-5xl">
        <SectionHeading
          label="Gallery"
          title="Moments We Treasure"
          subtitle="A glimpse of our journey together — tap any photo to view full size."
        />

        <p className="-mt-4 mb-8 text-center">
          <Link
            href="/photos/"
            className="text-sm font-medium text-gold underline-offset-4 transition-colors hover:text-gold-dark hover:underline"
          >
            Share or browse engagement, reception & wedding photos →
          </Link>
        </p>

        {loadState === "loading" && <GallerySkeleton />}

        {loadState === "empty" && (
          <p className="rounded-xl border border-stone-200/80 bg-stone-50 px-6 py-10 text-center text-sm text-stone-500">
            Gallery photos are loading from our albums — check back shortly or
            visit the{" "}
            <Link href="/photos/" className="font-medium text-gold hover:underline">
              photo dump
            </Link>
            .
          </p>
        )}

        {loadState === "ready" && (
          <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 md:gap-4">
            {photos.map((photo, index) => (
              <FadeIn key={photo.key} delay={index * 60}>
                <button
                  type="button"
                  onClick={() => openLightbox(index)}
                  className={`group relative overflow-hidden rounded-xl bg-stone-200 ${galleryCellClass(index)}`}
                  aria-label={`View ${photo.alt}`}
                >
                  <DrivePhoto photo={photo} sizes="grid" skeleton />
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-charcoal/0 transition-colors duration-300 group-hover:bg-charcoal/30">
                    <ZoomIn
                      className="h-8 w-8 scale-75 text-white opacity-0 transition-all duration-300 group-hover:scale-100 group-hover:opacity-100"
                      aria-hidden="true"
                    />
                  </div>
                </button>
              </FadeIn>
            ))}
          </div>
        )}
      </div>

      {lightboxIndex !== null && photos[lightboxIndex] && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/95 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Photo lightbox"
        >
          <button
            type="button"
            onClick={closeLightbox}
            className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
            aria-label="Close lightbox"
          >
            <X className="h-6 w-6" />
          </button>

          <button
            type="button"
            onClick={goPrev}
            className="absolute left-2 z-10 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20 sm:left-4"
            aria-label="Previous photo"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <DrivePhoto
            photo={photos[lightboxIndex]}
            sizes="lightbox"
            skeleton
          />

          <button
            type="button"
            onClick={goNext}
            className="absolute right-2 z-10 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20 sm:right-4"
            aria-label="Next photo"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          <p className="absolute bottom-6 left-1/2 max-w-sm -translate-x-1/2 text-center text-sm text-white/80">
            {photos[lightboxIndex].alt}
          </p>
        </div>
      )}
    </section>
  );
}

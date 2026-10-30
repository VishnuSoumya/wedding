"use client";

import { useEffect, useMemo, useState } from "react";
import { ExternalLink, ImageOff } from "lucide-react";

function isHeicLike(name, mimeType) {
  const n = (name || "").toLowerCase();
  const m = (mimeType || "").toLowerCase();
  return (
    n.endsWith(".heic") ||
    n.endsWith(".heif") ||
    m.includes("heic") ||
    m.includes("heif")
  );
}

export default function DrivePhoto({
  photo,
  className = "",
  sizes = "grid",
  skeleton = false,
}) {
  const fallbacks = useMemo(() => {
    const list = photo.srcFallbacks || [photo.src, photo.fullSrc];
    return [...new Set(list.filter(Boolean))];
  }, [photo]);

  const [index, setIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const src = fallbacks[index];

  useEffect(() => {
    setLoaded(false);
  }, [src]);
  const heic = photo.kind === "drive" && isHeicLike(photo.name, photo.mimeType);
  const driveView =
    photo.kind === "drive" && photo.id
      ? `https://drive.google.com/file/d/${photo.id}/view`
      : null;

  if (heic) {
    return (
      <div
        className={`flex h-full w-full flex-col items-center justify-center gap-2 bg-stone-100 p-3 text-center ${className}`}
      >
        <ImageOff className="h-8 w-8 text-stone-400" aria-hidden="true" />
        <p className="text-xs text-stone-600">
          HEIC preview not supported in browser
        </p>
        {driveView && (
          <a
            href={driveView}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-medium text-gold hover:underline"
          >
            Open in Drive
            <ExternalLink className="h-3 w-3" aria-hidden="true" />
          </a>
        )}
      </div>
    );
  }

  if (!src || index >= fallbacks.length) {
    return (
      <div
        className={`flex h-full w-full flex-col items-center justify-center gap-2 bg-stone-100 p-3 text-center ${className}`}
      >
        <ImageOff className="h-8 w-8 text-stone-400" aria-hidden="true" />
        <p className="line-clamp-2 text-xs text-stone-600">{photo.alt}</p>
        {driveView && (
          <a
            href={driveView}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-medium text-gold hover:underline"
          >
            View in Drive
            <ExternalLink className="h-3 w-3" aria-hidden="true" />
          </a>
        )}
      </div>
    );
  }

  const imgClass =
    sizes === "lightbox"
      ? "max-h-[85vh] max-w-full rounded-lg object-contain shadow-2xl"
      : "h-full w-full object-cover transition-transform duration-500 group-hover:scale-105";

  const showSkeleton = skeleton && !loaded;

  return (
    <div
      className={
        sizes === "lightbox"
          ? `relative inline-flex max-h-[85vh] max-w-full ${className}`
          : `relative h-full w-full ${className}`
      }
    >
      {showSkeleton && (
        <div
          className={`absolute inset-0 animate-pulse bg-gradient-to-br from-stone-200 via-stone-100 to-stone-200 ${
            sizes === "lightbox" ? "min-h-[40vh] min-w-[min(100%,280px)] rounded-lg" : ""
          }`}
          aria-hidden="true"
        />
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={photo.alt}
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        className={`${imgClass} transition-opacity duration-300 ${
          showSkeleton ? "opacity-0" : "opacity-100"
        } ${sizes === "lightbox" ? "" : "relative z-[1]"}`}
        onLoad={() => setLoaded(true)}
        onError={() => {
          setLoaded(false);
          setIndex((prev) =>
            prev + 1 < fallbacks.length ? prev + 1 : fallbacks.length
          );
        }}
      />
    </div>
  );
}

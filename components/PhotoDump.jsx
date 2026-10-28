"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Cloud,
  ImagePlus,
  Loader2,
  Trash2,
  Upload,
  X,
  ZoomIn,
} from "lucide-react";
import {
  PHOTO_ALBUMS,
  PHOTO_DUMP_CATEGORIES,
  WEDDING,
} from "@/lib/wedding-data";
import {
  DRIVE_DEPLOY_HINT,
  combineUploadProgress,
  deleteDrivePhoto,
  isDriveConfigured,
  listDrivePhotos,
  uploadDrivePhoto,
} from "@/lib/google-drive";
import {
  blobUrlFromRecord,
  deletePhoto,
  getPhotosByCategory,
  isImageFile,
  savePhoto,
} from "@/lib/photo-storage";
import { mapDriveFileToGalleryItem } from "@/lib/drive-photo-map";
import { cn } from "@/lib/utils";
import DrivePhoto from "./DrivePhoto";
import FadeIn from "./FadeIn";
import SectionHeading from "./SectionHeading";

function staticPhotosForCategory(categoryId) {
  return (PHOTO_ALBUMS[categoryId] || []).map((photo, index) => ({
    kind: "static",
    key: `static-${categoryId}-${index}`,
    id: `static-${categoryId}-${index}`,
    src: photo.src,
    fullSrc: photo.src,
    alt: photo.alt || photo.caption || "Wedding photo",
    name: photo.alt || "Photo",
  }));
}

export default function PhotoDump() {
  const driveEnabled = isDriveConfigured();
  const [activeTab, setActiveTab] = useState(PHOTO_DUMP_CATEGORIES[0].id);
  const [remotePhotos, setRemotePhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const objectUrlsRef = useRef(new Map());

  const activeCategory = PHOTO_DUMP_CATEGORIES.find((c) => c.id === activeTab);

  const revokeLocalUrls = useCallback(() => {
    objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    objectUrlsRef.current.clear();
  }, []);

  const loadCategory = useCallback(async (categoryId) => {
    setLoading(true);
    setError(null);
    try {
      if (driveEnabled) {
        const files = await listDrivePhotos(categoryId);
        setRemotePhotos(files.map(mapDriveFileToGalleryItem));
      } else {
        const records = await getPhotosByCategory(categoryId);
        revokeLocalUrls();
        const withUrls = records.map((record) => {
          const url = blobUrlFromRecord(record);
          objectUrlsRef.current.set(record.id, url);
          return {
            kind: "local",
            key: record.id,
            id: record.id,
            src: url,
            fullSrc: url,
            alt: record.name,
            name: record.name,
          };
        });
        setRemotePhotos(withUrls);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not load photos.";
      setError(driveEnabled ? message : "Could not load saved photos in this browser.");
      setRemotePhotos([]);
    } finally {
      setLoading(false);
    }
  }, [revokeLocalUrls]);

  useEffect(() => {
    loadCategory(activeTab);
  }, [activeTab, loadCategory]);

  useEffect(() => {
    if (uploading) setUploadOpen(true);
  }, [uploading]);

  useEffect(() => () => revokeLocalUrls(), [revokeLocalUrls]);

  const galleryItems = useMemo(() => {
    const staticItems = staticPhotosForCategory(activeTab);
    return [...staticItems, ...remotePhotos];
  }, [activeTab, remotePhotos]);

  const processFiles = async (fileList) => {
    const picked = Array.from(fileList || []);
    const files = picked.filter(isImageFile);

    if (picked.length > 0 && files.length === 0) {
      setError(
        "Those files weren't recognized as photos. Try JPG or PNG, or pick from your photo library again."
      );
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    if (files.length === 0) return;

    setUploading(true);
    setError(null);
    const total = files.length;
    try {
      for (let index = 0; index < files.length; index++) {
        const file = files[index];
        const setFileProgress = (update) => {
          const overallPercent = driveEnabled
            ? combineUploadProgress(index, total, update)
            : Math.min(
                100,
                Math.round(
                  ((index + update.filePercent / 100) / total) * 100
                )
              );
          setUploadProgress({
            fileIndex: index + 1,
            fileTotal: total,
            fileName: file.name,
            phase: update.phase,
            filePercent: update.filePercent,
            overallPercent,
          });
        };

        if (driveEnabled) {
          const uploaded = await uploadDrivePhoto(activeTab, file, setFileProgress);
          setRemotePhotos((prev) => [mapDriveFileToGalleryItem(uploaded), ...prev]);
        } else {
          setFileProgress({ phase: "saving", filePercent: 30 });
          const record = await savePhoto({ category: activeTab, file });
          setFileProgress({ phase: "saving", filePercent: 100 });
          const url = blobUrlFromRecord(record);
          objectUrlsRef.current.set(record.id, url);
          setRemotePhotos((prev) => [
            {
              kind: "local",
              key: record.id,
              id: record.id,
              src: url,
              fullSrc: url,
              alt: record.name,
              name: record.name,
            },
            ...prev,
          ]);
        }
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Upload failed — try again.";
      setError(
        message.includes("QuotaExceeded")
          ? "Storage is full in this browser — remove some photos or use smaller files."
          : driveEnabled
            ? message
            : "Upload failed — try again or use smaller images."
      );
    } finally {
      setUploading(false);
      setUploadProgress(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const uploadPhaseLabel =
    uploadProgress?.phase === "reading"
      ? "Preparing photo on your device…"
      : uploadProgress?.phase === "uploading"
        ? "Uploading to Google Drive…"
        : "Saving…";

  const handleRemove = async (photo) => {
    try {
      if (photo.kind === "drive") {
        await deleteDrivePhoto(photo.id, activeTab);
        setRemotePhotos((prev) => prev.filter((p) => p.id !== photo.id));
      } else if (photo.kind === "local") {
        await deletePhoto(photo.id);
        const url = objectUrlsRef.current.get(photo.id);
        if (url) {
          URL.revokeObjectURL(url);
          objectUrlsRef.current.delete(photo.id);
        }
        setRemotePhotos((prev) => prev.filter((p) => p.id !== photo.id));
      }
      setLightboxIndex((prev) => {
        if (prev === null) return null;
        const item = galleryItems[prev];
        if (item?.id === photo.id) return null;
        return prev;
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not remove that photo.";
      setError(message);
    }
  };

  const openLightbox = (index) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);

  const goNext = () => {
    setLightboxIndex((prev) =>
      prev === null ? null : (prev + 1) % galleryItems.length
    );
  };

  const goPrev = () => {
    setLightboxIndex((prev) =>
      prev === null
        ? null
        : (prev - 1 + galleryItems.length) % galleryItems.length
    );
  };

  useEffect(() => {
    if (lightboxIndex === null) return;

    const len = galleryItems.length;

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
  }, [lightboxIndex, galleryItems.length]);

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    processFiles(e.dataTransfer.files);
  };

  const canRemove = (photo) =>
    photo.kind === "drive" || photo.kind === "local";

  return (
    <section className="px-5 py-16 md:py-24">
      <div className="mx-auto max-w-5xl">
        <SectionHeading
          label="Photo dump"
          title="Share Your Shots"
          subtitle={
            driveEnabled
              ? `Drop engagement, reception, and wedding photos for ${WEDDING.coupleDisplay}. Uploads go to Google Drive and show up here for everyone.`
              : `Drop photos for ${WEDDING.coupleDisplay}. Connect Google Drive (see env.local.example) to sync uploads — until then they stay in this browser only.`
          }
        />

        {driveEnabled ? (
          <p className="-mt-6 mb-8 flex items-center justify-center gap-2 text-center text-sm text-sage-700">
            <Cloud className="h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
            Synced with Google Drive
          </p>
        ) : (
          <p className="-mt-6 mb-8 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm text-amber-950">
            Drive not configured — copy{" "}
            <span className="font-mono text-xs">env.local.example</span> to{" "}
            <span className="font-mono text-xs">.env.local</span> and deploy{" "}
            <span className="font-mono text-xs">google-drive/Code.gs</span>.
          </p>
        )}

        <div
          role="tablist"
          aria-label="Photo categories"
          className="mb-8 flex flex-wrap justify-center gap-2"
        >
          {PHOTO_DUMP_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              role="tab"
              aria-selected={activeTab === cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={cn(
                "min-h-[44px] rounded-full px-5 py-2.5 text-sm font-medium transition-colors",
                activeTab === cat.id
                  ? "bg-charcoal text-ivory shadow-md"
                  : "border border-stone-200 bg-white text-stone-600 hover:border-gold/40 hover:text-charcoal"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {activeCategory && (
          <p className="mb-6 text-center text-sm text-stone-600">
            {activeCategory.description}
          </p>
        )}

        <div className="mb-10 overflow-hidden rounded-2xl border border-stone-200 bg-sand/50">
          <button
            type="button"
            onClick={() => setUploadOpen((open) => !open)}
            aria-expanded={uploadOpen}
            aria-controls="photo-upload-panel"
            id="photo-upload-trigger"
            className="flex w-full min-h-[52px] items-center justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-sand/80"
          >
            <span className="flex min-w-0 items-center gap-3">
              {uploading ? (
                <Loader2
                  className="h-5 w-5 shrink-0 animate-spin text-gold"
                  aria-hidden="true"
                />
              ) : (
                <ImagePlus
                  className="h-5 w-5 shrink-0 text-gold"
                  aria-hidden="true"
                />
              )}
              <span className="min-w-0">
                <span className="block font-serif text-lg text-charcoal">
                  {uploading ? "Uploading photos…" : "Add photos"}
                </span>
                <span className="mt-0.5 block truncate font-mono text-xs text-stone-400">
                  {driveEnabled
                    ? `Drive / ${activeCategory?.label || activeTab}`
                    : `local only · public/photos/${activeTab}/`}
                </span>
              </span>
            </span>
            <ChevronDown
              className={cn(
                "h-5 w-5 shrink-0 text-stone-500 transition-transform duration-200",
                uploadOpen && "rotate-180"
              )}
              aria-hidden="true"
            />
          </button>

          {uploadOpen && (
          <div
            id="photo-upload-panel"
            role="region"
            aria-labelledby="photo-upload-trigger"
          >
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              className={cn(
                "relative border-t border-stone-200/80 px-6 py-8 text-center transition-colors",
                dragOver
                  ? "border-gold/40 bg-gold/5"
                  : "bg-white/40"
              )}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.heic,.heif"
                multiple
                className="sr-only"
                onChange={(e) => processFiles(e.target.files)}
              />
              <p className="font-serif text-lg text-charcoal">
                Drag photos here
              </p>
              <p className="mt-1 text-sm text-stone-500">
                or choose files — JPG, PNG, HEIC (max 12 MB each)
              </p>
              <button
                type="button"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
                className="mt-5 inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-gold px-6 py-2.5 text-sm font-semibold text-[#0d1117] transition-colors hover:bg-gold-dark disabled:opacity-60"
              >
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Upload className="h-4 w-4" aria-hidden="true" />
                )}
                {uploading ? "Uploading…" : "Select photos"}
              </button>
            </div>
          </div>
          )}
        </div>

        {error && (
          <div className="mb-6 space-y-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-800">
            <p>{error}</p>
            {driveEnabled && (
              <p className="text-left text-xs leading-relaxed text-red-900/80">
                {DRIVE_DEPLOY_HINT} Redeploy the latest Code.gs (iframe upload
                support). Match UPLOAD_TOKEN in Code.gs with .env.local.
              </p>
            )}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2
              className="h-8 w-8 animate-spin text-gold"
              aria-label="Loading photos"
            />
          </div>
        ) : galleryItems.length === 0 ? (
          <FadeIn>
            <p className="rounded-xl border border-stone-200 bg-white py-16 text-center text-stone-500">
              No {activeCategory?.label.toLowerCase()} photos yet — be the first
              to add some.
            </p>
          </FadeIn>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 md:gap-4">
            {galleryItems.map((photo, index) => (
              <FadeIn key={photo.key} delay={Math.min(index * 40, 400)}>
                <div className="group relative aspect-square overflow-hidden rounded-xl bg-stone-200">
                  <button
                    type="button"
                    onClick={() => openLightbox(index)}
                    className="h-full w-full"
                    aria-label={`View ${photo.alt}`}
                  >
                    {photo.kind === "drive" ? (
                      <DrivePhoto photo={photo} sizes="grid" />
                    ) : (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={photo.src}
                        alt={photo.alt}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-charcoal/0 transition-colors duration-300 group-hover:bg-charcoal/25">
                      <ZoomIn
                        className="h-7 w-7 scale-75 text-white opacity-0 transition-all duration-300 group-hover:scale-100 group-hover:opacity-100"
                        aria-hidden="true"
                      />
                    </div>
                  </button>
                  {canRemove(photo) && (
                    <button
                      type="button"
                      onClick={() => handleRemove(photo)}
                      className="absolute right-2 top-2 rounded-full bg-charcoal/70 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-charcoal"
                      aria-label={`Remove ${photo.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </FadeIn>
            ))}
          </div>
        )}
      </div>

      {uploadProgress && (
        <div
          className="fixed inset-x-0 bottom-0 z-[60] border-t border-stone-200 bg-ivory/95 px-5 py-4 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] backdrop-blur-md"
          role="status"
          aria-live="polite"
          aria-busy="true"
        >
          <div className="mx-auto max-w-lg">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-charcoal">
                  {uploadPhaseLabel}
                </p>
                <p className="truncate text-xs text-stone-500">
                  Photo {uploadProgress.fileIndex} of {uploadProgress.fileTotal}
                  {" · "}
                  {uploadProgress.fileName}
                </p>
              </div>
              <p className="font-mono text-sm tabular-nums text-gold">
                {uploadProgress.overallPercent}%
              </p>
            </div>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-stone-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-gold to-gold-dark transition-[width] duration-150 ease-out"
                style={{ width: `${uploadProgress.overallPercent}%` }}
              />
            </div>

            <div className="mt-2 flex justify-between text-[10px] uppercase tracking-wider text-stone-400">
              <span>
                {uploadProgress.phase === "reading"
                  ? "This file"
                  : uploadProgress.phase === "uploading"
                    ? "Sending"
                    : "Saving"}
                : {uploadProgress.filePercent}%
              </span>
              <span>
                {uploadProgress.overallPercent >= 100
                  ? "Finishing…"
                  : `${100 - uploadProgress.overallPercent}% left`}
              </span>
            </div>
          </div>
        </div>
      )}

      {lightboxIndex !== null && galleryItems[lightboxIndex] && (
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

          {galleryItems.length > 1 && (
            <>
              <button
                type="button"
                onClick={goPrev}
                className="absolute left-2 z-10 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20 sm:left-4"
                aria-label="Previous photo"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                type="button"
                onClick={goNext}
                className="absolute right-2 z-10 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20 sm:right-4"
                aria-label="Next photo"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          {galleryItems[lightboxIndex].kind === "drive" ? (
            <DrivePhoto
              photo={galleryItems[lightboxIndex]}
              sizes="lightbox"
            />
          ) : (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={
                galleryItems[lightboxIndex].fullSrc ||
                galleryItems[lightboxIndex].src
              }
              alt={galleryItems[lightboxIndex].alt}
              className="max-h-[85vh] max-w-full rounded-lg object-contain shadow-2xl"
            />
          )}

          <p className="absolute bottom-6 left-1/2 max-w-sm -translate-x-1/2 text-center text-sm text-white/80">
            {galleryItems[lightboxIndex].alt}
          </p>
        </div>
      )}
    </section>
  );
}

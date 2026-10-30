"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Heart, Music2, Volume2, VolumeX } from "lucide-react";
import { BACKGROUND_MUSIC } from "@/lib/background-music";
import { WEDDING } from "@/lib/wedding-data";

function pickRandomTrackIndex(length, avoidIndex = -1) {
  if (length <= 0) return 0;
  if (length === 1) return 0;
  let index = Math.floor(Math.random() * length);
  while (index === avoidIndex) {
    index = Math.floor(Math.random() * length);
  }
  return index;
}

function WelcomeGate({ open, onEnter, onDismiss, hasMusic }) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open && !leaving) return null;

  const handleEnter = () => {
    onEnter();
    setLeaving(true);
    window.setTimeout(() => {
      onDismiss();
      setLeaving(false);
    }, 420);
  };

  return (
    <div
      className={`fixed inset-0 z-[200] flex items-center justify-center px-4 transition-opacity duration-500 ease-out ${
        leaving ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-title"
    >
      <div
        className="absolute inset-0 bg-stone-900/30 backdrop-blur-xl backdrop-saturate-125"
        aria-hidden="true"
      />
      <div
        className={`relative w-full max-w-md transition-all duration-500 ease-out ${
          leaving ? "scale-[0.98] opacity-0" : "scale-100 opacity-100"
        }`}
      >
        <div className="absolute -inset-px rounded-[1.75rem] bg-gradient-to-br from-gold/40 via-white/60 to-sage-400/30 opacity-80 blur-sm" />
        <div className="relative overflow-hidden rounded-[1.65rem] border border-white/90 bg-white/95 px-8 py-10 text-center shadow-2xl shadow-stone-900/15 sm:px-10 sm:py-12">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(217,119,6,0.08),transparent_55%)]"
            aria-hidden="true"
          />
          <p className="text-[11px] font-medium uppercase tracking-[0.35em] text-sage-600">
            You&apos;re invited
          </p>
          <h1
            id="welcome-title"
            className="mt-4 font-serif text-3xl leading-tight text-charcoal sm:text-[2rem]"
          >
            Welcome to Our Journey
          </h1>
          <p className="mt-3 font-serif text-xl text-gold sm:text-2xl">
            {WEDDING.coupleDisplay}
          </p>
          <p className="mt-2 text-sm text-stone-500">{WEDDING.dateDisplay}</p>
          <div
            className="mx-auto mt-6 flex w-16 items-center gap-2 text-gold/60"
            aria-hidden="true"
          >
            <span className="h-px flex-1 bg-gradient-to-r from-transparent to-gold/50" />
            <Heart className="h-3.5 w-3.5 fill-gold/20 text-gold" />
            <span className="h-px flex-1 bg-gradient-to-l from-transparent to-gold/50" />
          </div>
          <p className="mt-6 text-sm leading-relaxed text-stone-600">
            Step inside our wedding invitation — celebrate with us, explore the
            details, and share in the joy.
          </p>
          {hasMusic && (
            <p className="mt-3 inline-flex items-center justify-center gap-1.5 text-xs text-stone-400">
              <Music2 className="h-3.5 w-3.5" aria-hidden="true" />
              Soft music will play as you browse
            </p>
          )}
          <button
            type="button"
            onClick={handleEnter}
            className="mt-8 inline-flex min-h-[48px] w-full items-center justify-center rounded-full bg-gold px-8 py-3.5 text-sm font-semibold uppercase tracking-[0.2em] text-white shadow-lg shadow-gold/30 transition-all duration-300 hover:-translate-y-0.5 hover:bg-gold-dark hover:shadow-xl active:scale-[0.98]"
          >
            Open invitation
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SiteExperience() {
  const tracks = useMemo(
    () => BACKGROUND_MUSIC.tracks.filter((t) => t?.src),
    []
  );
  const hasMusic = tracks.length > 0;

  const audioRef = useRef(null);
  const playingRef = useRef(true);
  const resumeWhenVisibleRef = useRef(false);
  const tracksRef = useRef(tracks);
  const trackIndexRef = useRef(0);

  tracksRef.current = tracks;

  const [welcomeOpen, setWelcomeOpen] = useState(true);
  const [enabled, setEnabled] = useState(true);
  const [audible, setAudible] = useState(false);
  const [trackIndex, setTrackIndex] = useState(0);

  useLayoutEffect(() => {
    if (!tracks.length) return;
    const index = pickRandomTrackIndex(tracks.length);
    trackIndexRef.current = index;
    setTrackIndex(index);
  }, [tracks.length]);

  const currentTrack = tracks.length ? tracks[trackIndex] ?? tracks[0] : null;

  useLayoutEffect(() => {
    if (!hasMusic) return;
    try {
      if (localStorage.getItem("wedding-music") === "off") {
        playingRef.current = false;
        setEnabled(false);
        audioRef.current?.pause();
      }
    } catch {
      /* ignore */
    }
  }, [hasMusic]);

  const resolveTrack = useCallback(() => {
    const list = tracksRef.current;
    if (!list.length) return null;
    return list[trackIndexRef.current] ?? list[0];
  }, []);

  const startPlayback = useCallback(() => {
    const audio = audioRef.current;
    const track = resolveTrack();
    if (!audio || !track || !playingRef.current) return false;

    audio.src = track.src;
    audio.muted = false;
    audio.volume = BACKGROUND_MUSIC.volume;

    try {
      const result = audio.play();
      if (result && typeof result.catch === "function") {
        result
          .then(() => setAudible(true))
          .catch(() => setAudible(false));
      } else {
        setAudible(true);
      }
      return true;
    } catch {
      setAudible(false);
      return false;
    }
  }, [resolveTrack]);

  useEffect(() => {
    const track = resolveTrack();
    const audio = audioRef.current;
    if (!audio || !track) return;
    audio.src = track.src;
    audio.preload = "auto";
    audio.load();
  }, [currentTrack, resolveTrack]);

  const handleWelcomeEnter = useCallback(() => {
    if (!hasMusic) return;

    playingRef.current = true;
    setEnabled(true);
    try {
      localStorage.setItem("wedding-music", "on");
    } catch {
      /* ignore */
    }
    startPlayback();
  }, [hasMusic, startPlayback]);

  const dismissWelcome = useCallback(() => {
    setWelcomeOpen(false);
  }, []);

  const pickNextRandomTrack = useCallback(() => {
    const list = tracksRef.current;
    if (!list.length) return;
    const next = pickRandomTrackIndex(list.length, trackIndexRef.current);
    trackIndexRef.current = next;
    setTrackIndex(next);
  }, []);

  const onEnded = useCallback(() => {
    const gap = BACKGROUND_MUSIC.gapMs ?? 0;
    const go = () => {
      if (tracks.length <= 1) {
        startPlayback();
        return;
      }
      pickNextRandomTrack();
    };
    if (gap > 0) window.setTimeout(go, gap);
    else go();
  }, [pickNextRandomTrack, startPlayback, tracks.length]);

  useEffect(() => {
    if (welcomeOpen || !enabled || !hasMusic || !audible) return;
    const audio = audioRef.current;
    const track = resolveTrack();
    if (!audio || !track) return;
    audio.src = track.src;
    audio.load();
    void audio.play().then(() => setAudible(true)).catch(() => setAudible(false));
  }, [audible, currentTrack, enabled, hasMusic, resolveTrack, welcomeOpen]);

  const toggle = useCallback(() => {
    if (!tracks.length) return;

    if (enabled) {
      playingRef.current = false;
      resumeWhenVisibleRef.current = false;
      setAudible(false);
      audioRef.current?.pause();
      setEnabled(false);
      try {
        localStorage.setItem("wedding-music", "off");
      } catch {
        /* ignore */
      }
      return;
    }

    playingRef.current = true;
    setEnabled(true);
    try {
      localStorage.setItem("wedding-music", "on");
    } catch {
      /* ignore */
    }
    startPlayback();
  }, [enabled, startPlayback, tracks.length]);

  useEffect(() => {
    if (!hasMusic) return undefined;

    const pauseForLeave = () => {
      const audio = audioRef.current;
      if (!audio) return;
      audio.pause();
      setAudible(false);
    };

    const onVisibilityChange = () => {
      const audio = audioRef.current;
      if (!audio) return;

      if (document.hidden) {
        if (enabled && playingRef.current && !audio.paused) {
          resumeWhenVisibleRef.current = true;
        } else {
          resumeWhenVisibleRef.current = false;
        }
        pauseForLeave();
        return;
      }

      if (
        resumeWhenVisibleRef.current &&
        enabled &&
        playingRef.current &&
        !welcomeOpen
      ) {
        resumeWhenVisibleRef.current = false;
        void audio
          .play()
          .then(() => setAudible(true))
          .catch(() => setAudible(false));
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("pagehide", pauseForLeave);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pagehide", pauseForLeave);
    };
  }, [enabled, hasMusic, welcomeOpen]);

  return (
    <>
      <WelcomeGate
        open={welcomeOpen}
        onEnter={handleWelcomeEnter}
        onDismiss={dismissWelcome}
        hasMusic={hasMusic}
      />

      {hasMusic && (
        <>
          <audio ref={audioRef} preload="auto" playsInline onEnded={onEnded} />
          {!welcomeOpen && (
            <div
              className="fixed bottom-5 right-5 z-[100] flex flex-col items-end gap-2"
              data-music-control
            >
              {enabled && audible && currentTrack?.title && (
                <p className="max-w-[200px] truncate rounded-full border border-stone-200/80 bg-white/90 px-3 py-1 text-[10px] text-stone-500 shadow-sm backdrop-blur-sm">
                  {currentTrack.title}
                </p>
              )}
              <button
                type="button"
                onClick={toggle}
                className="inline-flex items-center gap-2 rounded-full border border-stone-200/90 bg-white/95 px-4 py-2.5 text-xs font-medium text-stone-600 shadow-lg shadow-stone-900/10 backdrop-blur-sm transition-colors hover:border-gold/30 hover:text-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                aria-pressed={enabled}
                aria-label={
                  enabled
                    ? "Turn off background music"
                    : "Turn on background music"
                }
              >
                {enabled ? (
                  <Volume2
                    className="h-4 w-4 shrink-0 text-gold"
                    aria-hidden="true"
                  />
                ) : (
                  <VolumeX className="h-4 w-4 shrink-0" aria-hidden="true" />
                )}
                <Music2
                  className="h-4 w-4 shrink-0 opacity-70"
                  aria-hidden="true"
                />
                <span>{enabled ? "Music on" : "Music"}</span>
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
}

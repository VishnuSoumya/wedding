import { publicPath } from "@/lib/public-path";

/**
 * Background music — drop MP3 (or M4A) files in public/music/ and list them here.
 */
export const BACKGROUND_MUSIC = {
  /** 0–1; kept low so it stays ambient */
  volume: 0.22,
  /** Ms between tracks (optional pause); 0 = back-to-back */
  gapMs: 800,
  tracks: [
    { src: publicPath("/music/MangalRang.mp3"), title: "Mangal Rang" },
    { src: publicPath("/music/Nange Allava.mp3"), title: "Nange Allava" },
    { src: publicPath("/music/Darasal.mp3"), title: "Darasal" },
  ],
};

import { WEDDING } from "@/lib/wedding-data";

/** Build a Drive photo object for hero / gallery use. */
export function heroDrivePhoto(driveFileId, name = "hero") {
  const alt = `${WEDDING.bride} & ${WEDDING.groom}`;
  return {
    kind: "drive",
    id: driveFileId,
    src: `https://lh3.googleusercontent.com/d/${driveFileId}=w1200-rw`,
    fullSrc: `https://drive.google.com/uc?export=view&id=${driveFileId}`,
    srcFallbacks: [
      `https://lh3.googleusercontent.com/d/${driveFileId}=w1200-rw`,
      `https://drive.google.com/uc?export=view&id=${driveFileId}`,
      `https://drive.google.com/thumbnail?id=${driveFileId}&sz=w1200`,
    ],
    alt,
    name,
  };
}

/**
 * Hero slideshow — add Google Drive file IDs in order (first = opening slide).
 * Share each file as “Anyone with the link can view”, same as the current hero photo.
 */
export const HERO_PHOTO_DRIVE_IDS = [
  "1N2kpfKT9iFduudJFdcjVo_I8Qk5YUE5S",
  "1g91xsfDXV5L8vD6BlEU3ATpZx596ZAMC",
  "16GlzAeiLSD11j14a4qP-oqeV9xL91_Eu",
  "1NG0QOlhc7WU3GiAeIjwZRPdYhRyQ5a2i",
  "1RhNQF-HU-IbZ1aXrBk6q7aVVGzx3btEO",
  "1374ybf4fD1c0x2wsq2HWUrXOEoyha5zd",
  "1Ypb2pSKuuhJ8rVmqTE9NCy09NjegcHkr",
];


export const HERO_PHOTOS = HERO_PHOTO_DRIVE_IDS.map((id, index) =>
  heroDrivePhoto(id, `hero-${index + 1}`)
);

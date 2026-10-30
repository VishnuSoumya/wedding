export const VENUE = {
  name: "Meenakshi Kalyana Mantapa",
  address: "Rajarajeshwari Nagar, Bengaluru, Karnataka, India",
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=Meenakshi+Kalyana+Mantapa+Rajarajeshwari+Nagar+Bengaluru",
};

export const WEDDING = {
  bride: "Soumya",
  groom: "Vishnu",
  groomFullName: "Vishnu J G",
  brideFullName: "Soumya B Hudalimath",
  coupleDisplay: "Soumya & Vishnu",
  groomParents: [ "J. R. Lakshmi", "J. R. Girish"],
  brideParents: ["Jayashree", "Babu"],
  college: "PES University",
  date: "2026-11-26T10:00:00+05:30",
  dateDisplay: "25 & 26 November 2026",
  dateDetail: "Reception · 25 Nov 2026  ·  Wedding · 26 Nov 2026",
  location: VENUE.name,
  locationDetail: VENUE.address,
  hashtag: "#DeployedToForever #ProductionReadyCouple",
  hashtags: ["#DeployedToForever", "#ProductionReadyCouple"],
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://example.com",
  ogImage: `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/og-image.jpg`,
  contact: {
    name: "Vishnu JG",
    phone: ["+91 9900552525", "+91 9448227048"],
    email: "jgvishnu2001@gmail.com",
  },
};

/** @param {string | string[]} phone */
export function contactPhones(phone) {
  if (Array.isArray(phone)) return phone.filter(Boolean);
  return phone ? [phone] : [];
}

/** @param {string} phone */
export function phoneTelHref(phone) {
  return `tel:${phone.replace(/\s/g, "")}`;
}

export const EVENTS = [
  {
    id: "reception",
    title: "Reception",
    date: "25 Nov 2026",
    time: "7:00 PM",
    calendarStart: "2026-11-25T19:00:00+05:30",
    calendarEnd: "2026-11-25T23:00:00+05:30",
    venue: VENUE.name,
    address: VENUE.address,
    mapsUrl: VENUE.mapsUrl,
    icon: "sparkles",
  },
  {
    id: "ceremony",
    title: "Wedding Ceremony",
    date: "26 Nov 2026",
    time: "10:00 AM",
    calendarStart: "2026-11-26T10:00:00+05:30",
    calendarEnd: "2026-11-26T14:00:00+05:30",
    venue: VENUE.name,
    address: VENUE.address,
    mapsUrl: VENUE.mapsUrl,
    icon: "heart",
  },
];

export const STORY = [
  {
    year: "College",
    title: "Where It Began",
    description:
      "Soumya & Vishnu first met at PES University — a meeting that planted the seeds of a bond that would grow in ways neither of them expected at the time.",
  },
  {
    year: "2023",
    title: "Same Office, New Chapter",
    description:
      "Life brought them together again at the same workplace in 2023. Working side by side, they reconnected and grew closer with every passing day.",
  },
  {
    year: "Together",
    title: "From Colleagues to Love",
    description:
      "What started as friendship at work blossomed into love. They chose each other, and haven't looked back since.",
  },
  {
    year: "2026",
    title: "Forever Begins",
    description:
      "On 25 and 26 November 2026, surrounded by family and friends, Soumya & Vishnu begin the rest of their lives together.",
  },
];

// Replace with your own photos when ready
export const GALLERY = [
  {
    src: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80",
    alt: "Photo placeholder — replace with your image",
  },
  {
    src: "https://images.unsplash.com/photo-1522673607860-1d4837531e1?w=800&q=80",
    alt: "Photo placeholder — replace with your image",
  },
  {
    src: "https://images.unsplash.com/photo-1465495976277-5937a47716da?w=800&q=80",
    alt: "Photo placeholder — replace with your image",
  },
  {
    src: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80",
    alt: "Photo placeholder — replace with your image",
  },
  {
    src: "https://images.unsplash.com/photo-1520854221256-17451ed9affb?w=800&q=80",
    alt: "Photo placeholder — replace with your image",
  },
  {
    src: "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800&q=80",
    alt: "Photo placeholder — replace with your image",
  },
];

/** Static album images — add files under public/photos/{category}/ */
export const DRIVE_PHOTO_ROOT_ID = "1MSIkWzFYz_0wSVHLIcdMtbTdzUzRmwhK";

export const PHOTO_DUMP_CATEGORIES = [
  {
    id: "engagement",
    label: "Engagement",
    description: "Pre-wedding moments and the engagement celebration.",
    driveFolderId: "1yasmD_7z4m7MOJQfD9LbIQScwdwyZ8sk",
  },
  {
    id: "reception",
    label: "Reception",
    description: "Photos from the reception on 25 November 2026.",
    driveFolderId: "1x_LDMWZqtHsaaWzLHcRkBz2TRGFn4RHU",
  },
  {
    id: "wedding",
    label: "Wedding",
    description: "Ceremony and wedding day memories from 26 November 2026.",
    driveFolderId: "1_nEBuLF4B7k6LyOyUTUcvQepjPI8gGJZ",
  },
];

export const PHOTO_ALBUMS = {
  engagement: [],
  reception: [],
  wedding: [],
};

export const TRAVEL = {
  airport: {
    name: "Kempegowda International Airport (BLR)",
    note: "Approx. 45–60 min to Rajarajeshwari Nagar depending on traffic. Uber, Ola, and prepaid taxis are available at the airport.",
  },
  train: {
    name: "KSR Bengaluru City Railway Station",
    note: "Well connected to major cities. Cab services and Namma Metro are available from the station.",
  },
  local: {
    name: "Getting to the Venue",
    note: `Both the reception and wedding will be held at ${VENUE.name}, ${VENUE.address}. Parking will be available at the venue.`,
  },
};

import { Inter, JetBrains_Mono, Playfair_Display } from "next/font/google";
import SiteExperience from "@/components/SiteExperience";
import { WEDDING } from "@/lib/wedding-data";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = WEDDING.siteUrl;
const title = `${WEDDING.coupleDisplay} | Wedding Invitation`;
const description = `Join ${WEDDING.coupleDisplay} for their wedding on ${WEDDING.dateDetail} at ${WEDDING.location}, Bengaluru.`;

export const metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  keywords: [
    "wedding invitation",
    WEDDING.bride,
    WEDDING.groom,
    "Bengaluru wedding",
    "RSVP",
  ],
  authors: [{ name: WEDDING.coupleDisplay }],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    siteName: `${WEDDING.coupleDisplay} Wedding`,
    title,
    description,
    images: [
      {
        url: WEDDING.ogImage,
        width: 1200,
        height: 630,
        alt: `${WEDDING.coupleDisplay} Wedding Invitation`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [WEDDING.ogImage],
  },
  robots: {
    index: true,
    follow: true,
  },
  other: {
    "theme-color": "#FAFAF9",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} ${jetbrainsMono.variable} h-full`}
    >
      <body className="min-h-full antialiased">
        {children}
        <SiteExperience />
      </body>
    </html>
  );
}

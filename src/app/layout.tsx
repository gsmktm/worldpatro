import type { Metadata } from "next";
import "./globals.css";
import "./styles/wbe-studio.css";
import "./styles/patro-studio.css";
import "./styles/numerology-studio.css";
import "./styles/kundli-studio.css";

export const metadata: Metadata = {
  title: { default:"World Patro", template:"%s · World Patro" },
  description:"Global Calendar, Astrology, Sacred Time & World Intelligence OS — Nepal to the world."
};

export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="en"><body>{children}</body></html>;
}

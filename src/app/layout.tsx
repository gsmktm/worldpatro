import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default:"World Patro", template:"%s · World Patro" },
  description:"Global Calendar, Astrology, Sacred Time & World Intelligence OS — Nepal to the world."
};

export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="en"><body>{children}</body></html>;
}

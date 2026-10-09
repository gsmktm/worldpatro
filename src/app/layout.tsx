import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "World Patro · Global Calendar & World Balance OS",
  description: "Nine calendars, sacred time, world intelligence and the WBE-9 symbolic balance framework."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

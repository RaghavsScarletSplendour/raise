import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RAISE — raise your hand",
  description:
    "A real lecture plays. Raise your hand. The professor climbs out of the paused frame. Unofficial study avatar. Public lecture, public captions only.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

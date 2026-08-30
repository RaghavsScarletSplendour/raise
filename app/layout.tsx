import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RAISE — raise your hand",
  description:
    "Shuffle a concept. Lock it. A snippet, or the real lecture starts playing. Unofficial study avatar. Public captions only.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Grotesk:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}

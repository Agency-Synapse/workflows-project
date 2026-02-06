import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Workflows",
  description: "Collecte de leads et téléchargement de workflows."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}


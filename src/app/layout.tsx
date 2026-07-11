import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Client Gallery Pro",
  description: "Client Gallery & Proofing Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}

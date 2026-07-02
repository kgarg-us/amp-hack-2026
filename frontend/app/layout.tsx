import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AMP Hack GPT Console",
  description: "Server-rendered React frontend for the AMP Hack API",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

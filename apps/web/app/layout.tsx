import type { Metadata } from "next";
import localFont from "next/font/local";

import "@repo/ui/globals.css";
import RootProvider from "~/providers";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  preload: true,
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  preload: true,
});

export const metadata: Metadata = {
  title: "Monorepo Auth Starter",
  description:
    "Authenticate into the monorepo starter using our secure, modern login experience.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.className} ${geistMono.className} font-sans bg-background text-foreground antialiased`}
      >
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}

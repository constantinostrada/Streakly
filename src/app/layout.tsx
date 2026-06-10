/**
 * Root layout — applied to every page in the application.
 * Sets global metadata, font, and base styles.
 */

import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Habit Tracker",
  description: "Build better habits, one day at a time.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.JSX.Element {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

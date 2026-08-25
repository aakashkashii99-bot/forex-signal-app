import "./globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "Confluence Signals",
  description: "MMR-based forex & gold signal dashboard"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

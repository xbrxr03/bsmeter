import type { Metadata } from "next";
import "../web/styles/globals.css";

export const metadata: Metadata = {
  title: "BS Meter — Information Quality Scorer",
  description: "Not whether it's AI — whether it's worth reading.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-gray-950 text-gray-100 min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}

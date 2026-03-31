import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import LayoutWrapper from "@/components/LayoutWrapper";
import { Toaster } from "sonner";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "Student Management System",
  description: "Modern School Management System for students, teachers, and administration.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${outfit.variable} font-sans antialiased`}
      >
        <LayoutWrapper>
          {children}
        </LayoutWrapper>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}

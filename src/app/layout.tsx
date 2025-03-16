"use client"
import "./globals.css";
import Navbar from "@/components/Navbar";
import { useState } from "react";


export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [isHovered, setIsHovered] = useState(false); // <-- Added missing state

  return (
    <html lang="en">
      <body className="flex">
        {/* Sidebar Navbar with Hover Effect */}
        <Navbar onHover={(expanded) => setIsHovered(expanded)} />

        {/* Main Content Area Adjusts Based on Sidebar Expansion */}
        <main
          className={`flex-1 transition-all duration-300 ${
            isHovered ? "ml-48" : "ml-14"
          }`}
        >
          {children}
        </main>
      </body>
    </html>
  );
}

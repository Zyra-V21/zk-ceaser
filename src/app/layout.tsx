import type { Metadata } from "next";
import "./globals.css";
import { StarknetProvider } from "@/providers/StarknetProvider";

export const metadata: Metadata = {
  title: "CEASER - Privacy Mixing Protocol",
  description: "Advanced privacy-preserving STRK mixing system on Starknet with maximum unlinkability",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased bg-[#0A0A0A] text-white min-h-screen">
        <StarknetProvider>
          {children}
        </StarknetProvider>
      </body>
    </html>
  );
}

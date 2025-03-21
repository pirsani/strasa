import type { Metadata } from "next";
// import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

// const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "STRASA",
  description: "STRASA",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* <body className={inter.className}> */}
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}

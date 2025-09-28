// app/layout.jsx

import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import Providers from "./providers";


const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "POS Application",
  description: "Point of Sale Application",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
        {children}
        <Toaster position="top-right" richColors /> {/* Add the Toaster here */}
        </Providers>
      </body>
    </html>
  );
}
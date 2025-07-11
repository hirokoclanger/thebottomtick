import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from '../contexts/AuthContext';
import Navigation from './components/Navigation';

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "The Bottom Tick",
  description: "Financial analytics and investment insights",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-white text-gray-900`}>
        <AuthProvider>
          <header className="w-full border-b border-gray-200 bg-gray-800 px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-md">
            <div className="flex items-center gap-3">
               <span className="text-2xl font-bold tracking-tight text-[#f7c325] select-none"><a href="/"> TBT</a></span>
              <span className="text-xs font-mono bg-gray-700 text-[#f7c325] px-2 py-1 rounded">LIVE</span>
            </div>
            <Navigation />
          </header>
          <main className="w-full">
            {children}
          </main>
          <footer className="w-full border-t border-gray-200 bg-gray-100 px-6 py-4 text-center text-xs text-gray-600 mt-12">
            &copy; {new Date().getFullYear()} The Bottom Tick. Not affiliated with Bloomberg or Apple.
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}

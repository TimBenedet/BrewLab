
import type { Metadata } from 'next';
import { Bebas_Neue, Inter } from 'next/font/google';
// import localFont from 'next/font/local';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Toaster } from "@/components/ui/toaster";
import { FooterDate } from '@/components/layout/FooterDate';

// Configure Inter as a fallback for Geist Sans
// const geistSans = Inter({ // Changed from localFont
//   subsets: ['latin'],
//   variable: '--font-geist-sans', // Kept the same CSS variable name
//   display: 'swap',
// });

// Assuming you have Geist Sans font files in src/fonts/
// If not, you'll need to download them from geist-sans.com
// and place them, for example, in src/fonts/
// For now, using Inter assigned to --font-geist-sans to avoid build errors
const geistSans = Inter({
  subsets: ['latin'],
  variable: '--font-geist-sans', // Use the same CSS variable
  display: 'swap',
});


const bebas_neue = Bebas_Neue({
  variable: '--font-bebas-neue',
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'BrewCrafter - Recipe Management',
  description: 'Visualize and manage your beer recipes.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${bebas_neue.variable} font-sans`}>
      <body className="antialiased min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          {children}
        </main>
        <Toaster />
        <footer className="bg-muted text-muted-foreground py-4 text-center text-sm">
          <p>&copy; <FooterDate /> TimBénédet. Brewed with passion.</p>
        </footer>
      </body>
    </html>
  );
}

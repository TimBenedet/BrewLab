import type { Metadata } from 'next';
import { Geist_Sans } from 'next/font/google';
import { Geist_Mono } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist_Sans({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'BeerSmith Recipe Viewer',
  description: 'View and manage your BeerSmith XML recipes.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="antialiased min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          {children}
        </main>
        <Toaster />
        <footer className="bg-muted text-muted-foreground py-4 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} BeerSmith Viewer. Brewed with passion.</p>
        </footer>
      </body>
    </html>
  );
}

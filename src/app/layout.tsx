
import type { Metadata } from 'next';
import { Inter, Roboto_Mono } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Toaster } from "@/components/ui/toaster";
import { FooterDate } from '@/components/layout/FooterDate'; // Import the new component

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
  display: 'swap',
});

const roboto_mono = Roboto_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  display: 'swap',
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
    <html lang="en" className={`${inter.variable} ${roboto_mono.variable}`}>
      <body className="antialiased min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          {children}
        </main>
        <Toaster />
        <footer className="bg-muted text-muted-foreground py-4 text-center text-sm">
          <p>&copy; <FooterDate /> BeerSmith Viewer. Brewed with passion.</p>
        </footer>
      </body>
    </html>
  );
}

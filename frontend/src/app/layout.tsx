import type { Metadata } from "next";
import { Poppins, Open_Sans, Montserrat } from "next/font/google";
import "./globals.css";
import { AuthProvider, NotificationProvider, ThemeProvider, SocketProvider } from '@/context';
import { HeroUIProvider } from '@heroui/react';

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Matcha - Find Your Perfect Match",
  description: "Connect with like-minded people and find your perfect match on Matcha, the modern dating app.",
  keywords: "dating, match, relationship, love, connect",
  icons: {
    icon: "/logo/logoSmall.svg",
    shortcut: "/logo/logoSmall.svg",
    apple: "/logo/logoSmall.svg",
  },
  openGraph: {
    title: "Matcha - Find Your Perfect Match",
    description: "Connect with like-minded people and find your perfect match",
    type: "website",
    images: ["/logo/logoAbig.svg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${poppins.variable} ${openSans.variable} ${montserrat.variable}`}>
      <body className="font-body bg-cream text-secondary-800 antialiased">
        <HeroUIProvider>
          <ThemeProvider>
            <AuthProvider>
              <SocketProvider>
                <NotificationProvider>
                  {children}
                </NotificationProvider>
              </SocketProvider>
            </AuthProvider>
          </ThemeProvider>
        </HeroUIProvider>
      </body>
    </html>
  );
}

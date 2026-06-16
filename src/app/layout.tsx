import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/app/context/AppContext";
import Sidebar from "@/components/Sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "5estrelles - Auto Review AI Dashboard",
  description: "Dashboard d'automatisation IA pour répondre aux avis Google Business Profile",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground flex flex-row w-full overflow-x-hidden">
        <AppProvider>
          <Sidebar />
          <main className="flex-1 flex flex-col min-h-screen min-w-0 bg-background overflow-y-auto">
            {children}
          </main>
        </AppProvider>
      </body>
    </html>
  );
}

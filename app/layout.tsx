import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./tailwind.css";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kanban - Gerencie suas tarefas",
  description: "Um aplicativo de quadro Kanban moderno e responsivo, desenvolvido com Next.js e TypeScript.",
  icons: {
    icon: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full scroll-smooth antialiased`}
    >
      <body className="min-h-full bg-slate-50 font-sans text-slate-950 selection:bg-sky-200 selection:text-sky-950">
        {children}
        <Toaster richColors position="top-right"/>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Header from "./components/layout/Header";
import "./globals.css";
import Footer from "./components/layout/Footer";
import WateringReminderScheduler from "./components/account/WateringReminderScheduler";
import plants from "@/app/plants.json";

const inter = Inter({
  variable: "--font-inter-sans",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: "GreenHome",
  description: "Каталог комнатных растений.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ru" className={`h-full antialiased`}>
      <body className={`${inter.className} min-h-screen flex flex-col bg-[#F7F8F2]`}>
        <Header />
        <WateringReminderScheduler plants={plants} />
        {children}
        <Footer />
      </body>
    </html>
  );
}

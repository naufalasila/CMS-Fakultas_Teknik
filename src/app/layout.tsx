import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import ThemeSync from "@/components/ThemeSync";
import { themeInitScript } from "@/lib/theme";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TV Fakultas Teknik Unismuh Makassar",
  description: "Layar informasi Fakultas Teknik Universitas Muhammadiyah Makassar",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${jakarta.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full">
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <ThemeSync />
        {children}
      </body>
    </html>
  );
}

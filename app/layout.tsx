import type { Metadata, Viewport } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import TabBar from "@/components/layout/TabBar";
import Shell from "@/components/layout/Shell";
import SessionSync from "@/components/layout/SessionSync";
import LocaleDom from "@/components/layout/LocaleDom";
import TelegramMiniApp from "@/components/layout/TelegramMiniApp";
import { THEME_INIT_SCRIPT } from "@/lib/ui/theme";

const docFont = Source_Serif_4({ variable: "--font-doc", subsets: ["latin", "latin-ext"] });

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  title: "LexPraktika",
  description: "Yuridik amaliyot trenajyori: real vaziyatni bosqichma-bosqich o'ting",
  icons: { apple: "/icons/apple-180.png" },
  appleWebApp: { capable: true, title: "LexPraktika", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#e9eefb" },
    { media: "(prefers-color-scheme: dark)", color: "#111318" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="uz" className={`${inter.variable} ${docFont.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <script src="https://telegram.org/js/telegram-web-app.js" async />
      </head>
      <body>
        <div className="mesh-bg" aria-hidden="true" />
        <Shell>{children}</Shell>
        <SessionSync />
        <TelegramMiniApp />
        <LocaleDom />
        <TabBar />
      </body>
    </html>
  );
}

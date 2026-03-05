import type { Metadata } from "next";
import Script from "next/script";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const GA_ID = "G-YEXNSJ32KQ";

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://casinohub.jp"),
  title: {
    default: "Casinohub | アミューズメントカジノ向けトーナメント管理SaaS",
    template: "%s | Casinohub",
  },
  description:
    "アミューズメントカジノのトーナメント運営をもっとスマートに。参加者登録・テーブル割当・順位集計・賞金配分をクラウドで一元管理。",
  openGraph: {
    siteName: "Casinohub",
    locale: "ja_JP",
    type: "website",
    url: "https://casinohub.jp",
  },
  twitter: {
    card: "summary",
    title: "Casinohub | アミューズメントカジノ向けトーナメント管理SaaS",
    description:
      "アミューズメントカジノのトーナメント運営をもっとスマートに。参加者登録・テーブル割当・順位集計・賞金配分をクラウドで一元管理。",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="ga" strategy="afterInteractive">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`}
        </Script>
      </head>
      <body className={`${notoSansJP.className} antialiased`}>
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

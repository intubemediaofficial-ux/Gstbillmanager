import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "GST Bill Manager — Free Invoice, Billing & Business Management Software for India",
    template: "%s | GST Bill Manager",
  },
  description: "Free GST invoice maker, billing software, barcode scanner, digital business card, daily cash book, party ledger, inventory management, GSTR reports, 13 languages, PDF/Word export, WhatsApp share — complete business solution for Indian businesses.",
  keywords: [
    "GST bill maker", "GST invoice generator", "free billing software India", "GST bill banaye",
    "invoice maker online", "GST billing app", "barcode scanner billing", "digital visiting card",
    "daily cash book", "party ledger app", "udhar khata app", "inventory management free",
    "GSTR report generator", "e-way bill generator", "credit note debit note",
    "quotation maker", "purchase bill", "POS receipt printer", "thermal printer billing",
    "WhatsApp invoice share", "PDF invoice download", "Word invoice export",
    "Hindi billing software", "multi language billing app", "small business billing India",
    "dukan ka bill", "GST bill kaise banaye", "free invoice generator India",
    "business card maker", "roznamcha", "cash book app",
  ],
  manifest: "/manifest.json",
  metadataBase: new URL("https://gstbillmanager.com"),
  alternates: {
    canonical: "https://gstbillmanager.com",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://gstbillmanager.com",
    siteName: "GST Bill Manager",
    title: "GST Bill Manager — Free Invoice & Billing Software for India",
    description: "Create GST invoices, manage inventory, track expenses, generate GSTR reports, scan barcodes, make business cards — 40+ features, 13 languages, completely free!",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "GST Bill Manager — Free Billing Software for India",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GST Bill Manager — Free Invoice & Billing Software for India",
    description: "Create GST invoices, manage inventory, track expenses, generate GSTR reports — 40+ features, 13 languages, free!",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "oA1rk1Qle7KbrTvO9VBn6uOTrTbHGxvXb3QKOK_sNxo",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "GST Bill Manager",
  },
  category: "Business",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#4f46e5",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <script dangerouslySetInnerHTML={{ __html: `if('serviceWorker' in navigator){window.addEventListener('load',()=>{navigator.serviceWorker.register('/sw.js')})}` }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "GST Bill Manager",
              url: "https://gstbillmanager.com",
              applicationCategory: "BusinessApplication",
              operatingSystem: "Web, Android, iOS",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "INR",
              },
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: "4.8",
                ratingCount: "150",
              },
              description:
                "Free GST invoice maker, billing software, barcode scanner, digital business card, daily cash book, party ledger, inventory management, GSTR reports — complete business solution for India.",
              featureList:
                "GST Invoice, Credit Note, Debit Note, Quotation, Purchase Bill, Barcode Scanner, Digital Business Card, Daily Cash Book, Income vs Expense Chart, Party Ledger, Inventory Management, GSTR Reports, E-Way Bill, POS Receipt, 13 Languages, PDF Download, Word Export, WhatsApp Share, Payment Reminders, Recurring Invoices",
              screenshot: "https://gstbillmanager.com/og-image.png",
              author: {
                "@type": "Organization",
                name: "GST Bill Manager",
                url: "https://gstbillmanager.com",
              },
            }),
          }}
        />
      </body>
    </html>
  );
}

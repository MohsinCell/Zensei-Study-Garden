import type { Metadata } from "next";
import "./globals.css";
import SessionProvider from "@/components/providers/SessionProvider";
import AppShell from "@/components/layout/AppShell";

const BASE_URL = "https://zensei.study";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Zensei",
    template: "%s | Zensei",
  },
  description:
    "Level up your knowledge. Explore any topic and get explanations built for how you think. Earn XP, unlock ranks, and grow from Seed to Elder Tree.",
  keywords: [
    "learning",
    "study",
    "AI tutor",
    "personalized learning",
    "gamified education",
    "explanations",
    "study tool",
  ],
  authors: [{ name: "Mohsin Belam" }],
  creator: "Mohsin Belam",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE_URL,
    siteName: "Zensei",
    title: "Zensei",
    description:
      "Level up your knowledge. Explore any topic and get explanations built for how you think.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Zensei",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Zensei",
    description:
      "Level up your knowledge. Explore any topic and get explanations built for how you think.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/zensei-logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#131210" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Zensei",
              url: "https://zensei.study",
              description:
                "Level up your knowledge. Explore any topic and get explanations built for how you think.",
              applicationCategory: "EducationalApplication",
              operatingSystem: "Web",
              author: {
                "@type": "Person",
                name: "Mohsin Belam",
              },
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
            }),
          }}
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@400;500;600;700&family=Silkscreen&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var m=window.matchMedia("(max-width:767px)").matches;var c=localStorage.getItem("zensei-sidebar-collapsed")==="1";document.documentElement.style.setProperty("--sidebar-width",m?"0px":c?"72px":"272px")}catch(e){}})()`,
          }}
        />
        <SessionProvider>
          <AppShell>{children}</AppShell>
        </SessionProvider>
      </body>
    </html>
  );
}
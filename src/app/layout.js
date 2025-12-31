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

// 🔥 SEO + SOCIAL SHARE METADATA
export const metadata = {
  title: {
    default: "Tic Tac Toe Online – Play AI & 2 Player Free",
    template: "%s | Tic Tac Toe Online",
  },
  description:
    "Play Tic Tac Toe online for free. Challenge AI in Easy or Hard mode or play 2 Player Tic Tac Toe. Fast, modern, mobile-friendly browser game.",
  keywords: [
    "tic tac toe",
    "tic tac toe online",
    "tic tac toe ai",
    "tic tac toe 2 player",
    "play tic tac toe free",
    "browser games",
    "online board games",
  ],
  authors: [{ name: "Chokwala Kishan" }],
  creator: "Chokwala Kishan",

  metadataBase: new URL("https://aigames-xi.vercel.app/"),

  openGraph: {
    title: "Tic Tac Toe Online – AI & 2 Player Game",
    description:
      "Play Tic Tac Toe online for free. Choose AI difficulty or play with a friend. No signup required.",
    url: "https://aigames-xi.vercel.app/",
    siteName: "Tic Tac Toe Online",
    images: [
      {
        url: "/og-image.jpg", // 👉 add this image
        width: 1200,
        height: 630,
        alt: "Tic Tac Toe Online Game",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Tic Tac Toe Online – Play Free",
    description:
      "Play Tic Tac Toe online with AI or 2 Player mode. Fast, modern, and free.",
    images: ["/og-image.jpg"],
  },

  icons: {
    icon: "/favicon.png",
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}

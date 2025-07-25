import type { Metadata } from "next";
import "./globals.css";
import { spaceMono, ibmPlexMono, lexendDeca } from "./fonts";
import { MagneticProvider } from "@/context/MagneticContext";
import { HardwareCapabilityProvider } from "@/context/HardwareCapabilityContext";
import { ViewportHeightFix } from "@/components/viewport-fix";

export const metadata: Metadata = {
  title: "Noah Paige | Portfolio",
  description:
    "Software engineer and game developer specializing in AI, Unity, and full-stack development. View my projects and research.",
  keywords: [
    "web developer",
    "game developer",
    "react",
    "vue",
    "Unity",
    "AI",
    "full-stack",
    "portfolio",
  ],
  authors: [{ name: "Noah Paige" }],
  creator: "Noah Paige",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://TODO.com",
    title: "Noah Paige | Portfolio",
    description:
      "Web developer and game developer specializing in web frameworks (react, vue), AI, Unity, and full-stack development.",
    siteName: "Noah Paige Portfolio",
  },
  twitter: {
    card: "summary_large_image",
    title: "Noah Paige | Portfolio",
    description:
      "Web developer and game developer specializing in web frameworks (react, vue), AI, Unity, and full-stack development.",
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
      className={` ${spaceMono.className} ${ibmPlexMono.className} ${lexendDeca.className}`}
    >
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Doto:wght@100..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased font-lexend-deca overflow-hidden isolate">
        <ViewportHeightFix />
        <HardwareCapabilityProvider>
          <MagneticProvider>{children}</MagneticProvider>
        </HardwareCapabilityProvider>
      </body>
    </html>
  );
}

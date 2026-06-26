import { PortalShell } from "@/components/PortalShell";
import { AuthProvider } from "@/components/AuthProvider";
import { BridgeAnalytics } from "@/components/BridgeAnalytics";
import { LanguageProvider } from "@/components/LanguageProvider";
import { TessAssistantBubble } from "@/components/tess/TessAssistantBubble";
import { SupportPathwayProvider } from "@/components/SupportPathwayProvider";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:4000";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#6366f1",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Bridge — Support. Grow. Thrive.",
    template: "%s | Bridge",
  },
  description:
    "Bridge connects people, families, clinicians, schools, veteran organizations, and support teams with practical tools for everyday life between appointments.",
  openGraph: {
    siteName: "Bridge",
    type: "website",
    url: "/",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <LanguageProvider>
          <AuthProvider>
            <SupportPathwayProvider>
              <PortalShell>{children}</PortalShell>
              <Suspense fallback={null}>
                <BridgeAnalytics />
              </Suspense>
              <TessAssistantBubble />
            </SupportPathwayProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}

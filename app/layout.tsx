// _______________This Code was generated using GenAI tool : Codify, Please check for accuracy_______________
import type { Metadata, Viewport } from "next";
import { getLocale } from "@/lib/i18n";
import "./globals.css";

export const metadata: Metadata = {
  title: "My RESC Athletics",
  description: "RESC athletics companion",
  robots: { index: false, follow: false },
  icons: { icon: "/icons/resc-logo.png", apple: "/icons/resc-logo.png" },
  appleWebApp: { capable: true, title: "My RESC Athletics", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0a3d91" },
    { media: "(prefers-color-scheme: dark)", color: "#07122b" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  return (
    <html lang={locale}>
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
// __________________________GenAI: Generated code ends here______________________________

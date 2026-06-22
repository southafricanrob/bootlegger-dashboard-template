import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { APP_NAME } from "@/lib/config";

export const metadata: Metadata = {
  title: APP_NAME,
  description: `${APP_NAME} — internal dashboard`,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground min-h-screen font-sans antialiased">
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}

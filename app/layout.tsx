import type { Metadata } from "next";
import "./globals.css";
import { SupabaseProvider } from "@/components/providers";
import { AuthButton } from "@/components/AuthButton";
import { Logo } from "@/components/Logo";

export const metadata: Metadata = {
  title: "Pachangas - Gestor de Partidos de Fútbol",
  description: "Organiza y apunta a partidos de fútbol con amigos",
  icons: "/favicon.svg",
  metadataBase: new URL("https://pachangas.top"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <SupabaseProvider>
          <header className="sticky top-0 z-50 flex items-center justify-between border-b border-zinc-800 bg-zinc-950/80 px-4 py-3 backdrop-blur md:px-8">
            <Logo className="h-9 w-auto" />
            <AuthButton />
          </header>
          <div className="mx-auto max-w-5xl px-4 py-6 md:px-8 md:py-8">
            <main>{children}</main>
          </div>
        </SupabaseProvider>
      </body>
    </html>
  );
}
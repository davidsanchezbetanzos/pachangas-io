import type { Metadata } from "next";
import "./globals.css";
import { SupabaseProvider } from "@/components/providers";
import { AuthButton } from "@/components/AuthButton";
import { Logo } from "@/components/Logo";

export const metadata: Metadata = {
  title: "Pachangas - Gestor de Partidos de Fútbol",
  description: "Organiza y apunta a partidos de fútbol con amigos",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <body className="min-h-screen bg-background font-sans text-card-foreground antialiased">
        <SupabaseProvider>
          <div className="mx-auto max-w-md px-4 py-6">
            <header className="mb-6 flex items-center justify-between">
              <Logo />
              <AuthButton />
            </header>
            <main>{children}</main>
          </div>
        </SupabaseProvider>
      </body>
    </html>
  );
}
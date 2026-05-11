import type { Metadata } from "next";
import "./globals.css";
import { SupabaseProvider } from "@/components/providers";

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
    <html lang="es">
      <body className="min-h-screen bg-[#fafafa] font-sans text-[#0a0a0a] antialiased">
        <SupabaseProvider>
          <div className="mx-auto max-w-md px-4 py-6">
            <header className="mb-6 flex items-center justify-between">
              <h1 className="text-2xl font-bold text-[#25d366]">⚽ Pachangas</h1>
            </header>
            <main>{children}</main>
          </div>
        </SupabaseProvider>
      </body>
    </html>
  );
}
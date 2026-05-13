"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/components/providers";

export default function AuthCallbackPage() {
  const router = useRouter();
  const { supabase } = useSupabase();
  const [status, setStatus] = useState("Verificando...");

  useEffect(() => {
const handleAuth = async () => {
    if (!supabase) {
      setStatus("Error: Supabase no cargado");
      return;
    }
    try {
      const { error } = await supabase.auth.getSession();
        if (error) {
          setStatus("Error: " + error.message);
          return;
        }
        setStatus("¡Login exitoso! Redirigiendo...");
        router.push("/");
      } catch (e) {
        setStatus("Error inesperado");
      }
    };

    handleAuth();
  }, [supabase, router]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center">
      <div className="mb-4 text-4xl">🔄</div>
      <p className="text-lg text-[#a1a1aa]">{status}</p>
    </div>
  );
}
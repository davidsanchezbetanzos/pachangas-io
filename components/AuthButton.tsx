"use client";

import { useEffect, useState } from "react";
import { useSupabase } from "@/components/providers";
import { Button } from "@/components/ui/button";

export function AuthButton() {
  const { user, signInWithGoogle, signOut, loading } = useSupabase();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-24 h-9 bg-zinc-200 animate-pulse rounded-md" />;
  }

  if (loading) {
    return (
      <Button variant="ghost" size="sm" disabled>
        ...
      </Button>
    );
  }

  if (user) {
    const name = user.user_metadata?.full_name || user.email || "Usuario";
    const avatar = user.user_metadata?.avatar_url;

    return (
      <div className="flex items-center gap-2">
        {avatar ? (
          <img
            src={avatar}
            alt={name}
            className="h-6 w-6 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#25d366] text-xs font-medium text-white">
            {name.charAt(0).toUpperCase()}
          </div>
        )}
        <span className="max-w-[100px] truncate text-sm">{name}</span>
        <Button onClick={signOut} variant="ghost" size="sm">
          Salir
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-[#737373]">👤 Anónimo</span>
      <Button onClick={signInWithGoogle} variant="outline" size="sm">
        🔵 Login con Google
      </Button>
    </div>
  );
}
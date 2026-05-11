"use client";

import { useSupabase } from "@/components/providers";
import { Button } from "@/components/ui/button";
import { getAnonymousName } from "@/lib/utils";

export function AuthButton() {
  const { user, signInWithGoogle, signOut, loading } = useSupabase();

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

  // Anonymous user
  const anonName = getAnonymousName() || "Anónimo";

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-[#737373]">👤 {anonName}</span>
      <Button onClick={signInWithGoogle} variant="outline" size="sm">
        🔵 Login con Google
      </Button>
    </div>
  );
}
"use client";

import { useSupabase } from "@/components/providers";
import { Button } from "@/components/ui/button";

export function AuthButton() {
  const { user, signInWithGoogle, signOut } = useSupabase();

  if (user) {
    return (
      <Button onClick={signOut} variant="ghost" size="sm">
        Salir
      </Button>
    );
  }

  return (
    <Button onClick={signInWithGoogle} variant="outline" size="sm">
      🎮 Login Google
    </Button>
  );
}
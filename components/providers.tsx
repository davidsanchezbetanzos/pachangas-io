"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { createBrowserClient } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";

interface SupabaseContextType {
  supabase: ReturnType<typeof createBrowserClient> | null;
  user: User | null;
  userId: string;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInAnonymous: () => Promise<void>;
  signOut: () => Promise<void>;
}

const SupabaseContext = createContext<SupabaseContextType>({
  supabase: null,
  user: null,
  userId: "",
  loading: true,
  signInWithGoogle: async () => {},
  signInAnonymous: async () => {},
  signOut: async () => {},
});

export function useSupabase() {
  return useContext(SupabaseContext);
}

interface SupabaseProviderProps {
  children: ReactNode;
}

function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.error("Missing Supabase env vars");
    return null;
  }
  return createBrowserClient(url, key);
}

export function SupabaseProvider({ children }: SupabaseProviderProps) {
  const [supabase] = useState(() => getClient());
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState("");
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    const initAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          setUserId(session.user.id);
        } else {
          let anonId = localStorage.getItem("pachanga_anonymous_id") || "";
          if (!anonId) {
            anonId = crypto.randomUUID();
            localStorage.setItem("pachanga_anonymous_id", anonId);
          }
          setUserId(anonId);
        }
      } catch (e) {
        console.error("Auth init error:", e);
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!initialized) return;
      
      if (event === "SIGNED_OUT" || event === "SIGNED_IN") {
        setUser(session?.user ?? null);
        if (session?.user) {
          setUserId(session.user.id);
          localStorage.setItem("pachanga_anonymous_id", session.user.id);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, initialized]);

const signInWithGoogle = async () => {
    if (!supabase) return;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          prompt: "select_account",
          access_type: "offline",
        },
      },
    });
  };

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    localStorage.removeItem("pachanga_anonymous_id");
  };

  const signInAnonymous = async () => {
    if (!supabase) return;
    const { error } = await supabase.auth.signInAnonymously();
    if (error) {
      console.error("Error signing in anonymously:", error);
    }
  };

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  };

  return (
    <SupabaseContext.Provider
      value={{
        supabase,
        user,
        userId,
        loading,
        signInWithGoogle,
        signInAnonymous,
        signOut,
      }}
    >
      {children}
    </SupabaseContext.Provider>
  );
}
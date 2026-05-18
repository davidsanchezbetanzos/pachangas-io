import React from "react";
import { Github, Globe, Heart } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="mt-auto w-full border-t border-zinc-900 bg-zinc-950 py-6 text-zinc-500">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-4 text-sm sm:flex-row md:px-8">
        <div className="flex items-center gap-1.5 text-center sm:text-left">
          <span>&copy; {new Date().getFullYear()} Pachangas.top</span>
          <span className="hidden sm:inline text-zinc-700">|</span>
          <span className="flex items-center gap-1">
            Desarrollado con{" "}
            <Heart className="h-3.5 w-3.5 fill-emerald-500 text-emerald-500 animate-pulse" />{" "}
            por{" "}
            <a
              href="https://github.com/davidsanchezbetanzos"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-zinc-300 underline underline-offset-4 transition-colors hover:text-emerald-400"
            >
              David Sánchez
            </a>
          </span>
        </div>

        <div className="flex items-center gap-6">
          <a
            href="https://github.com/davidsanchezbetanzos/pachangas-top"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 transition-colors hover:text-zinc-200"
            title="Ver código fuente en GitHub"
          >
            <Github className="h-4 w-4" />
            <span className="hidden xs:inline">Código Fuente</span>
          </a>
          <a
            href="mailto:davidsanchezbetanzos@gmail.com"
            className="flex items-center gap-2 transition-colors hover:text-zinc-200"
            title="Contactar por email"
          >
            <Globe className="h-4 w-4" />
            <span>Contacto</span>
          </a>
        </div>
      </div>
    </footer>
  );
};
# Arquitectura - Pachangas App

## Stack Tecnológico

| Capa | Tecnología | Versión |
|------|------------|---------|
| Frontend/Backend | [Next.js](https://nextjs.org/docs) | 15 (App Router) |
| Lenguaje | [TypeScript](https://www.typescriptlang.org/docs/) | 5.x |
| Estilos | [Tailwind CSS](https://tailwindcss.com/docs) | 4.x |
| Componentes | [shadcn/ui](https://ui.shadcn.com/docs) | latest |
| Base de Datos | [Supabase](https://supabase.com/docs) | PostgreSQL |
| Auth | [Supabase Auth](https://supabase.com/docs/guides/auth) | - |
| Despliegue | [Vercel](https://vercel.com/docs) | - |

## Estructura de Proyecto

```
/home/davidsanchezgomez/pachangas-io
├── app/                      # Next.js App Router
│   ├── layout.tsx           # Root layout + providers
│   ├── page.tsx            # Home: lista partidos
│   ├── partido/[id]/      # Detail page + registro
│   └── api/               # Route handlers
├── components/
│   ├── ui/                # shadcn components
│   └── *.tsx              # Custom components
├── lib/
│   ├── supabase.ts        # Client config
│   └── utils.ts           # Helpers
└── public/               # Static assets
```

## Base de Datos

### Tablas Principales

- **matches**: partidos creados
- **players**: jugadores apuntados (main/substitute)

### Autenticación

- Anonymous Sign-ins para usuarios sin cuenta
- Google OAuth opcional

## Recursos

- [Next.js App Router Docs](https://nextjs.org/docs/app)
- [shadcn/ui Installation](https://ui.shadcn.com/docs/installation/next)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
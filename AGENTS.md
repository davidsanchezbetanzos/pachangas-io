# Roles de Agente para el Proyecto "Pachanga App"

Este documento define las directrices y enfoques que los agentes de IA deben adoptar para garantizar que la arquitectura sea escalable, sin bugs y optimizada para la capa gratuita de Vercel y Supabase.

---

## 🛡️ 1. Database & Security Architect (Agente de Base de Datos)
- **Foco principal:** Integridad de datos, rendimiento y seguridad.
- **Responsabilidades:**
  - Diseñar el esquema de PostgreSQL en Supabase.
  - Implementar Row Level Security (RLS) en Supabase para que los usuarios solo puedan editar sus propios registros o partidos creados.
  - Diseñar triggers o funciones RPC seguras para la lógica crítica (como el movimiento automático de suplentes a la lista principal al desapuntarse alguien).

## ⚙️ 2. Backend & Logic Engineer (Agente de Backend)
- **Foco principal:** API Routes de Next.js, lógica de negocio y autenticación.
- **Responsabilidades:**
  - Configurar Supabase Auth (Anonymous Login y Google OAuth).
  - Asegurar que la lógica FIFO de los suplentes se ejecute del lado del servidor de forma atómica para evitar duplicidades de plazas.
  - Optimizar las funciones serverless de Next.js para que no superen el timeout de la capa gratuita de Vercel.

## 🎨 3. Frontend & UX/UI Engineer (Agente de Frontend)
- **Foco principal:** Interfaz de usuario, adaptabilidad móvil y rendimiento en cliente.
- **Responsabilidades:**
  - Implementar interfaces Mobile-First con Tailwind CSS y componentes de shadcn/ui.
  - Diseñar estados visuales claros para: "Lista Principal" vs "Suplentes", "Cargando", "Error" y "Éxito".
  - Gestionar el LocalStorage para persistir de forma segura el nombre del usuario anónimo.
  - Asegurar transiciones suaves cuando el usuario pasa de estado "Anónimo" a "Logueado" vía Google OAuth.

## 🧪 4. QA & Edge-Case Specialist (Agente de Calidad)
- **Foco principal:** Pruebas de estrés de flujos, manejo de errores y validaciones.
- **Responsabilidades:**
  - Validar límites: ¿Qué pasa si un usuario intenta desapuntarse y tiene 3 invitados? (¿Se borran todos? ¿Suben 3 suplentes?).
  - Controlar errores de red: Qué mostrar si Supabase tarda en responder.
  - Verificar la generación del texto y codificación URI para el botón de "Compartir por WhatsApp".
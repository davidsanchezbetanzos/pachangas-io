# Skill: Tailwind CSS & shadcn/ui (Mobile-First UX)

Target Environment: Tailwind CSS v3+, shadcn/ui (Radix Primitives).

## 1. Mobile-First Design Principles
- This app is primarily used on mobile phones (at the football pitch).
- **Design Rule:** Write styles for mobile by default. Use responsive modifiers (`md:`, `lg:`) *only* to scale up for desktop.
- Touch targets (buttons, interactive elements) must be at least **48x48px** for easy tapping.

## 2. shadcn/ui Component Usage
- Do not build complex UI components (Modals, Dropdowns, Sheets) from scratch.
- Use `npx shadcn@latest add [component]` to install standard components.
- Always check `@/components/ui` before creating any UI primitive.

## 3. Layout and Styling
- Avoid hardcoded colors. Use CSS variables defined in shadcn (`bg-background`, `text-foreground`, `border-input`, `bg-primary`).
- Ensure full support for system Dark/Light mode using Tailwind's `dark:` classes.
- Use Flexbox (`flex flex-col`) and CSS Grid (`grid grid-cols-1`) with standard Tailwind spacing scales (`space-y-4`, `gap-4`) to maintain clean, scannable spacing.

# Lavista

A hotel booking web app built with React + TanStack Router, shadcn/ui components, and Supabase as the backend. Originally built on [Lovable](https://lovable.dev).

## Stack

- **Frontend:** React 19, TanStack Router/Start, Tailwind CSS v4, shadcn/ui
- **Backend:** Supabase (auth, database)
- **Build tool:** Vite 8 (via `@lovable.dev/vite-tanstack-config`)
- **Package manager:** Bun

## Running the app

```bash
bun run dev
```

The dev server starts on port 5000. The workflow "Start application" handles this automatically.

## Environment

Supabase credentials are stored in `.env` (already configured). No additional secrets are needed to run locally.

## Notes

- The Lovable vite config hardcodes port 8080; `vite.config.ts` overrides this to port 5000 for Replit compatibility.
- Do not force-push or rebase/amend commits already pushed — this project is connected to Lovable and rewriting history breaks their sync.

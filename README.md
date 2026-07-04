# League Item Coach

League Item Coach is a League of Legends item and rune recommendation companion.

The product direction is Windows-first with an Overwolf overlay, plus a web app for manual planning and Mac users. The recommendation engine is deterministic TypeScript: no LLM is used for item choices or MVP explanations.

## Docs

- Vision PRD: `docs/product/vision-prd.md`
- MVP PRD: `docs/product/mvp-prd.md`
- Local issues: `docs/issues/`

## Stack

- Bun workspaces
- TypeScript
- Vite React
- Tailwind CSS
- shadcn/ui with the `b7DMx6v9s` preset
- Supabase planned for backend recommendation tables
- Overwolf planned for the Windows overlay app

## Commands

```bash
bun install
bun run dev
bun run build
bun run lint
bun run typecheck
```

## Adding shadcn components

Run shadcn commands from the repo root and target the app config:

```bash
bunx --bun shadcn@latest add button -c apps/web
```

Components are shared through `packages/ui`.

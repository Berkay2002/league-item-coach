# Repository Guidelines

## Project Structure & Module Organization

This is a Bun/Turbo TypeScript monorepo.

- `apps/web`: Vite React web app for the planner UI.
- `packages/ui`: shared shadcn/ui components, styles, and UI utilities.
- `docs/product`: product requirements, including the vision PRD and MVP PRD.
- `docs/issues`: local mirrors of GitHub implementation issues.
- `docs/agents`: engineering-skill configuration for issue tracking, labels, and domain docs.

Future app/package work should stay inside `apps/*` and `packages/*`. Keep reusable recommendation logic out of app-specific folders.

## Build, Test, and Development Commands

Use Bun from the repo root:

```bash
bun install        # install workspace dependencies
bun run dev        # run Turbo dev tasks
bun run build      # build all workspaces
bun run lint       # run ESLint through Turbo
bun run typecheck  # run TypeScript checks
bun run format     # run Prettier
```

There is no dedicated test command yet. Add one when introducing the first test framework.

## Coding Style & Naming Conventions

Use TypeScript and React. Follow the existing shadcn/Tailwind style in `packages/ui`.

- Prefer semantic Tailwind tokens and shadcn components over custom markup.
- Keep shared UI imports under `@workspace/ui/...`.
- Use kebab-case for markdown issue filenames, for example `0003-static-item-recommendation-tracer-bullet.md`.
- Keep component files focused on components. Non-component exports should live in separate files to satisfy React refresh linting.

Formatting is handled by Prettier with `prettier-plugin-tailwindcss`.

## Testing Guidelines

Current verification is:

```bash
bun run typecheck
bun run lint
bun run build
```

When tests are added, prefer fixture-based tests for recommender behavior. Test public behavior: inputs, recommendation outputs, explanations, and compliance guardrails. Do not test private scoring constants unless they become part of a published contract.

## Commit & Pull Request Guidelines

Existing commits use short conventional-style prefixes, for example `docs:` and `chore:`. Continue that pattern:

```text
docs: update MVP issue plan
chore: configure engineering issue workflow
```

Issue implementation work should happen on a feature branch and land through a pull request. PRs should link the relevant GitHub issue with a closing keyword, summarize the behavior change, list verification commands run, and include screenshots for visible UI changes.

## Agent-Specific Instructions

Issues and PRDs live in GitHub Issues. Use `gh` for tracker operations. External PRs are not a triage surface.

Use PRs for issue completion so linked GitHub issues auto-close on merge. Do not treat local commits on a feature branch as issue completion unless the user explicitly asks to skip the PR path.

Read:

- `docs/agents/issue-tracker.md`
- `docs/agents/triage-labels.md`
- `docs/agents/domain.md`

Before implementing, use the linked PRD issue and the issue body as the scope boundary.

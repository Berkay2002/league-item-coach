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

PR review workflow:

- Use PowerShell for normal repo work on Windows.
- Before opening a PR, use the `$cr-review` skill to run a local CodeRabbit review when the WSL CodeRabbit CLI is available. Invoke WSL only for that CodeRabbit command. If WSL Git reports broad false-positive changes from Windows line endings, set repo-local `core.autocrlf=true` from PowerShell before reviewing.
- Do not use CodeRabbit for PR reviews. Do not manually summon CodeRabbit on a PR, do not wait on CodeRabbit PR feedback, and do not use PR-thread autofix workflows. CodeRabbit is a local pre-PR review tool only.
- GitHub Copilot code review must be requested manually. Prefer `gh pr create --reviewer "@copilot"` when opening the PR, or `gh pr edit <pr-number> --add-reviewer "@copilot"` for an existing PR.
- Copilot reviews are comment-only and do not count as required approvals. Treat Copilot feedback as review input: address actionable findings, explain intentional non-changes, rerun verification, and push follow-up commits.
- After pushing meaningful follow-up changes, request a Copilot re-review manually from the PR Reviewers menu.
- Copilot review instructions live in `.github/copilot-instructions.md`, and the strict PR review skill lives in `.github/skills/code-review/SKILL.md`. Keep those files aligned with this workflow.
- Copilot uses custom instructions from the PR base branch. Changes to `.github/copilot-instructions.md` or `.github/skills/**` affect future PR reviews after they land in `main`.
- Copilot Memory is managed in GitHub account and repository settings, not in this repo. Do not rely on Copilot Memory as the durable source of project instructions; commit stable review rules to `.github/` and `AGENTS.md`.

## Agent-Specific Instructions

Issues and PRDs live in GitHub Issues. Use `gh` for tracker operations. External PRs are not a triage surface.

Use PRs for issue completion so linked GitHub issues auto-close on merge. Do not treat local commits on a feature branch as issue completion unless the user explicitly asks to skip the PR path.

After creating a PR, confirm CodeRabbit has been allowed to run automatically and manually request GitHub Copilot review. For existing PRs, run `gh pr edit <pr-number> --add-reviewer "@copilot"` or request Copilot from the GitHub Reviewers sidebar.

Copilot should use the repo's `.github/skills/code-review/SKILL.md` skill for PR reviews. If changing the review standard, update that skill and `.github/copilot-instructions.md` in the same PR.

Read:

- `docs/agents/issue-tracker.md`
- `docs/agents/triage-labels.md`
- `docs/agents/domain.md`

Before implementing, use the linked PRD issue and the issue body as the scope boundary.

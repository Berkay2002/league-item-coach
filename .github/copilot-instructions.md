# Copilot Repository Instructions

For pull request code review, use the repository skill at `.github/skills/code-review/SKILL.md`.

Apply that skill as the review bar for maintainability, abstraction quality, type-boundary cleanliness, file-size growth, and spaghetti-condition risk. Do not treat passing tests as enough for approval when the implementation makes the codebase harder to maintain.

Use repository files as the source of truth over Copilot Memory. Copilot Memory may contain helpful preferences, but it can drift and is managed outside this repo in GitHub settings.

This project is a Bun/Turbo TypeScript monorepo. Follow `AGENTS.md` for structure, commands, PR workflow, and issue boundaries.

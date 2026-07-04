# Issue tracker: GitHub

Issues and PRDs for this repo live as GitHub issues. Use the `gh` CLI for all operations.

## Conventions

- **Create an issue**: `gh issue create --title "..." --body "..."`. Use a heredoc for multi-line bodies.
- **Read an issue**: `gh issue view <number> --comments`, filtering comments by `jq` and also fetching labels.
- **List issues**: `gh issue list --state open --json number,title,body,labels,comments --jq '[.[] | {number, title, body, labels: [.labels[].name], comments: [.comments[].body]}]'` with appropriate `--label` and `--state` filters.
- **Comment on an issue**: `gh issue comment <number> --body "..."`
- **Apply / remove labels**: `gh issue edit <number> --add-label "..."` / `--remove-label "..."`
- **Close**: `gh issue close <number> --comment "..."`
- **Create a PR for issue work**: `gh pr create --base main --head <branch> --reviewer "@copilot" --body "Closes #<issue-number>..."`
- **Request Copilot review on an existing PR**: `gh pr edit <pr-number> --add-reviewer "@copilot"`

Infer the repo from `git remote -v`; `gh` does this automatically when run inside this clone.

## Pull request review agents

Use pull requests for issue completion so GitHub can close linked issues on merge.

- **CodeRabbit** runs automatically on PRs. Do not add a manual invocation step unless repository configuration changes.
- **GitHub Copilot** must be requested manually. Use `gh pr create --reviewer "@copilot"` when opening the PR, or `gh pr edit <pr-number> --add-reviewer "@copilot"` for an existing PR. If the CLI request fails, request Copilot from the PR Reviewers sidebar on GitHub.
- Copilot reviews are comment-only. They do not count as required approvals and do not block merging by themselves.
- Copilot PR review should use `.github/skills/code-review/SKILL.md`, wired through `.github/copilot-instructions.md`, as the strict code-quality review bar.
- Copilot reads custom instructions from the PR base branch. Updates to `.github/copilot-instructions.md` or `.github/skills/**` take effect for future PRs after they are merged to `main`.
- Copilot Memory is account/repository setting state. It is useful context, but repo-committed instructions are the source of truth for agents.
- Address actionable CodeRabbit and Copilot comments before merge. If follow-up commits materially change the reviewed code, request Copilot re-review manually from the PR Reviewers menu.

## Pull requests as a triage surface

**PRs as a request surface: no.**

If this is changed later, external PRs should run through the same category and state roles as issues.

## When a skill says "publish to the issue tracker"

Create a GitHub issue.

## When a skill says "fetch the relevant ticket"

Run `gh issue view <number> --comments`.

## Wayfinding operations

Used by `/wayfinder`. The map is a single issue labelled `wayfinder:map`, holding the Notes / Decisions-so-far / Fog body.

- **Map**: create a single issue labelled `wayfinder:map`.
- **Child ticket**: use GitHub sub-issues where available. If sub-issues are unavailable, add the child to a task list in the map body and put `Part of #<map>` at the top of the child body.
- **Blocking**: use GitHub native issue dependencies where available. If unavailable, put `Blocked by: #<n>, #<n>` near the top of the issue body.
- **Claim**: assign the issue to yourself with `gh issue edit <n> --add-assignee @me`.
- **Resolve**: comment with the answer, close the issue, and append a context pointer to the map's Decisions-so-far.

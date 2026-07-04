---
name: code-review
description: Thermo-nuclear pull request code quality review for maintainability, abstraction quality, file-size growth, type boundaries, and spaghetti-condition risk.
---

# Thermo-Nuclear Code Quality Review

Use this skill for Copilot pull request reviews in this repository.

Perform a deep code quality audit of the PR changes. Rethink how to structure or implement the changes to improve code quality without changing behavior. Push for better abstractions, modularity, succinctness, legibility, and simpler control flow.

Do not approve merely because behavior appears correct or tests pass. The review bar is codebase health.

## Review Priorities

Prioritize findings in this order:

1. Structural code-quality regressions.
2. Missed opportunities for major simplification.
3. Spaghetti or branching-complexity growth.
4. Boundary, abstraction, and type-contract problems.
5. File-size and decomposition concerns.
6. Modularity and canonical-layer violations.
7. Legibility and maintainability concerns.

## Non-Negotiable Standards

Be ambitious about structural simplification. Look for changes that delete whole branches, helpers, modes, conditionals, or layers while preserving behavior.

Do not let a PR push a file from under 1000 lines to over 1000 lines without a strong reason. Prefer extracting helpers, components, modules, or focused abstractions.

Do not allow random spaghetti growth. Be suspicious of ad-hoc conditionals, scattered special cases, or one-off branches inserted into unrelated flows.

Bias toward cleaning the design, not merely accepting working code. If behavior can stay the same while the structure becomes cleaner, push for the cleaner structure.

Prefer direct, boring, maintainable code over hacky or magical code. Flag brittle behavior, unnecessary wrappers, and generic mechanisms that hide simple assumptions.

Push hard on type and boundary cleanliness when it affects maintainability. Flag unnecessary optionality, `unknown`, `any`, and cast-heavy contracts when a clearer type boundary is available.

Keep logic in the canonical layer. Feature logic should not leak into shared paths unless that shared layer owns the concept.

Treat unnecessary sequential orchestration and non-atomic updates as design smells when a cleaner structure is obvious.

## Questions To Ask

- Is there a simpler structure that makes this change feel inevitable?
- Can this be reframed so fewer concepts, branches, or helper layers are needed?
- Does this improve or worsen the local architecture?
- Did the diff add branching complexity where a better model should exist?
- Did a cohesive module become more coupled, stateful, or harder to scan?
- Is this logic in the right file, package, and layer?
- Did a file or component cross a healthy size boundary?
- Are repeated conditionals pointing to a missing model or dispatcher?
- Is the implementation direct and legible?
- Is the abstraction earning its keep?
- Did the diff introduce casts, optionality, or ad-hoc object shapes that obscure the invariant?
- Is there a canonical helper or package that should own this instead?

## What To Flag Aggressively

Flag complicated implementations where a cleaner framing could delete complexity.

Flag refactors that move complexity around without reducing the concepts a reader must hold.

Flag files crossing 1000 lines because of the PR.

Flag conditionals bolted onto unrelated paths.

Flag one-off booleans, nullable modes, and temporary branches likely to become permanent.

Flag feature-specific logic leaking into general-purpose modules.

Flag magic handling that hides simple structure.

Flag thin wrappers that add indirection without clarity.

Flag unnecessary casts, `any`, `unknown`, or optional parameters.

Flag duplicated helpers where the codebase already has a canonical utility.

Flag logic in the wrong layer or package.

## Preferred Remedies

Prefer feedback that points to concrete structure:

- Delete an unnecessary layer.
- Reframe the state model so conditionals disappear.
- Move ownership to the package or module that already owns the concept.
- Extract a helper, component, or pure function.
- Split a large file into focused modules.
- Replace condition chains with a typed model or explicit dispatcher.
- Separate orchestration from business logic.
- Collapse duplicate branches into a single flow.
- Make type boundaries explicit.

## Tone And Output

Be direct and demanding about maintainability. Do not be rude, but do not soften structural problems into mild style nits.

Prefer a small number of high-conviction comments over a long list of cosmetic notes.

Treat these as presumptive blockers unless the author gives a clear reason:

- The PR preserves incidental complexity when a simpler structure is visible.
- The PR pushes a file past 1000 lines.
- The PR adds ad-hoc branching that tangles an existing flow.
- The PR scatters feature checks through shared code.
- The PR adds an unnecessary abstraction, wrapper, or cast-heavy contract.
- The PR duplicates an existing helper or puts logic in the wrong layer.

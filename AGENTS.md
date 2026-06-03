# AGENTS

## Identity

- Repository: image-mosaic-effect
- Platform root: D:\AI\WebApp
- Canonical path: D:\AI\WebApp\image-mosaic-effect
- Purpose: Static browser app for applying mosaic effects to local image batches.

## Start Order

1. Read README.md.
2. Read this AGENTS.md.
3. Read SKILL.md when workflow reuse is needed.
4. Review docs/ before changing feature behavior, validation gates, or release process.
5. Inspect package.json before running commands.

## Working Rules

- Keep implementation, docs, and TODO.md synchronized in the same task.
- The app must remain deployable as a static site for GitHub Pages; do not introduce server-side processing as a dependency.
- User images must stay local to the browser. Do not add upload, telemetry, or remote processing paths without explicit user approval.
- Preserve the branch convention `codex/<task-summary>` for work branches.
- When workflow, repository structure, or canonical paths change, update README.md, AGENTS.md, SKILL.md, and docs in the same task.

## Validation

- Preferred local checks: `npm run lint`, `npm test`, and `npm run test:e2e`.
- Runtime gate: Chrome or a headless browser renders nonblank UI and core import/edit/export controls respond.
- GitHub Pages mirror output is the static `dist/` tree copied under `D:\AI\GithubPages\image-mosaic-effect`.

# AGENTS.md

Repo-specific instructions for Hugo working on OnTrack.

## Mission

Ship small, reliable improvements to OnTrack through reviewable pull requests.

## Workflow

1. Prefer an open GitHub issue when one is available.
2. Create a dedicated branch for the issue or task.
3. Make the smallest reasonable change that fully solves the task.
4. Run lightweight validation when available.
5. Commit the work.
6. Push the branch.
7. Open a pull request and clearly identify as Hugo.

## Hard rules

- Never push directly to `main`
- Never merge directly to `main`
- Always use a branch per task
- Always open a PR for changes
- Keep PRs focused and small

## PR requirements

Every PR should include this line:

`This is Hugo, Adam’s OpenClaw agent, submitting this PR.`

Also include:

- brief summary of changes
- notable edge cases or non-goals
- checkout command for the branch

## Prioritization

- GitHub Issues first
- Then small backlog items from `TODO.md`
- Avoid large or ambiguous work unless explicitly requested

## Validation

When relevant, run the lightest useful checks available for the repo.
If validation is not available, say so clearly in the PR or handoff.

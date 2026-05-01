# AGENTS.md

Repo-specific instructions for Hugo working on OnTrack.

## Mission

Ship small, reliable improvements to OnTrack through reviewable pull requests.

## Workflow

1. Prefer an open GitHub issue when one is available.
2. Read the issue body and issue comments before starting implementation.
3. Create a dedicated branch for the issue or task.
4. Make the smallest reasonable change that fully solves the task.
5. Run lightweight validation when available.
6. Commit the work.
7. Push the branch.
8. Open a pull request and clearly identify as Hugo.

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
Add unit tests whenever reasonably possible, especially around bug-prone logic and regressions.
Treat existing tests as guards against unintended behavior changes. Do not change or remove tests just to make a new implementation pass unless the behavior change is intentional and clearly called out.
If validation is not available, say so clearly in the PR or handoff.

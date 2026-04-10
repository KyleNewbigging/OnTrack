# OnTrack Daily Dev Agent Plan

This repo is intended to be worked by a daily automated agent.

## Goal
Once per day, the agent should:
1. Check `TODO.md` for unchecked items.
2. Check GitHub open issues.
3. If neither source has actionable work, exit without changes.
4. Otherwise pick one small, self-contained item.
5. Implement the fix/feature.
6. Run lightweight validation if available.
7. Commit changes on a branch.
8. Push the branch.
9. Open a PR for review.

## Prioritization
- Prefer GitHub issues first if any are open.
- Otherwise use the first small unchecked item from `TODO.md` that looks self-contained.
- Avoid large, ambiguous, multi-screen features unless no simpler task exists.
- Skip tasks that would require secrets, paid services, app store access, or major product decisions.

## Constraints
- Keep changes small enough to review in one PR.
- Do not force-merge or auto-merge.
- Do not close issues automatically unless clearly fixed and referenced.
- If validation fails and the agent cannot resolve it safely, do not open a PR.

## Notes
- Current repo has no open GitHub issues as of setup time.
- `TODO.md` currently contains actionable unchecked items.
- Current remote is HTTPS. For automated push/PR to work, the runtime will need GitHub auth configured (e.g. `gh auth login` or a usable git credential helper/token).

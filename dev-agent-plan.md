# OnTrack Dev Agent Plan

This repo is currently worked by an on-demand dev agent ("Bob").

## Current workflow
Bob is triggered by a user message, not by a daily scheduler.

Typical flow:
1. User asks Bob to work on OnTrack.
2. Bob checks `TODO.md` for unchecked items.
3. Bob checks GitHub open issues.
4. If neither source has actionable work, Bob does nothing.
5. Otherwise Bob picks one small, self-contained item.
6. Bob implements the change.
7. Bob runs lightweight validation if available.
8. Bob commits changes on a branch.
9. Bob pushes the branch and opens a PR for review.
10. Bob addresses review feedback and updates the PR when asked.

## Prioritization
- Prefer GitHub issues first if any are open.
- Otherwise use the first small unchecked item from `TODO.md` that looks self-contained.
- Avoid large, ambiguous, multi-screen features unless no simpler task exists.
- Skip tasks that would require secrets, paid services, app store access, or major product decisions.

## Constraints
- Keep changes small and reviewable.
- Do not force-merge or auto-merge.
- Do not close issues automatically unless clearly fixed and referenced.
- If validation fails and the agent cannot resolve it safely, do not open a PR.
- Keep replies short by default unless the user asks for more detail.

## Notes
- Current remote is HTTPS.
- GitHub auth is expected to be available for push/PR actions.
- A proper scheduled/cron workflow may be added later once the OpenClaw gateway cron/pairing issue is resolved. When that is working, this plan can be extended to follow the original daily automation model.

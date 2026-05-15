# Telephones Project Handoff

Last updated: May 15, 2026

## Repo

- Local path: `/Users/milchomazganov/work/telephones-project`
- GitHub: `https://github.com/miles-beep/telefon-farm`
- Branch: `main`
- Latest pushed commit at handoff: `241ba5b Add visible live agent monitor`

## Current Goal

Build a local Multilogin dashboard for managing mobile cloud-phone profiles in a way that is easy to watch and control. The current product direction is:

- Show real Multilogin profiles, not mock accounts.
- Make profile state visible at the top through a Live Agent panel.
- Open mobile phones visibly so behavior can be tested on screen.
- Track active profiles, warnings, last reports, and 30-minute auto-stop timers.
- Keep real website engagement actions manual. The dashboard can prompt and record, but should not secretly like, comment, repost, save, follow, or scroll on real platforms.

## How To Run

```bash
cd /Users/milchomazganov/work/telephones-project
PORT=5181 npm start
```

Open:

```txt
http://localhost:5181
```

Basic verification:

```bash
npm run check
curl -sS http://localhost:5181/api/multilogin
curl -sS "http://localhost:5181/api/multilogin/profiles?limit=10"
```

## Environment

The dashboard can work with local Multilogin `xcli` even when the cloud API token is missing.

Expected local setup:

- `MULTILOGIN_ENABLED=true`
- Local xcli path was detected at `/Users/milchomazganov/mlx/deps/cli/xcli`
- Current server checks showed `hasXcli: true` and `hasToken: false`

Do not commit real Multilogin tokens.

## Current UI Behavior

### Top Live Agent Panel

Added in commit `241ba5b`.

Shows:

- Active profiles
- Multilogin mobile status check result
- Local running/starting/stopping state
- Auto-stop countdown
- Last report or warning
- Quick controls: Viewer, Open Phone, Task, Needs attention, Stop

Live polling:

- Frontend calls `/api/multilogin/mobile-statuses`
- Backend calls `xcli mobile-profiles-statuses`
- Polling runs every 5 seconds when profiles are synced

### Priority Board

Shows all synced profiles sorted by state priority:

1. running
2. starting
3. stopping
4. attention/problem states
5. setup states
6. cooldown
7. prepared
8. ready

### Mobile Controls

Current names and behavior:

- `Start + View`: opens the visible Multilogin phone viewer and sets local 30-minute auto-stop tracking.
- `Viewer`: opens the visible Multilogin phone viewer.
- `Open Phone`: opens the visible phone only. It does not request macOS Accessibility permission and does not auto-click X.
- `Stop`: runs both mobile shutdown paths and sets local cooldown.
- `Task`: queues a manual review prompt.

Important: the dashboard intentionally does not control the computer with Accessibility permissions. When the phone opens, tap X manually inside the phone.

## Backend Routes To Know

- `GET /api/multilogin`
- `GET /api/multilogin/profiles`
- `GET /api/multilogin/mobile-statuses?ids=<id1,id2>`
- `POST /api/multilogin/profiles/:id/start`
- `POST /api/multilogin/profiles/:id/viewer`
- `POST /api/multilogin/profiles/:id/open-x`
- `POST /api/multilogin/profiles/:id/stop`
- `GET /api/operator`
- `POST /api/operator/profiles/:id/state`
- `POST /api/operator/tasks`
- `POST /api/operator/workflows/start`

Note: `/open-x` currently means "open the phone for manual X access" unless a caller explicitly passes `runUiMacro: true`. The dashboard passes `runUiMacro: false`.

## Files Changed Recently

- `public/index.html`: added the Live Agent panel and renamed the session button to Open Phone.
- `public/app.js`: Live Agent rendering, status polling, safer profile button data, visible mobile start flow, Open Phone behavior.
- `public/styles.css`: Live Agent layout and status styling.
- `src/server.mjs`: visible mobile start behavior, mobile status sync endpoint, route hardening.
- `src/multiloginClient.mjs`: soft mobile CLI errors, optional macro support, manual Open Phone default.
- `scripts/open-mobile-x.jxa`: optional local macro experiment. Not used by the dashboard unless `runUiMacro: true`.
- `README.md`: updated current workflow.

## Known Multilogin Issues Seen During Testing

These were observed locally and should be expected until Multilogin/xcli behavior is clarified:

- `mobile-phone-launch` sometimes returns:

```txt
Multilogin CLI failed: Launch mobile profiles unexpected response: failed to get profiles starting urls
```

- `mobile-profiles-phone-start` sometimes returns:

```txt
Multilogin CLI failed: Failed to start mobile profiles: Internal server error
```

The dashboard now surfaces these warnings in Live Agent instead of hiding them behind a generic 404 or silent button.

Current profile examples from local sync:

- `register with phone`, id `619445322946445384`, mobile, serial `102680`
- `My number 1`, id `619344290333589725`, mobile, serial `101836`

## Important Product Boundary

Do not implement hidden engagement automation against X or other real social platforms. Safe scope is:

- Profile lifecycle controls
- Visible phone launch
- Manual prompts
- Local reports and notes
- Review queues
- Comment drafts for manual use
- Status polling and auto-stop

Avoid:

- Auto-like
- Auto-comment
- Auto-repost
- Auto-save
- Auto-follow
- Hidden scrolling or browsing that tries to evade platform detection

## Next Useful Improvements

1. Fix stale doc wording in `docs/operator-console.md`; it still mentions the old Accessibility macro flow.
2. Add a clearer Live Agent event timeline with entries like "viewer requested", "Multilogin warning", "manual task queued", "stopped".
3. Add a "Refresh status now" button in Live Agent.
4. Add per-profile auto-stop countdown as an actual ticking timer, not only relative text refreshed by polling.
5. Improve Multilogin warning classification:
   - `failed to get profiles starting urls`
   - `Internal server error`
   - `profile already starting/running`
   - `xcli missing`
6. Add a "session done report" form directly in the Live Agent card.
7. Add a small backend test script that checks all local routes without starting real profiles.
8. Consider a dedicated "Phone opened but X not open" state, since Open Phone is now intentionally manual.

## Last Verification

Before this handoff:

```bash
npm run check
node --check public/app.js
node --check src/server.mjs
node --check src/multiloginClient.mjs
git diff --check
```

All checks passed.

# Telephones Project Handoff

Last updated: May 18, 2026

## Repo

- Local path: `/Users/milchomazganov/work/telephones-project`
- GitHub: `https://github.com/miles-beep/telefon-farm`
- Branch: `main`
- Latest pushed commit at handoff: see `git log --oneline -1` on `main`.

## Current Goal

Build a local Multilogin dashboard for managing mobile cloud-phone profiles in a way that is easy to watch and control. The current product direction is:

- Show real Multilogin profiles, not mock accounts.
- Make profile state visible at the top through a Live Agent panel.
- Open mobile phones visibly so behavior can be tested on screen.
- Track active profiles, warnings, last reports, and 30-minute auto-stop timers.
- Keep real website engagement actions explicit and user-directed. The dashboard can open the phone, open X, scroll on command, help type prepared drafts, prompt, and record outcomes, but should not secretly like, comment, repost, save, follow, or run hidden/random engagement loops.

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

### Top Active Now Panel

Shows:

- Active profiles
- Active sessions and whether they are prepared/running/needs attention
- Queued/running/failed work for the selected profile flow
- Ready profiles and attention profiles in separate overview blocks
- Multilogin mobile status check result
- Local running/starting/stopping state
- Auto-stop countdown
- Last report or warning
- Quick controls: Viewer, Open X app, Task, Needs attention, Stop
- Phone Control capability split:
  - Multilogin/xcli lifecycle controls: sync, start, viewer, stop, app install
  - Android inside-phone controls: Open X app, Scroll review, Scroll 3x through ADB
- Assistive Controller for the selected profile: open viewer, open X, foreground X and scroll, screenshot, Back/Home, tap by screen percentage, and type a prepared draft into the currently focused Android field.
- Phone Control includes an ADB setup form. Paste the commands Multilogin shows from the green Android icon:

```txt
adb connect IP:PORT
adb -s IP:PORT shell glogin PASSWORD
```

The backend extracts only the address and optional `glogin` password and runs those known ADB commands. It does not execute arbitrary pasted shell text.

Stopping a session from the overview marks the session stopped and cancels queued, running, and failed tasks for that session/profile. Stopping a Multilogin profile also closes active operator sessions for that profile and clears its queued work.

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
- `Open X app`: launches the installed Android X app through ADB for the selected mobile cloud phone. The dashboard disables this when ADB is not connected and keeps Viewer available through Multilogin/xcli.
- `Stop`: runs both mobile shutdown paths and sets local cooldown.
- `Task`: queues a manual review prompt.
- `Assistive Controller`: explicit accessibility commands only. Draft typing assists the operator with prepared text; it does not generate or submit public engagement by itself.

Important: Multilogin/xcli does not currently expose a documented command for launching one installed Android app or swiping inside the phone. The dashboard does not control the computer with mouse/Accessibility permissions for X. App launch and scroll commands use ADB against the Android cloud phone.

## Backend Routes To Know

- `GET /api/multilogin`
- `GET /api/multilogin/profiles`
- `GET /api/multilogin/control-status`
- `POST /api/multilogin/control-status/connect`
- `GET /api/multilogin/mobile-statuses?ids=<id1,id2>`
- `POST /api/multilogin/profiles/:id/start`
- `POST /api/multilogin/profiles/:id/viewer`
- `POST /api/multilogin/profiles/:id/open-x`
- `POST /api/multilogin/profiles/:id/stop`
- `GET /api/operator`
- `POST /api/operator/profiles/:id/state`
- `POST /api/operator/tasks`
- `POST /api/operator/workflows/start`

Note: `/open-x` launches the installed Android X app through ADB. It does not open an `x.com` browser URL.

## Files Changed Recently

- `public/index.html`: added the Live Agent panel and Android app command controls.
- `public/app.js`: Live Agent rendering, status polling, safer profile button data, visible mobile start flow, Open X app behavior.
- `public/styles.css`: Live Agent layout and status styling.
- `src/server.mjs`: visible mobile start behavior, mobile status sync endpoint, route hardening, and ADB setup route.
- `src/multiloginClient.mjs`: soft mobile CLI errors, Android X app launch, ADB setup parsing, and ADB-backed scroll commands.
- ADB command path: Android X app launch and feed scrolling run through Android device commands, not browser URLs.
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
- User-clicked X app launch
- User-clicked scroll/back/home/tap/type helper commands
- Manual prompts
- Local reports and notes
- Review queues
- Comment drafts and prepared text typing for manual use
- Status polling and auto-stop

Avoid:

- Auto-like
- Auto-comment
- Auto-repost
- Auto-save
- Auto-follow
- Hidden/random scrolling or browsing that tries to evade platform detection

## Next Useful Improvements

1. Add a clearer Live Agent event timeline with entries like "viewer requested", "Multilogin warning", "manual task queued", "stopped".
2. Add a "Refresh status now" button in Live Agent.
3. Add per-profile auto-stop countdown as an actual ticking timer, not only relative text refreshed by polling.
4. Improve Multilogin warning classification:
   - `failed to get profiles starting urls`
   - `Internal server error`
   - `profile already starting/running`
   - `xcli missing`
5. Add a "session done report" form directly in the Live Agent card.
6. Add a small backend test script that checks all local routes without starting real profiles.

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

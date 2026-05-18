# Telefon Farm

A local Multilogin profile dashboard. It connects to your Multilogin browser profiles and mobile cloud phones, shows them without seeded fake data, and lets you start or stop profiles from the dashboard or terminal.

The app intentionally stays local. It does not automate likes, comments, saves, reposts, follows, proxy changes, cookie imports, or profile mutation. Phone app launch and feed scrolling are explicit operator commands only.

## Run

```bash
npm start
```

Open:

```txt
http://localhost:5177
```

If you run it with `PORT=5180`, open `http://localhost:5180/`.

No package install is required because the app uses only built-in Node modules and static browser files.

Create a local `.env` from `.env.example` if you want a repeatable environment setup. Do not commit real tokens.

## What It Includes

- Real Multilogin profile sync for browser profiles and mobile cloud phones
- Mobile cloud-phone sync and controls can use local `xcli` even when the cloud API token is missing
- Numbered **Start Here** workflow: choose phone, start/connect, then control X
- **My Profiles** board is simplified by default and only selects which real phone the workflow controls
- **Advanced tools** reveals the older profile console, operator queue, buckets, diagnostics, and raw phone-control panels when needed
- Profile Console with persistent sessions, presets, safety notes, and a per-profile session log
- **Start My X Session** opens the visible Multilogin phone, starts the automatic phone-control connector, and opens X automatically once ADB is connected
- Built-in phone-control setup: watch the Mac clipboard for Multilogin ADB commands, connect automatically, verify, and test with a screenshot
- Explicit accessibility commands on the selected phone: open viewer, open X, foreground X and scroll, screenshot, back/home, tap a screen point, and type a prepared draft into the focused Android field
- Active status, warnings, auto-stop timers, and latest reports for the selected real phone
- Profile buckets for Ready, Active, Cooldown, Setup, and Attention states
- Advanced queues and legacy operator panels are hidden by default behind **Advanced tools** so the main screen stays focused
- Recovery buttons for login needed, missing X app, wrong screen, stuck Play Store, and frozen phone notes
- Local Review Queue and Comment Drafts panels for manual follow-up work
- Daily overview for profiles used today, active sessions, completed prompts, and attention items
- Operator Queue with operators, queued tasks, and task status tracking
- Stopping a session or profile clears queued/running/failed operator tasks tied to that profile so stale work does not remain active
- Server-side random prompt planning: one reusable start task, then random local prompts
- Presets: Review mode, Light warmup, Comment drafting, and No engagement
- Dashboard controls to start and stop Multilogin profiles
- Mobile cloud-phone **Start + View** opens the visible Multilogin phone window so the session can be tested directly
- Started or opened profiles show local running state and are auto-stopped after 30 minutes
- Mobile cloud-phone **Open X app** launches the installed Android X app only when Android/ADB inside-phone controls are connected
- Profile cards show **Setup control** instead of **Open X app** until the selected phone has a verified control channel
- Mobile cards include an explicit manual command runner for visible phone actions such as `Scroll`, disabled until Android/ADB control is available
- Android app launch and scroll commands use ADB against the selected cloud phone
- Draft helpers can type text you prepared into the currently focused Android field; they do not choose content or submit posts by themselves
- **Install X** requests Multilogin's X(Twitter) app install for the mobile profile group
- Terminal controls through `npm run mlx`
- Empty-by-default local state, with demo data only when explicitly enabled
- Local operator state persisted to `data/operator-state.json` and ignored by git
- Guarded Multilogin adapter for profile lifecycle and diagnostics
- Importable Postman collection and environment
- Project breakdown in `docs/project-plan.md`
- Operator details in `docs/operator-console.md`
- Local Multilogin Cloud Phones reference summaries in `api documentation/`

## Dashboard Flow

1. Open the dashboard and use **Sync Profiles** if your phones are not listed.
2. In **1. Start Here**, choose the phone you want to use.
3. Click **Start My X Session**. The dashboard opens the visible Multilogin phone and starts watching the Mac clipboard.
4. If phone control is not connected yet, enable ADB in Multilogin and copy the green Android icon's ADB command once.
5. When the dashboard sees the ADB command, it connects automatically and opens the installed Android X app.
6. Use **Open X**, **Scroll**, **Scroll 3x**, **Screenshot**, **Back**, **Home**, and **Stop** from the numbered workflow.
7. Use **2. Your Phones** only to switch which phone the workflow controls.
8. Use **Advanced tools** only when you need diagnostics, queues, raw ADB setup, or older operator panels.

Completed and cancelled operator tasks are hidden from the active list. Failed tasks stay visible until you rerun, complete, or cancel them.

## Multilogin API

The Multilogin adapter is disabled by default. When enabled with a token, it can sync profiles, run diagnostics, and start/stop profiles. Browser profiles use the documented Multilogin API. Mobile cloud phones use the installed `xcli` from `~/mlx/deps/cli/xcli`.

```bash
MULTILOGIN_ENABLED=true npm start
```

For token-based cloud endpoints:

```bash
MULTILOGIN_ENABLED=true MULTILOGIN_TOKEN="your_token" npm start
```

See `docs/multilogin-api.md` for the implemented endpoint list and boundaries.
Multilogin/xcli controls cloud-phone lifecycle: sync, start, viewer, stop, and app installation. It does not expose a documented API for pressing inside Android, launching one installed Android package, or swiping the app feed. Those inside-phone commands use Multilogin's ADB cloud-phone feature. Start the phone, enable ADB in Multilogin, and copy the connect/auth commands from the green Android icon. The local server watches the Mac clipboard and connects when it sees those commands.

The dashboard includes a safe ADB setup form. It does not execute arbitrary terminal text. It only extracts a Multilogin cloud-phone address from `adb connect IP:PORT` and an optional `glogin` password from `adb -s IP:PORT shell glogin PASSWORD`, then runs those known ADB commands.

## Terminal Control

```bash
npm run mlx -- status
npm run mlx -- profiles
npm run mlx -- start <profile_id>
npm run mlx -- stop <profile_id>
npm run mlx -- open-x <mobile_profile_id>
npm run mlx -- scroll <mobile_profile_id>
npm run mlx -- install-x <mobile_profile_id>
npm run mlx -- operator
npm run mlx -- work <profile_id> review_mode
npm run mlx -- prepare <profile_id> review_mode
npm run mlx -- session-start <session_id>
npm run mlx -- session-done <session_id> "notes"
```

If the dashboard is not on `http://localhost:5180` or `http://localhost:5177`, set `TELEPHONES_BASE_URL`.

## Postman

Import these files into Postman:

```txt
postman/telephones-project.postman_collection.json
postman/telephones-project.postman_environment.json
```

The collection includes the Multilogin sign-in and workspace automation-token flow, local dashboard routes, and Multilogin diagnostics. See `docs/postman.md`.

## Useful Commands

```bash
npm run check
npm run mlx -- profiles
npm start
```

Use `PORT=5180 npm start` if port `5177` is already taken.

Set `TELEPHONES_DEMO_DATA=true` only if you want the old local sandbox demo data.

# Telefon Farm

A local Multilogin profile dashboard. It connects to your Multilogin browser profiles and mobile cloud phones, shows them without seeded fake data, and lets you start or stop profiles from the dashboard or terminal.

The app intentionally stays local. It does not automate real social platforms, evade bans, or perform real likes, comments, saves, reposts, scrolling, proxy changes, cookie imports, or profile mutation.

## Run

```bash
npm start
```

Open:

```txt
http://localhost:5177
```

No package install is required because the app uses only built-in Node modules and static browser files.

Create a local `.env` from `.env.example` if you want a repeatable environment setup. Do not commit real tokens.

## What It Includes

- Real Multilogin profile sync for browser profiles and mobile cloud phones
- Profile Console with persistent sessions, presets, safety notes, and a per-profile session log
- **Start Work** one-click workflow: prepare profile, run start, and start the session runner
- Daily overview for profiles used today, active sessions, completed prompts, and attention items
- Operator Queue with operators, queued tasks, and task status tracking
- Server-side random prompt planning: one reusable start task, then random local prompts
- Presets: Review mode, Light warmup, Comment drafting, and No engagement
- Dashboard controls to start and stop Multilogin profiles
- Mobile cloud-phone **Start Bg** uses Multilogin's background/proxy start path when available; **Viewer** opens the visible phone window when needed
- Terminal controls through `npm run mlx`
- Empty-by-default local state, with demo data only when explicitly enabled
- Local operator state persisted to `data/operator-state.json` and ignored by git
- Guarded Multilogin adapter for profile lifecycle and diagnostics
- Importable Postman collection and environment
- Project breakdown in `docs/project-plan.md`
- Operator details in `docs/operator-console.md`

## Dashboard Flow

1. Start the app with `MULTILOGIN_ENABLED=true` and `MULTILOGIN_TOKEN`.
2. Open the dashboard.
3. Use **Sync Profiles** in the Multilogin panel.
4. In **Profile Console**, select a profile and preset.
5. Click **Start Work** to prepare the profile, run the start task, and begin the session runner.
6. Use **Done**, **Skip**, or **Needs attention** when the random timer releases the next prompt.
7. Use **Prepare Profile**, **Run Start**, and **Start Session** separately only when you want manual control over each step.
8. Use **Viewer** for mobile profiles when you want to watch the phone.
9. Use terminal commands if you prefer CLI control.

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

## Terminal Control

```bash
npm run mlx -- status
npm run mlx -- profiles
npm run mlx -- start <profile_id>
npm run mlx -- stop <profile_id>
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

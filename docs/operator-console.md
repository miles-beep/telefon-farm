# Profile Console And Operator Queue

The Profile Console is the main work surface for local Multilogin sessions. It prepares a profile, tracks the session, and records manual prompts and outcomes.

## What It Does

- Syncs real Multilogin browser profiles and mobile cloud-phone profiles.
- Creates one persistent session per profile.
- Starts the main local workflow with one **Start Work** button.
- Opens the next ready profile with one **Open Next Ready Profile** button.
- Queues one reusable `Start profile` task when a session is prepared.
- Runs allowed Multilogin lifecycle controls: start and stop.
- Generates local prompts at randomized intervals from a selected preset.
- Records prompt outcomes with `Done`, `Skip`, and `Needs attention`.
- Tracks per-profile Ready, Active, Cooldown, Setup, and Attention states.
- Stores local review items and reusable manual comment drafts.
- Keeps a per-session log and a daily overview.
- Keeps completed and cancelled tasks out of the active task list.

## Presets

- `Review mode`: balanced prompts for scroll, open, save review, like review, repost review, and comment drafting.
- `Light warmup`: mostly scroll/open prompts with slower timing.
- `Comment drafting`: focused prompts for opening posts and drafting comments.
- `No engagement`: observation-only scroll/open prompts.

Preset prompts are local instructions. They do not click, scroll, like, repost, comment, save, or follow on X or any other third-party platform.

## Main Flow

1. Sync Multilogin profiles.
2. Select a profile and preset in **Profile Console**.
3. Click **Start Work**.
4. Handle the current prompt manually when the timer releases it.
5. Click **Done**, **Skip**, or **Needs attention**.

Use **Prepare Profile**, **Run Start**, and **Start Session** separately only when you want manual control over each stage.

After `Done` or `Skip`, the server schedules the next prompt with a random delay from the selected preset. `Needs attention` pauses the session until you start it again.

## Workbench Controls

- **Active Now** is the first place to check. It shows current sessions, queued work, ready profiles, and attention profiles.
- **Phone Control** shows which controls are available: Multilogin lifecycle controls through xcli/API, and optional Android inside-phone controls through ADB.
- **Assistive Controller** is the accessibility work surface for the selected phone. It has large explicit commands for viewer, X app launch, X-aware scrolling, screenshots, Back/Home, tap point, and draft typing.
- The **Phone Control** setup card opens the selected phone, watches the Mac clipboard for Multilogin ADB commands, verifies connected devices, and can test the control channel with a screenshot.
- The ADB setup form accepts the two commands Multilogin shows from the green Android icon: `adb connect IP:PORT` and, when required, `adb -s IP:PORT shell glogin PASSWORD`.
- **My Profiles** shows profiles sorted by urgency: running, starting, stopping, attention, setup, cooldown, then ready.
- My Profiles cards show local state, Multilogin state, start time, auto-stop countdown, prompt state, and warnings.
- My Profiles actions let you select a profile, start it, open Viewer, queue a local task, stop it, and use Open X only when Android inside-phone controls are ready. Before that, the card shows **Setup control** and jumps to Phone Control.
- **Open Next Ready Profile** selects the next profile in the Ready bucket, starts the local work session, and opens X for mobile profiles.
- **Cooldown 1h** marks the selected profile as resting locally so it is skipped by the next-ready picker.
- **Clear Issue** returns the selected profile to Ready.
- Recovery buttons mark the selected profile with a local setup or attention state: login needed, X missing, stuck store, wrong screen, or frozen phone.
- Profile buckets make it clear which profiles are ready, active, resting, waiting for setup, or blocked by an issue.
- **Advanced tools** reveals the older profile console, operator queue, buckets, review queue, and draft list. It is hidden by default so the first screen stays focused on the active phone.

## Review Queue And Drafts

- Review Queue stores local links and notes for later manual review.
- Opening a review item selects its profile, sets the target URL, and starts the normal local work flow.
- Comment Drafts stores reusable text snippets and copies them to the clipboard. The app does not paste or submit comments for you.

## Queue Task Behavior

When the selected queue function is `Start profile`, the server creates a random local plan:

1. Adds `Start profile` only if there is no reusable queued/running/recent start task for that profile.
2. Adds random follow-up prompts from the selected preset.
3. Assigns each follow-up task a random scheduled time.

If a start task already exists, the server adds one random follow-up prompt instead of adding another start task.

## Task Statuses

- `queued`: ready in the active list.
- `running`: started.
- `completed`: hidden from the active list.
- `cancelled`: hidden from the active list.
- `failed`: visible until rerun, completed, or cancelled.

## Local Persistence

Operator tasks and profile sessions are stored locally in:

```txt
data/operator-state.json
```

That file is ignored by git so local session history and profile details are not pushed to GitHub.

## Terminal Control

```bash
npm run mlx -- operator
npm run mlx -- work <profile_id> review_mode
npm run mlx -- plan <profile_id> review_mode
npm run mlx -- prepare <profile_id> light_warmup
npm run mlx -- session-start <session_id>
npm run mlx -- session-done <session_id> "reviewed manually"
npm run mlx -- session-skip <session_id>
npm run mlx -- session-attention <session_id> "login needed"
npm run mlx -- session-stop <session_id>
```

## Mobile Cloud-Phone Controls

- `Start 30m`: calls `xcli mobile-profiles-phone-start`, marks the profile running locally, and sets a 30-minute auto-stop timer. If Multilogin rejects background start, it automatically launches Viewer instead and keeps the same timer.
- `Viewer`: calls `xcli mobile-phone-launch` and opens the visible cloud-phone window. If Multilogin returns an unclear launch URL response, the profile is still tracked locally with a warning.
- `Open X app`: launches the installed Android X app with ADB, using `com.twitter.android` by default. This button is disabled until a cloud phone is connected for Android inside-phone control.
- `Install X`: calls `xcli mobile-profiles-app-install` for Multilogin's `X(Twitter)` app and the selected mobile group.
- `Stop`: calls both `xcli mobile-phone-shutdown` and `xcli mobile-profiles-phone-stop` because Multilogin separates visible phone shutdown from the mobile proxy-start path.
- `Manual command`: runs one explicit Android command selected by the operator, such as `Open X app`, `Scroll review`, or `Scroll 3x`, and records the result on the profile.
- `Assistive Controller`: runs one explicit user-chosen Android command at a time. The main Scroll buttons foreground the X Android app before swiping. Draft typing only types text into the focused field on the phone; it does not decide what to say or submit content by itself.

Multilogin may reject the background start path with an internal server error for some profiles. In that case the dashboard falls back to `Viewer`, which is the documented cloud-phone launch path.

Multilogin/xcli handles profile lifecycle only: list, status, start, visible viewer, stop, and app installation. App launch and swipes happen inside Android, so the dashboard uses Multilogin's documented ADB cloud-phone feature for those commands. If more than one ADB device is connected, choose the device in the Assistive Controller dropdown or map the profile with `MULTILOGIN_ADB_SERIAL_<profile_id>` / `MULTILOGIN_ADB_SERIALS`.

Started or opened profiles are tracked locally with `autoStopAt`. The server checks that field and requests a Multilogin stop when the 30-minute window expires.

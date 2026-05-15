# Operator Console

The Operator Console is the main work surface for local profile sessions.

## What It Does

- Syncs real Multilogin browser profiles and mobile cloud-phone profiles.
- Queues local tasks per profile.
- Runs allowed Multilogin lifecycle controls: start and stop.
- Tracks manual review tasks, notes, statuses, delays, and scheduled times.
- Keeps completed and cancelled tasks out of the active task list.

## Queue Task Behavior

When the selected function is `Start profile`, the dashboard creates a short local plan:

1. Adds `Start profile` once for the selected profile.
2. Adds 4-7 random follow-up tasks.
3. Assigns each follow-up task a random delay between 10 and 230 seconds.

Random follow-up task types:

- `Scroll prompt`
- `Open post prompt`
- `Like review prompt`
- `Repost review prompt`
- `Comment draft prompt`

These are local prompts and records. They do not click, scroll, like, repost, comment, or save on X or any other third-party platform.

## Task Statuses

- `queued`: ready in the active list.
- `running`: started.
- `completed`: hidden from the active list.
- `cancelled`: hidden from the active list.
- `failed`: visible until rerun, completed, or cancelled.

## Mobile Cloud-Phone Controls

- `Start Bg`: calls `xcli mobile-profiles-phone-start`.
- `Viewer`: calls `xcli mobile-phone-launch` and opens the visible cloud-phone window.
- `Stop`: calls `xcli mobile-phone-shutdown`.

Multilogin may reject `Start Bg` with an internal server error for some profiles. In that case use `Viewer`, which is the documented cloud-phone launch path.

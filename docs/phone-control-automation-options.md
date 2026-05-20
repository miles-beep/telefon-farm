# Phone Control Automation Options

Last checked: May 18, 2026

## What Multilogin Can Automate Directly

The public Postman API and local `xcli` can automate profile lifecycle work:

- Sync/list profiles
- Start and stop browser profiles
- Start and stop mobile cloud phones through `xcli`
- Open the mobile phone viewer through `xcli`
- Install available mobile apps for a phone group through `xcli`
- Read profile status

## What Multilogin Does Not Currently Expose Publicly

The public Postman collection does not include documented endpoints for:

- Enabling ADB
- Returning ADB IP, port, or `glogin` password
- Launching a specific installed Android package
- Scrolling, tapping, typing, or taking screenshots inside the Android cloud phone

The local `xcli` help also does not expose an ADB-enable or ADB-credential command. The Multilogin help article says ADB is enabled from the desktop app and the connection/auth commands are copied from the green Android icon.

## Best Path For This Dashboard

Use Multilogin for safe profile identity and lifecycle. Use ADB/Appium for inside-phone assistive control after the phone is connected.

The dashboard should hide the difficult pieces behind one flow:

1. Select one real phone.
2. Click one start button that opens the visible phone and starts watching for ADB connection details.
3. Once ADB is connected, show only useful controls: Open X, Scroll, Screenshot, Back, Home, Tap, Type Draft.
4. Keep likes, reposts, saves, comments, and follows as explicit user-directed commands or draft helpers.
5. Auto-stop the phone after the local session timeout.

## Ways To Reduce Or Remove Manual ADB Setup

### Option 1: Remember ADB Details Per Running Session

When Multilogin exposes the ADB commands once, the dashboard can store the address for that phone and reconnect automatically while the same cloud phone session is alive. This does not survive stopping the phone because Multilogin says ADB turns off when the cloud phone stops.

### Option 2: Clipboard Watcher

The dashboard can watch the Mac clipboard and connect automatically when it sees either:

```bash
adb connect IP:PORT
adb -s IP:PORT shell glogin PASSWORD
```

This reduces the setup to one copy action from Multilogin, but it still requires Multilogin to expose the green Android icon.

### Option 3: Ask Multilogin Support For The ADB API

If Multilogin has a private or upcoming endpoint for enabling ADB and returning connection credentials, using that endpoint would be the cleanest solution. Ask specifically for:

- API endpoint to enable ADB for a running mobile cloud phone
- API response fields for ADB host, port, and authentication password/token
- Whether the endpoint is stable and allowed for automation

### Option 4: Inspect Desktop App Network Traffic

It may be possible to find an undocumented endpoint used by the desktop app when clicking Enable ADB. This could remove the manual step, but it is fragile and may break after Multilogin updates. It should only be used if Multilogin support confirms it is allowed.

### Option 5: macOS UI Automation

macOS Accessibility automation could click the Multilogin UI and copy the ADB command. This is a last resort because it needs Accessibility permission and is more brittle than an API.

## Recommendation

Build the production flow around Option 2 now, while asking Multilogin for Option 3. If Multilogin confirms an ADB API, replace the clipboard step with a direct backend call. Do not build the main workflow around macOS mouse automation unless there is no other path.

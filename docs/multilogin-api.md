# Multilogin API Adapter

Source docs:

```txt
https://documenter.getpostman.com/view/28533318/2s946h9Cv9
```

Additional Multilogin references:

```txt
https://multilogin.com/help/en_US/multilogin-x
https://multilogin.com/help/en_US/common-issues/agent-connection-issue
https://multilogin.com/help/en_US/api
https://multilogin.com/help/en_US/postman/automation-token
https://multilogin.com/help/en_US/getting-started-with-postman
```

The Postman collection is for the Multilogin API. It includes launcher endpoints, profile management, browser profile data, proxy, pre-made cookies, script runner, import/export, object storage, bookmarks, and 2FA. The Multilogin X help center also describes the desktop app as acting as the agent and highlights local network access for dashboard-agent communication.

This project implements a guarded profile-lifecycle adapter. It exposes profile search, status diagnostics, and start/stop controls for profiles you manually operate. It does not expose quick profile creation, profile mutation, proxy operations, cookie operations, script execution, 2FA mutation, or third-party website automation.

## Configuration

The adapter is disabled by default.

```bash
MULTILOGIN_ENABLED=true npm start
```

For cloud endpoints that require a bearer token:

```bash
MULTILOGIN_ENABLED=true MULTILOGIN_TOKEN="your_token" npm start
```

Optional overrides:

```bash
MULTILOGIN_CLOUD_BASE_URL="https://api.multilogin.com"
MULTILOGIN_LAUNCHER_BASE_URL="https://launcher.mlx.yt:45001"
MULTILOGIN_XCLI_PATH="~/mlx/deps/cli/xcli"
MULTILOGIN_TIMEOUT_MS=8000
```

The default launcher URL uses local port `45001`, matching the local launcher/agent style documented by Multilogin. Mobile cloud phones are read through the local Multilogin CLI (`xcli`) because they are separate from the browser-profile `POST /profile/search` response. If the desktop app or agent cannot be reached, first confirm local network access for `127.0.0.1` and that the Multilogin desktop app or agent is running.

## Local Routes

```txt
GET  /api/multilogin
GET  /api/multilogin/profiles
POST /api/multilogin/read-only
POST /api/multilogin/profiles/:profileId/start
POST /api/multilogin/profiles/:profileId/stop
```

Example body:

```json
{
  "operation": "launcherVersion"
}
```

## Implemented Read-Only Operations

- `launcherVersion`: `GET /api/v1/version`
- `allProfileStatuses`: `GET /api/v1/profile/statuses`
- `quickProfileStatuses`: `GET /api/v1/profile/quick/statuses`
- `loadedBrowserCores`: `GET /api/v1/loaded_browser_cores`
- `browserCoreList`: `GET /bcs/core/list`
- `userWorkspaces`: `GET /user/workspaces`
- `workspaceRestrictions`: `GET /workspace/restrictions`
- `workspaceFolders`: `GET /workspace/folders`
- `workspaceStatistics`: `GET /workspace/statistics`

## Implemented Control Operations

- Browser profile search: `POST /profile/search`
- Browser profile status: `GET /api/v1/profile/status/p/:profile_id`
- Browser profile start: `GET /api/v2/profile/f/:folder_id/p/:profile_id/start`
- Browser profile stop: `GET /api/v1/profile/stop/p/:profile_id`
- Mobile cloud phone list: `xcli mobile-profiles-phone-list`
- Mobile cloud phone background start: `xcli mobile-profiles-phone-start --ids <profile_id>`
- Mobile cloud phone stop: `xcli mobile-phone-shutdown --ids <profile_id>`
- Mobile cloud phone visible viewer: `xcli mobile-phone-launch --ids <profile_id>`
- Mobile X app install: `xcli mobile-profiles-app-install --id <app_id> --version_id <version_id> --install_group_ids <group_id>`

## Explicitly Not Implemented

- Real social-platform scrolling, liking, saving, commenting, or reposting
- Quick profile creation
- Profile create/update/remove/clone/move/restore
- Proxy generation, validation, or assignment
- Cookie import/export or pre-made cookie management
- Script Runner start/stop
- Profile import/export
- Object storage mutation
- Bookmark import/copy/export
- 2FA setup, verification, backup code, or device mutation

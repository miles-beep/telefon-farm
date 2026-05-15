# Postman Setup

Official Multilogin references:

- Automation token: `https://multilogin.com/help/en_US/postman/automation-token`
- Getting started with Postman: `https://multilogin.com/help/en_US/getting-started-with-postman`
- Multilogin X overview: `https://multilogin.com/help/en_US/multilogin-x`
- Agent connection troubleshooting: `https://multilogin.com/help/en_US/common-issues/agent-connection-issue`
- API collection: `https://documenter.getpostman.com/view/28533318/2s946h9Cv9`

## Import

Import these files into Postman:

```txt
postman/telephones-project.postman_collection.json
postman/telephones-project.postman_environment.json
```

Select the environment named `Telephones Project Local + Multilogin`.

## Token Flow

1. Set `mlxEmail`.
2. Set `mlxPasswordMd5` to the MD5 hash of your Multilogin password.
3. Run `Multilogin Token Setup / User Sign In`.
4. Run `Get User Workspaces` if you need a workspace ID.
5. If needed, set `workspaceId` and run `User Refresh Token - Switch Workspace`.
6. Set `expirationPeriod` to one of `1h`, `3h`, `5h`, `16h`, `24h`, `48h`, `1w`, `2w`, `3w`, `1mo`, or `no_exp`.
7. Run `Workspace Automation Token`.

The collection scripts save:

- `token`
- `refreshToken`
- `automationToken`

## Local App Integration

The local app does not read tokens from Postman directly. To use the generated automation token through the dashboard, restart the app with:

```bash
MULTILOGIN_ENABLED=true MULTILOGIN_TOKEN="paste_automation_token_here" npm start
```

Then open:

```txt
http://localhost:5177
```

## Boundary

The Postman collection includes token setup, local dashboard API routes, and Multilogin diagnostics. The app now supports local profile lifecycle controls from the dashboard and CLI, but it intentionally excludes real social-platform actions, quick profile creation, proxy changes, cookies, script runner, profile mutation, import/export, object storage mutation, bookmarks, and 2FA mutation.

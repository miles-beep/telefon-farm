# Project Breakdown

## Goal

Build an easy local dashboard for monitoring Multilogin profiles. The dashboard is for seeing real browser profiles and mobile cloud phones, starting/stopping them for manual use, and keeping any local review records separate from real websites.

## Safety Boundaries

- No real X, TikTok, YouTube, Reddit, Instagram, Facebook, LinkedIn, or other social platform actions.
- No ban evasion, stealth behavior, or platform rule bypassing.
- No real credentials, SMS verification, cookies, proxies, or anti-detect profile mutation.
- Profile lifecycle control is limited to Multilogin start/stop.
- All save, comment, repost, like, follow, login, and logout records stay inside this local app.

## Main Dashboard Areas

1. **Profiles**
   - Real Multilogin browser profiles
   - Real Multilogin mobile cloud phones
   - Start/stop controls
   - Status, device, folder, and serial details

2. **Operator Console**
   - Profile Operator and Review Tracker agents
   - Queued tasks with run/done/cancel states
   - Safe executable controls for start/stop
   - Manual X review task tracking without browser-content automation
   - Random plan generation after `Start profile`: one start task, then 4-7 random local prompts
   - Done/cancel removes tasks from the active operator list

3. **Post Queue**
   - Empty by default
   - Local-only records if demo mode is explicitly enabled

4. **Saved And Comments**
   - Local-only saved posts, comments, and repost notes
   - No write-through to third-party platforms

5. **Review Task**
   - Local sandbox task records only
   - Disabled by default through empty local state

6. **Detection And Health**
   - Local scoring panels remain available for demo mode
   - Real Multilogin profile state is shown separately

## Multilogin Context

The project exposes Multilogin profile search and start/stop controls. Browser profiles use the documented Multilogin API and local launcher. Mobile cloud phones use Multilogin's local `xcli`. The adapter does not mutate profiles, assign proxies, import cookies, run scripts, or perform social-platform actions.

# How to install apps on Android cloud phones

Source: https://multilogin.com/help/en_US/cloud-phones/how-to-install-apps-on-mobile-profiles
Updated: May 14, 2026

> Local reference note: this is a summarized working note, not a verbatim copy of the Multilogin article. Open the source URL for the full official article.

## Summary

Explains installing mobile applications on cloud phones from Multilogin’s app library, including choosing apps and applying them to mobile profiles or groups.

## Key Takeaways

- Apps can be installed from Multilogin’s mobile app library.
- Installation is tied to mobile phone groups/profiles, not browser profiles.
- Our current xcli path supports listing apps and installing an app version for a mobile group.
- App installation should be treated as setup/recovery, not as a running engagement action.

## Dashboard / API Notes

- Current code has Install X support via xcli app list/install; preserve group ID handling.
- When X is missing, mark profile state x_missing and offer Install X as a recovery action.
- Surface app install warnings in Live Agent.

## Official Article Sections

- Find apps
- Install apps
- Install to mobile profiles/groups
- Troubleshooting app install

## Source

- [How to install apps on Android cloud phones](https://multilogin.com/help/en_US/cloud-phones/how-to-install-apps-on-mobile-profiles)

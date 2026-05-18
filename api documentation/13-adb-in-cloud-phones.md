# How to use ADB (Android Debug Bridge) in cloud phones

Source: https://multilogin.com/help/en_US/cloud-phones/adb-in-cloud-phones
Updated: May 14, 2026

> Local reference note: this is a summarized working note, not a verbatim copy of the Multilogin article. Open the source URL for the full official article.

## Summary

Explains enabling ADB for running cloud phones and connecting from a terminal with adb connect plus Multilogin authentication.

## Key Takeaways

- ADB lets a computer send commands to a running Android cloud phone.
- Use cases include APK installation, automation tooling, file movement, logs, and screenshots.
- The cloud phone must be started before ADB is enabled.
- ADB connection details include IP, port, and password copied from the green Android icon.
- ADB can be enabled for up to 50 running phones at once; stopping a phone disables ADB.

## Dashboard / API Notes

- ADB is likely the right future path for more reliable visible control than macOS mouse gestures.
- Do not store ADB passwords in git or permanent logs.
- Potential future feature: ADB status/check panel for active profiles.

## Official Article Sections

- Get your environment ready
- Start your cloud phone
- Enable ADB
- Connect from your terminal
- FAQ

## Source

- [How to use ADB (Android Debug Bridge) in cloud phones](https://multilogin.com/help/en_US/cloud-phones/adb-in-cloud-phones)

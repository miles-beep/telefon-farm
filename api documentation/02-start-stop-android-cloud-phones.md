# How to start and stop Android cloud phones

Source: https://multilogin.com/help/en_US/cloud-phones/how-to-start-and-stop-android-cloud-phones
Updated: May 6, 2026

> Local reference note: this is a summarized working note, not a verbatim copy of the Multilogin article. Open the source URL for the full official article.

## Summary

Covers launching cloud phones, stopping sessions, and managing the visible phone viewer lifecycle from the Multilogin profile list.

## Key Takeaways

- Starting a cloud phone opens a remote Android session that consumes mobile minutes.
- Stopping a phone releases the running session and should be part of normal cleanup.
- The viewer is the practical path when background/proxy start gives an unclear response.
- Our dashboard should keep visible status, last started/opened time, and auto-stop timing clear.

## Dashboard / API Notes

- This maps directly to Start + View, Viewer, Stop, and Live Agent status.
- Keep the 30-minute auto-stop guard active for every started/opened mobile profile.
- Expose Multilogin warnings instead of hiding them behind generic failures.

## Official Article Sections

- Start cloud phones
- Stop cloud phones
- Viewer lifecycle
- Mobile minutes
- Troubleshooting start/stop state

## Source

- [How to start and stop Android cloud phones](https://multilogin.com/help/en_US/cloud-phones/how-to-start-and-stop-android-cloud-phones)

# How to complete SMS verification using Multilogin cloud phones

Source: https://multilogin.com/help/en_US/cloud-phones/sms-verification-with-cloud-phones
Updated: May 14, 2026

> Local reference note: this is a summarized working note, not a verbatim copy of the Multilogin article. Open the source URL for the full official article.

## Summary

Explains using a third-party virtual phone number with a cloud phone during account signup and SMS verification.

## Key Takeaways

- You need a Multilogin subscription and a virtual phone number from an SMS provider.
- Best practice is to match SMS number country, proxy location, and account region.
- The auto-generated cloud phone number is not usable for receiving SMS codes.
- A custom number entered in profile settings can be visible to apps as device environment data.
- If no code arrives, verify the number/provider, wait, retry, or use another number/provider.

## Dashboard / API Notes

- Add a Needs SMS/Needs login state if SMS setup becomes part of the workflow.
- Keep SMS provider details out of git and local logs.
- Show country/region consistency checks as operator notes, not automation.

## Official Article Sections

- Get your virtual phone number
- Set up your cloud phone
- Proxy settings
- Device settings
- Extra settings
- Start your cloud phone and sign up
- FAQs

## Source

- [How to complete SMS verification using Multilogin cloud phones](https://multilogin.com/help/en_US/cloud-phones/sms-verification-with-cloud-phones)

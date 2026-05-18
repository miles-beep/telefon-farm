# How to export and import (bulk create) cloud phones

Source: https://multilogin.com/help/en_US/cloud-phones/export-import-bulk-create-cloud-phones
Updated: May 5, 2026

> Local reference note: this is a summarized working note, not a verbatim copy of the Multilogin article. Open the source URL for the full official article.

## Summary

Documents exporting cloud phone setups to XLSX and importing or bulk creating phones from XLSX templates.

## Key Takeaways

- Export and import are intended for backup, restore, and creating many cloud phones from a template.
- Exported data includes profile settings, notes, tags, and folder assignment.
- Export and bulk creation are limited to 100 cloud phones at a time.
- Bulk upload validates each row and reports success or errors before confirmation.
- Bulk creation differs from cloning because each row can have custom details.

## Dashboard / API Notes

- A future bulk dashboard feature should treat XLSX as an import/export artifact, not internal JSON state.
- Validation errors should be shown per row if implemented locally.
- If import fails, one known workaround is removing folder_id values from the XLSX before retrying.

## Official Article Sections

- What this feature is for
- Limitations
- How to export cloud phones
- How to import cloud phones
- FAQs

## Source

- [How to export and import (bulk create) cloud phones](https://multilogin.com/help/en_US/cloud-phones/export-import-bulk-create-cloud-phones)

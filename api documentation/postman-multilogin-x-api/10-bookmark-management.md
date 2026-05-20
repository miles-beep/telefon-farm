# Bookmark Management

Source: Multilogin Postman collection (caee91dd-0a38-4db6-8f66-e65db86c1a2a)
Generated locally: 2026-05-18

Bookmark management allows you to properly manage your bookmarks in given profiles. It includes importing/exporting/copying bookmarks from one profile to another.

Bookmarks are exported by default to the following directories:

- Windows: `C:\Users\%username%\mlx\bookmarks`

- macOS: `/Users/%username%/mlx/bookmarks`

- Linux: `/home/%username%/mlx/bookmarks`

## Endpoints

### Export Bookmarks

`GET https://launcher.mlx.yt:45001/api/v1/profile/:profile_id/bookmarks/export`

Export bookmarks from a given profile.

Bookmarks are exported by default to the following directories:

- Windows: `C:\Users\%username%\mlx\bookmarks`

- macOS: `/Users/%username%/mlx/bookmarks`

- Linux: `/home/%username%/mlx/bookmarks`

**Path Variables**

| Key | Value | Description |
| --- | --- | --- |
| profile_id | uuid | `Required`. Specify the profile ID to export bookmarks. |

**Responses**

- Bookmarks Exported (200)

```json
{
    "data": {
        "path": "C:\\Users\\Andrey Nguyen\\mlx\\bookmarks\\f0988059-405d-4b91-9fd9-5370e2aecc86_2025-07-09_14-30-27.json"
    },
    "status": {
        "error_code": "",
        "http_code": 200,
        "message": "Bookmarks successfully exported"
    }
}
```

### Import Bookmarks

`POST https://launcher.mlx.yt:45001/api/v1/profile/:profile/bookmarks/import`

Import bookmarks into a profile.

**Path Variables**

| Key | Value | Description |
| --- | --- | --- |
| profile |  |  |

**Query Params**

| Key | Value | Description |
| --- | --- | --- |
| paths | ["path/to/exported_bookmarks_1", "path/to/exported_bookmarks_2"] | `Required`. Path to a JSON file containing bookmarks |
| operation | "override", "append" | `Required`. Specify what to do with exported bookmarks. |

**Request Body**

```json
{
  "paths": [
    "string" // a path to a JSON file containing bookmarks.
  ],
  "operation": "override" // Possible values are 'override' and 'append'
}
```

**Responses**

- Bookmarks Imported (200)

```json
{
    "status": {
        "error_code": "",
        "http_code": 200,
        "message": "Bookmarks successfully imported"
    }
}
```

### Copy Bookmarks

`POST https://launcher.mlx.yt:45001/api/v1/profile/:profile_id/bookmarks/copy/:source_profile_id`

Copy bookmarks from one profile to another.

**Path Variables**

| Key | Value | Description |
| --- | --- | --- |
| profile_id | "uuid" | `Required`. Specify profile_id |
| source_profile_id | "uuid" | `Required`. Specify source_profile_id |

**Query Params**

| Key | Value | Description |
| --- | --- | --- |
| paths | ["path/to/exported_bookmarks_1", "path/to/exported_bookmarks_1"] | `Required`. Path to a JSON file containing bookmarks. |
| operation | "override", "append" | `Required`. Specify what to do with exported bookmarks. |

**Request Body**

```json
{
  "paths": [
    "string" // a path to a JSON file containing bookmarks.
  ],
  "operation": "override" // Possible values are 'override' and 'append'
}
```

**Responses**

- Bookmarks Copied (200)

```json
{
    "status": {
        "error_code": "",
        "http_code": 200,
        "message": "Bookmarks successfully imported"
    }
}
```

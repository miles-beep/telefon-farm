# Profile Import/Export

Source: Multilogin Postman collection (caee91dd-0a38-4db6-8f66-e65db86c1a2a)
Generated locally: 2026-05-18

A set of endpoints that allows exporting and importing profiles from the machine.

Profiles are exported by default to the following directories:

- Windows: `C:\Users\%username%\mlx\exports`

- macOS: `/Users/%username%/mlx/exports`

- Linux: `/home/%username%/mlx/exports`

To change the default directory, navigate to the following directory and add `ExportDirectory`, specifying the desired directory
in `launcher.yaml`:

- Windows: `C:\Users\%username%\mlx\configs\launcher.yaml`

- macOS: `/Users/%username%/mlx/configs/launcher.yaml`

- Linux: `/home/%username%/mlx/configs/launcher.yaml`

```json
ExportDirectory: "/Users/username/mlx/new_dir_for_exports"

```

## Endpoints

### Profile Export

`POST https://launcher.mlx.yt:45001/api/v1/profile/:profile_id/export`

Export a profile.

Profiles are exported by default to the following directories:

- Windows: `C:\Users\%username%\mlx\exports`

- macOS: `/Users/%username%/mlx/exports`

- Linux: `/home/%username%/mlx/exports`

**Path Variables**

| Key | Value | Description |
| --- | --- | --- |
| profile_id | uuid | `Required`. Specify the profile ID to export. |

**Responses**

- Export Profile (200)

```json
{
    "data": {
        "export_id": "4c5e6865-8cc9-4726-83c5-04bd0ca4abff",
        "export_path": "C:\\Users\\username\\mlx\\exports\\4c5e6865-8cc9-4726-83c5-04bd0ca4abff.zip",
        "message": "",
        "profile_id": "cb9b47d8-5549-4f67-8de1-f4c1062070ee",
        "status": "running",
        "timestamp": 1737527400029
    },
    "status": {
        "error_code": "",
        "http_code": 200,
        "message": "Export in progress"
    }
}
```

### Export Status by Profile

`GET https://launcher.mlx.yt:45001/api/v1/profile/exports/:export_id/status`

Get status of profile export by export ID.

**Path Variables**

| Key | Value | Description |
| --- | --- | --- |
| export_id |  | `Required`. Specify the export operation ID. |

**Responses**

- Export Status by Profile (200)

```json
{
    "data": {
        "export_id": "4c5e6865-8cc9-4726-83c5-04bd0ca4abff",
        "export_path": "C:\\Users\\Andrey Nguyen\\mlx\\exports\\4c5e6865-8cc9-4726-83c5-04bd0ca4abff",
        "message": "",
        "profile_id": "cb9b47d8-5549-4f67-8de1-f4c1062070ee",
        "status": "done",
        "timestamp": 1737527400051
    },
    "status": {
        "error_code": "",
        "http_code": 200,
        "message": ""
    }
}
```

### Export Status All

`GET https://launcher.mlx.yt:45001/api/v1/profile/exports/statuses`

Get status of all export profile operations.

**Responses**

- Export Status by Profile (200)

```json
{
    "data": {
        "statuses": [
            {
                "export_id": "4c5e6865-8cc9-4726-83c5-04bd0ca4abff",
                "export_path": "C:\\Users\\Andrey Nguyen\\mlx\\exports\\4c5e6865-8cc9-4726-83c5-04bd0ca4abff",
                "message": "",
                "profile_id": "cb9b47d8-5549-4f67-8de1-f4c1062070ee",
                "status": "done",
                "timestamp": 1737527400051
            },
            {
                "export_id": "4c5e6865-8cc9-4726-83c5-04bd0ca4abff",
                "export_path": "C:\\Users\\Andrey Nguyen\\mlx\\exports\\4c5e6865-8cc9-4726-83c5-04bd0ca4abff",
                "message": "",
                "profile_id": "ae9b46y1-2213-4f67-8de1-f4c1062071te",
                "status": "done",
                "timestamp": 1737527400999
            }
        ]
    },
    "status": {
        "error_code": "",
        "http_code": 200,
        "message": ""
    }
}
```

### Profile Import

`POST https://launcher.mlx.yt:45001/api/v1/profile/import`

Import a profile.

Specify `is_local` to indicate a profile type (local or cloud).

**Query Params**

| Key | Value | Description |
| --- | --- | --- |
| import_path | uuid | `Required`. Specify the path to the profile in the zip format. |
| is_local | true, false | `Required`. Specify the type of the imported profile. |

**Request Body**

```json
{
    "import_path": "<string>",
    "is_local": <boolean>
}
```

**Responses**

- Profile Import (200)

```json
{
    "data": {
        "export_id": "64bef708-dc22-40e9-9dcb-b208c7d1a0c2f",
        "import_id": "e85c67a7-9b4e-448e-990a-c03dccef4eaa",
        "import_path": "C:\\Users\\username\\mlx\\exports\\64bef708-dc22-40e9-9dcb-b208c7d1a0c2.zip",
        "message": "",
        "status": "running",
        "timestamp": 1737527403891
    },
    "status": {
        "error_code": "",
        "http_code": 200,
        "message": "Import in progress"
    }
}
```

### Import Status by Profile

`GET https://launcher.mlx.yt:45001/api/v1/profile/imports/:import_id/status`

Get status of profile import by export ID.

**Path Variables**

| Key | Value | Description |
| --- | --- | --- |
| import_id |  | `Required`. Specify the import operation ID. |

**Responses**

- Import Status by Profile (200)

```json
{
    "data": {
        "export_id": "e3745e38-f0e4-4123-979e-117d15f1313f",
        "extracted_path": "",
        "import_id": "76316840-0e68-4823-b2d5-006f9f6ba2d1",
        "import_path": "C:\\Users\\username\\mlx\\exports\\e3745e38-f0e4-4123-979e-117d15f1313f.zip",
        "message": "",
        "new_profile_id": "473d3c01-2dac-434e-b2e7-91fc9186ef29",
        "status": "done",
        "timestamp": 1737527785107
    },
    "status": {
        "error_code": "",
        "http_code": 200,
        "message": ""
    }
}
```

### Import Status All

`GET https://launcher.mlx.yt:45001/api/v1/profile/imports/statuses`

Get status of profile import operations.

**Responses**

- Import Status All (200)

```json
{
    "data": {
        "statuses": [
            {
                "export_id": "4c5e6865-8cc9-4726-83c5-04bd0ca4abff",
                "extracted_path": "",
                "import_id": "5319ed99-bbfc-4aca-ac6d-16a0fd80314d",
                "import_path": "C:\\Users\\username\\mlx\\exports\\4c5e6865-8cc9-4726-83c5-04bd0ca4abff.zip",
                "message": "",
                "new_profile_id": "74886a96-46b5-4478-874e-1c73159ccad1",
                "status": "done",
                "timestamp": 1737527766622
            },
            {
                "export_id": "4c5e6865-8cc9-4726-83c5-04bd0ca4abff",
                "extracted_path": "",
                "import_id": "e85c67a7-9b4e-448e-990a-c03dccef4eaa",
                "import_path": "C:\\Users\\username\\mlx\\exports\\4c5e6865-8cc9-4726-83c5-04bd0ca4abff.zip",
                "message": "",
                "new_profile_id": "9642a718-b56d-4b2a-8e08-312e61c34923",
                "status": "done",
                "timestamp": 1737527404731
            },
            {
                "export_id": "e3745e38-f0e4-4123-979e-117d15f1313f",
                "extracted_path": "",
                "import_id": "76316840-0e68-4823-b2d5-006f9f6ba2d1",
                "import_path": "C:\\Users\\username\\mlx\\exports\\e3745e38-f0e4-4123-979e-117d15f1313f.zip",
                "message": "",
                "new_profile_id": "473d3c01-2dac-434e-b2e7-91fc9186ef29",
                "status": "done",
                "timestamp": 1737527785107
            }
        ]
    },
    "status": {
        "error_code": "",
        "http_code": 200,
        "message": ""
    }
}
```

# Script Runner

Source: Multilogin Postman collection (caee91dd-0a38-4db6-8f66-e65db86c1a2a)
Generated locally: 2026-05-18

Multilogin X Script Runner is an easy-to-use solution for running automation scripts with minimal technical knowledge, that allows bulk operations on single or/and multiple profiles.

Script Runner is available with Agent 1.37.4 onwards. Once Agent is updated, all the required folders and files will be downloaded from our server automatically.

The Script Runner binary is located in the following directories:

- Windows: `C:\Users\%username%\mlx\deps\script_runner`

- macOS: `/Users/%username%/mlx/deps/script_runner`

- Linux: `/home/%username%/mlx/deps/script_runner`

Scripts are stored by default in the following directories:

- Windows: `C:\Users\%username%\mlx\deps\scripts`

- macOS: `/Users/%username%/mlx/deps/scripts`

- Linux: `/home/%username%/mlx/deps/scripts`

As of December 2024, Agent will download example scripts automatically upon every launch. These scripts are stored on our servers and are for reference only.

To change the default directories for Script Runner and scripts, navigate to the following directories and change the values of `scriptrunnerpath` and `scriptsdirpath` in `launcher.yaml`:

- Windows: `C:\Users\%username%\mlx\configs\launcher.yaml`

- macOS: `/Users/%username%/mlx/configs/launcher.yaml`

- Linux: `/home/%username%/mlx/configs/launcher.yaml`

## Endpoints

### Start Browser Profile with Selenium

`GET https://launcher.mlx.yt:45001/api/v1/profile/f/:folder_id/p/:profile_id/start?automation_type=selenium`

Start a browser profile with `automation_type=selenium`

The endpoint will return a port for automation in the response message, that will be used to start Script Runner on active profiles.

**Path Variables**

| Key | Value | Description |
| --- | --- | --- |
| folder_id | uuid | `Required`. Specify the ID of the folder where the profile to launch is stored. |
| profile_id | uuid | `Required`. Specify the ID of the profile to launch. |

**Query Params**

| Key | Value | Description |
| --- | --- | --- |
| automation_type | selenium |  |

**Headers**

| Key | Value | Description |
| --- | --- | --- |
| Accept | application/json |  |

**Responses**

- Profile Started (200)

```json
{
    "status": {
        "error_code": "",
        "http_code": 200,
        "message": "54499"
    }
}
```

### Start Script Runner

`POST https://launcher.mlx.yt:45001/api/v1/run_script`

Run scripts on one or multiple profiles. The endpoint allows executing scripts in two ways:

- **executing scripts on running/active profiles.**
 To use this method, start a profile with GET Start Browser Profile with Seleinum and send a request to `POST Start Runner`, passing the profile IDs in the request body. Profiles remains open after the script has been executed.

- **executing scripts along with starting profiles.**
 To use this method, send a request to `POST Start Runner`, passing the profile IDs in the request body. Profiles closes after the script has been executed.

The value of `script_file` is the name of the .py file relative to the folder.

Scripts are stored by default in the following directories:

- Windows: `C:\Users\%username%\mlx\deps\scripts`

- macOS: `/Users/%username%/mlx/scripts`

- Linux: `/home/%username%/mlx/scripts`

**Required parameters:**

```json
{
    "script_file": "",
    "profile_ids": [
        {
            "profile_id": ""
        }
    ]
}

```

**Query Params**

| Key | Value | Description |
| --- | --- | --- |
| script_file | "string.py" | `Required`. Specify the scrip file to execute. |
| profile_ids | ["profile_id": "uuid", "is_headless": "boolean"] | `Required`. Specify profiles and launch mode. |

**Headers**

| Key | Value | Description |
| --- | --- | --- |
| Accept | application/json |  |

**Request Body**

```json
{
    "script_file": "<string>",
    "profile_ids": [
        {
            "profile_id": "<string>",
            "is_headless": <boolean>
        }
    ]
}
```

**Responses**

- Script Runner Started (200)

```json
{
    "data": [
        {
            "profile_id": "8feb79fc-2b42-4d54-a3eb-f26fddd31499",
            "status": "success"
        },
        {
            "profile_id": "8feb79fc-2b42-4d54-a3eb-f26fddd31410",
            "status": "success"
        }
    ],
    "status": {
        "error_code": "",
        "http_code": 200,
        "message": ""
    }
}
```

### Stop Script Runner

`POST https://launcher.mlx.yt:45001/api/v1/profile/stop_script`

Stop scripts from executing.

**Required parameters:**

```json
{
    "profile_ids": [
        ""
    ]
}

```

**Headers**

| Key | Value | Description |
| --- | --- | --- |
| Accept | application/json |  |

**Request Body**

```json
{
    "profile_ids": [
        "<string>"
    ]
}
```

**Responses**

- Script Stopped

```json
{
    "data": [
        {
            "profile_id": "8feb79fc-2b42-4d54-a3eb-f26fddd31499",
            "status": "stopped"
        },
        {
            "profile_id": "422a436e-564c-4fa9-a29a-45b848714a78",
            "status": "stopped"
        }
    ],
    "status": {
        "error_code": "",
        "http_code": 200,
        "message": ""
    }
}
```

### Script List

`GET https://launcher.mlx.yt:45001/api/v1/scripts`

Return a list of saved scripts.

Scripts are stored by default in the following directories:

- Windows: `C:\Users\%username%\mlx\deps\scripts`

- macOS: `/Users/%username%/mlx/deps/scripts`

- Linux: `/home/%username%/mlx/deps/scripts`

**Headers**

| Key | Value | Description |
| --- | --- | --- |
| Accept | application/json |  |

**Responses**

- Script List

```json
{
    "data": [
        "example_script3.py"
    ],
    "status": {
        "error_code": "",
        "http_code": 200,
        "message": ""
    }
}
```

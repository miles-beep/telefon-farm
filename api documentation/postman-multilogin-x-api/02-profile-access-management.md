# Profile Access Management

Source: Multilogin Postman collection (caee91dd-0a38-4db6-8f66-e65db86c1a2a)
Generated locally: 2026-05-18

## Endpoints

### User Sign In

`POST https://api.multilogin.com/user/signin`

Log in to your account. The password must be hashed with the md5 algorithm.

Check out **Params** to see what each key-value pair is about.

To copy the example request body, please navigate to **Body**.

The token has 30 minutes of lifetime. Upon expiration, you may refresh it with `POST /user/refresh_token` to obtain a new one.

To have higher rate limits and a longer token lifetime, it is recommended to get the automation token.

**Query Params**

| Key | Value | Description |
| --- | --- | --- |
| email | "your_email" | `Required`. Enter your account email. |
| password | 'your_password' | `Required`. Enter your account password. |

**Headers**

| Key | Value | Description |
| --- | --- | --- |
| Content-Type | application/json |  |
| Accept | application/json |  |

**Request Body**

```json
{
  "email": "<string>",
  "password": "<string>"
}
```

**Responses**

- Signed In (500)

```json
{
    "status": {
        "error_code": "",
        "http_code": 200,
        "message": "Successful signin"
    },
    "data": {
        "refresh_token": "1234567890abcdef",
        "token": "your JWT token"
    }
}
```

### User Refresh Token (Switch Workspace)

`POST https://api.multilogin.com/user/refresh_token`

This endpoint supports both Strict and Non-Strict modes. In Strict mode, all required parameters must be explicitly specified. In contrast, Non-Strict mode allows for faster usage by applying default values to any unspecified parameters. Default values will be visible for each parameter.

Refresh the JWT token. The endpoint allows retrieving a new token if the current one has expired or switching to another workspace.

The endpoint is also used to switch to a given workspace. To get the workspace ID to switch to, refer to `GET /user/workspaces`.

Check out **Params** to see what each key-value pair is about. To copy the example request body, please navigate to **Body.**

**Required parameters for Strict mode:**

```json
{
  "email": "",
  "refresh_token": "",
  "workspace_id": ""
}

```

**Query Params**

| Key | Value | Description |
| --- | --- | --- |
| email | "your_email" | `Required`. Enter your account email. |
| refresh_token | "your_refresh_token" | `Required`. Enter your refresh token. Can be fetched with `POST user/signin`. |
| workspace_id | "uuid" | `Required`. Specify the workspace, in which you would like to work or switch to. Can be fetched with `GET /user/workspaces`. Defaults to `current sign-in workspace`. |
|  |  |  |

**Headers**

| Key | Value | Description |
| --- | --- | --- |
| Content-Type | application/json |  |
| Accept | application/json |  |
| X-Strict-Mode | boolean | Default to false. If set to true, you must specify values for all required parameters. |

**Request Body**

```json
{
  "email": "<string>",
  "refresh_token": "<string>",
  "workspace_id": "<string>"
}
```

**Responses**

- Token Refreshed (500)

```json
{
    "status": {
        "error_code": "",
        "http_code": 200,
        "message": "Token successfully updated"
    },
    "data": {
        "refresh_token": "87d1428be3571bed",
        "token": "your JWT token"
    }
}
```

### User Revoke Token

`POST https://api.multilogin.com/user/revoke_tokens`

This endpoint supports both Strict and Non-Strict modes. In Strict mode, all required parameters must be explicitly specified. In contrast, Non-Strict mode allows for faster usage by applying default values to any unspecified parameters. Default values will be visible for each parameter.

Revoke user's active tokens.

Calling the endpoint without passing any payload will revoke all the current tokens (both automation and regulaar token).

If you want to revoke a parcticular type of the token, specify it in the `"is_automation"` object.

**Required parameters for Strict mode:**

```json
"token": "",
"is_automation":

```

**Query Params**

| Key | Value | Description |
| --- | --- | --- |
| token | "token" | `Optional`. Specify the token to revoke. Defaults to `current token`. |
| is_automation | true, false | `Optional`. Specify the token type to revoke. Defaults to `false`. |

**Headers**

| Key | Value | Description |
| --- | --- | --- |
| Content-Type | application/json |  |
| Accept | application/json |  |
| X-Strict-Mode | boolean | Default to false. If set to true, you must specify values for all required parameters. |

**Request Body**

```json
{
  "token": "<string>",
  "is_automation": <boolean>
}
```

**Responses**

- Token Revoked (500)

```json
{
    "status": {
        "error_code": "",
        "http_code": 200,
        "message": "Tokens successfully revoked"
    }
}
```

### User Change Password

`POST https://api.multilogin.com/user/change_password`

Change your password. The new password must also be md5-hashed.

After the password has been changed, the current token will be revoked. To carry on, you need to log in again.

Check out **Params** to see what each key-value pair is about. To copy the example request body, please navigate to **Body**.

**Query Params**

| Key | Value | Description |
| --- | --- | --- |
| new_password | 'your_new_password' | `Required`. Enter your new password. |
| password | 'your_current_password' | `Required`. Enter your current password. |

**Headers**

| Key | Value | Description |
| --- | --- | --- |
| Content-Type | application/json |  |
| Accept | application/json |  |

**Request Body**

```json
{
  "new_password": "<string>",
  "password": "<string>"
}
```

**Responses**

- Password Changed (500)

```json
{
    "status": {
        "error_code": "",
        "http_code": 200,
        "message": "Password successfully changed"
    },
    "data": null
}
```

### User Workspaces

`GET https://api.multilogin.com/user/workspaces`

Get a list of workspaces. There may be multiple workspaces if you have been invited to join other users' workspaces.

To switch to a workspace, to which you have been invited, select the workspace ID and pass to **POST /user/refresh_token** as the value of `workspace_id`.

**Headers**

| Key | Value | Description |
| --- | --- | --- |
| Accept | application/json |  |

**Responses**

- Workspace Information Fetched (200)

```json
{
    "status": {
        "error_code": "",
        "http_code": 200,
        "message": ""
    },
    "data": {
        "total_count": 0,
        "workspaces": [
            {
                "name": "foo@bar.com",
                "role": "owner",
                "workspace_id": "598e7825-45d7-480e-9b2a-7df9338f2efd"
            }
        ]
    }
}
```

### User Token List

`GET https://api.multilogin.com/user/tokens_list`

Fetch all the active tokens for a specific account.

**Headers**

| Key | Value | Description |
| --- | --- | --- |
| Accept | application/json |  |

**Responses**

- List Fetched (200)

```json
{
    "data": {
        "tokens": [
            {
                "token": "<token>"
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

### Workspace Restrictions

`GET https://api.multilogin.com/workspace/restrictions`

Fetch the workspace details, which is currently in use. Workspace restrictions provide information on automation feature availability, allowed browser types, the number of available team members, the profile count and other valuable workspace data.

**Headers**

| Key | Value | Description |
| --- | --- | --- |
| Accept | application/json |  |

**Responses**

- Restrictions Fetched (200)

```json
{
    "status": {
        "error_code": "",
        "http_code": 200,
        "message": ""
    },
    "data": {
        "allowed_browser_types": [
            "mimic",
            "stealthfox"
        ],
        "automation_available": false,
        "cloud_profiles_count": 150,
        "expires_at": 1746677779,
        "folders_count": 1000,
        "local_profiles_count": 150,
        "plan_name": "Beta",
        "ratelimit": [
            {
                "limit_size": 50,
                "operation": "all",
                "window_size": "60s"
            }
        ],
        "team_members_count": 3
    }
}
```

### Workspace Folders

`GET https://api.multilogin.com/workspace/folders`

Get a list of available folders by workspace. Workspace_id will be taken from the token passed in the headers. If you need to switch workspaces, select the required workspace ID and call to refresh the token.

**Headers**

| Key | Value | Description |
| --- | --- | --- |
| Accept | application/json |  |

**Responses**

- Workspace Folders Fetched (500)

```json
{
    "status": {
        "error_code": "",
        "http_code": 200,
        "message": ""
    },
    "data": {
        "folders": [
            {
                "comment": "",
                "created_at": "2024-04-08T07:35:47.666168Z",
                "folder_id": "598e7825-45d7-480e-9b2a-7df9338f2efd",
                "name": "Default folder",
                "profiles_count": 73
            }
        ]
    }
}
```

### Workspace Folders For User

`GET https://api.multilogin.com/workspace/folders_for_user?email=foo@bar.com`

Get a list of available folders by workspace ID and user email.

**Query Params**

| Key | Value | Description |
| --- | --- | --- |
| email | foo@bar.com | `Required`. Specify the user's email. |

**Headers**

| Key | Value | Description |
| --- | --- | --- |
| Accept | application/json |  |

**Responses**

- User Folders Fetched (500)

```json
{
    "status": {
        "error_code": "",
        "http_code": 200,
        "message": ""
    },
    "data": {
        "folders": [
            {
                "comment": "TestingNew",
                "created_at": "2024-05-22T04:48:24.700378Z",
                "folder_id": "398568c9-f5bd-48fd-a071-5a70d74d702a",
                "name": "monitor_fresh_hills.mpp",
                "profiles_count": 0
            },
            {
                "comment": "test8",
                "created_at": "2024-05-22T04:35:53.029793Z",
                "folder_id": "aa524b74-5870-4f51-a801-6b3b5c058fd7",
                "name": "norwegian_table_dynamic.wdp",
                "profiles_count": 0
            }
        ]
    }
}
```

### Workspace Statistics

`GET https://api.multilogin.com/workspace/statistics`

Get statistics for the selected workspace.

**Headers**

| Key | Value | Description |
| --- | --- | --- |
| Accept | application/json |  |

**Responses**

- Workspace Statistics Fetched (200)

```json
{
    "status": {
        "error_code": "",
        "http_code": 200,
        "message": ""
    },
    "data": {
        "profiles_cloud_count": 73,
        "profiles_cloud_limit": 1000,
        "profiles_local_count": 0,
        "profiles_local_limit": 100,
        "users_count": 1,
        "users_limit": 1000
    }
}
```

### Workspace Automation Token

`GET https://api.multilogin.com/workspace/automation_token?expiration_period=1h,3h,5h,16h,24h,48h,1w,2w,3w,1mo,no_exp`

This endpoint supports both Strict and Non-Strict modes. In Strict mode, all required parameters must be explicitly specified. In contrast, Non-Strict mode allows for faster usage by applying default values to any unspecified parameters. Default values will be visible for each parameter.

Get automation token. Available for users who have a subscription plan with automation enabled. The token has a longer expiration period and higher rate limits.

To use the token, make certain that your account has automation enabled and retrieve the token once by calling the endpoint to save and pass it to all the endpoints to call.

For more information, visit the support page specifically dedicated to explain in detail how to work with automation tokens.

**Required parameters for Strict mode:**

```json
"expiration_period":""

```

**Query Params**

| Key | Value | Description |
| --- | --- | --- |
| expiration_period | 1h,3h,5h,16h,24h,48h,1w,2w,3w,1mo,no_exp | `Required`. Specify the token lifetime. Defaults to `24h`. |

**Headers**

| Key | Value | Description |
| --- | --- | --- |
| Accept | application/json |  |
| X-Strict-Mode | boolean | Default to false. If set to true, you must specify values for all required parameters. |

**Responses**

- Automation Token Fetched (200)

```json
{
    "status": {
        "error_code": "",
        "http_code": 200,
        "message": ""
    },
    "data": {
        "token": "your_automation_JWT_token"
    }
}
```

### Workspace Create Folder

`POST https://api.multilogin.com/workspace/folder_create`

This endpoint supports both Strict and Non-Strict modes. In Strict mode, all required parameters must be explicitly specified. In contrast, Non-Strict mode allows for faster usage by applying default values to any unspecified parameters. Default values will be visible for each parameter.

Create a new folder in the current workspace.

Check out **Params** to see what each key-value pair is about. To copy the example request body, please navigate to **Body.**

**Required parameters for Strict mode:**

```json
"name": "",
"comment":""

```

**Query Params**

| Key | Value | Description |
| --- | --- | --- |
| name | "your _folder_name" | `Required`. Name your folder. Defaults to `"New Folder"`. |
| comment | "your_folder_comment" | `Optional`. Add comments if necessary. Defaults to empty string `""`. |

**Headers**

| Key | Value | Description |
| --- | --- | --- |
| Content-Type | application/json |  |
| Accept | application/json |  |
| X-Strict-Mode | boolean | Default to false. If set to true, you must specify values for all required parameters. |

**Request Body**

```json
{
  "name": "<string>",
  "comment": "<string>"
}
```

**Responses**

- Folder Created (500)

```json
{
    "status": {
        "error_code": "",
        "http_code": 201,
        "message": "Folder successfully created"
    },
    "data": {
        "id": "aa524b74-5870-4f51-a801-6b3b5c058fd7"
    }
}
```

### Workspace Update Folder

`POST https://api.multilogin.com/workspace/folder_update`

This endpoint supports both Strict and Non-Strict modes. In Strict mode, all required parameters must be explicitly specified. In contrast, Non-Strict mode allows for faster usage by applying default values to any unspecified parameters. Default values will be visible for each parameter.

Update the folder.

**Required parameters for Strict mode:**

```json
"name": "",
"comment":"",
"folder_id":""

```

**Query Params**

| Key | Value | Description |
| --- | --- | --- |
| folder_id |  | `Required`. Specify the folder ID. |
| name |  | `Required`. Specify the new folder name. |
| comment |  | `Optional`. Add comments if necessary. Defaults to empty string `""`. |

**Headers**

| Key | Value | Description |
| --- | --- | --- |
| Content-Type | application/json |  |
| Accept | application/json |  |
| X-Strict-Mode | boolean | Default to false. If set to true, you must specify values for all required parameters. |

**Request Body**

```json
{
  "folder_id": "<string>",
  "name": "<string>",
  "comment": "<string>"
}
```

**Responses**

- Folder Changed (500)

```json
{
    "status": {
        "error_code": "",
        "http_code": 200,
        "message": "Folder successfully changed"
    },
    "data": null
}
```

### Workspace Remove Folders

`POST https://api.multilogin.com/workspace/folders_remove`

Remove folders in the current workspace.

**Query Params**

| Key | Value | Description |
| --- | --- | --- |
| ids | ["uuid"] | `Required`. Specify the folder ID to remove, |

**Headers**

| Key | Value | Description |
| --- | --- | --- |
| Content-Type | application/json |  |
| Accept | application/json |  |

**Request Body**

```json
{
  "ids": [
    "<string>"
  ]
}
```

**Responses**

- Folder Removed (500)

```json
{
    "status": {
        "error_code": "",
        "http_code": 200,
        "message": "Folders successfully removed"
    },
    "data": null
}
```

### Workspace Leave

`POST https://api.multilogin.com/workspace/leave`

Leave the selected workspace.

Check out **Params** to see what each key-value pair is about. To copy the example request body, please navigate to **Body.**

**Query Params**

| Key | Value | Description |
| --- | --- | --- |
| workspace_id | "uuid" | `Required`. Specify the workspace, which you would like to leave. |

**Headers**

| Key | Value | Description |
| --- | --- | --- |
| Content-Type | application/json |  |
| Accept | application/json |  |

**Request Body**

```json
{
  "workspace_id": "<string>"
}
```

**Responses**

- Workspace Left (500)

```json
{
    "status": {
        "error_code": "",
        "http_code": 200,
        "message": "Workspace successfully left"
    },
    "data": null
}
```

# Object Storage

Source: Multilogin Postman collection (caee91dd-0a38-4db6-8f66-e65db86c1a2a)
Generated locally: 2026-05-18

This feature enables file uploads and downloads from internal storage. It is available only on select plan tiers, depending on the plan’s permissions and entitlements.

## Endpoints

### Upload Object

`POST https://launcher.mlx.yt:45001/api/v1/object_storage/upload`

This endpoint allows you to upload an object to the storage.

**Query Params**

| Key | Value | Description |
| --- | --- | --- |
| object_type_id | <string> | `Required`. The ID of the object type |
| object_path | <string> | `Required`. The path of the object. |
| storage_type | <string> | `Required`. The type of storage. |
| object_meta | <string> | `Optional`. The object meta data. |
| encrypt | <boolean> | `Optional`. Encryption value |

**Request Body**

```json
{
    "object_type_id": "<string>",
    "object_path": "<string>",
    "storage_type": "<value>",
    "object_meta": "{\"meta1\":{\"key1\":\"value1\",\"key2\":\"value3\"}}",
    "encrypt": "<boolean>"
}
```

**Responses**

- Upload Object

```json
{
    "status": {
        "http_code": 0,
        "error_code": "string",
        "message": "string"
    },
    "data": {
        "meta_id": "string"
    }
}
```

### Create and Upload

`POST https://launcher.mlx.yt:45001/api/v1/object_storage/create_and_upload`

This endpoint allows you to upload an object to the storage. It is designed to facilitate the creation and uploading of various types of objects, enabling users to manage their data efficiently.

Request Body

- `object_name` (string) - The name of the object you wish to upload.

- `object_extension` (string) - The file extension of the object (e.g., `txt`, `jpg`).

- `object_type_id` (string) - The ID of the object type, which categorizes the object being uploaded.

- `object_body` (string) - The content of the object in JSON format, which may include key-value pairs relevant to the object.

- `object_meta` (string) - Metadata associated with the object in JSON format, providing additional context or information about the object.

**Query Params**

| Key | Value | Description |
| --- | --- | --- |
| object_name | <string> | `Required` |
| object_meta | <string> | `Required` |
| object_extension | <string> | `Required` |
| object_type_id | <string> | `Required` |
| object_body | <string> | `Required` |
| encrypt | <boolean> | `Optional` |

**Request Body**

```json
{
  "object_type_id": "<string>",
  "object_name": "<string>",
  "object_extension": "<string>",
  "object_body": "<string>",
  "object_meta": "<string>",
  "encrypt": "<boolean>"
}
```

**Responses**

- Create and Upload

```json
{
    "data": {
        "meta_id": "id"
    },
    "status": {
        "error_code": "",
        "http_code": 200,
        "message": "`name` saved successfully to cloud storage"
    }
}
```

### Object Profile Usage

`GET https://api.multilogin.com/api/v1/resources/object_profile_usages?object_id=uuid`

This endpoint retrieves the usage details of a specific object profile based on the provided `object_id`. It is useful for obtaining insights into how an object profile is being utilized within the system.

Request Parameters

- **object_id** (required): The unique identifier of the object whose profile usages you want to retrieve. This should be passed as a query parameter in the URL.

**Query Params**

| Key | Value | Description |
| --- | --- | --- |
| object_id | uuid | `Required` |

**Request Body**

```json
{
  "mode": "raw",
  "raw": "",
  "options": {
    "raw": {
      "language": "json"
    }
  }
}
```

**Responses**

- Object Profile Usage

```json
{
    "status": {
        "error_code": "",
        "http_code": 200,
        "message": "Success"
    },
    "data": []
}
```

### Get Object Types

`GET https://api.multilogin.com/api/v1/resources/types`

This endpoint makes an HTTP GET request to retrieve the resource types available.

**Responses**

- Get Object Types

```json
{
    "status": {
        "error_code": "",
        "http_code": 200,
        "message": ""
    },
    "data": {
        "types": [
            {
                "id": "7e46e7f9-15d4-41b6-83b9-a652336793ec",
                "name": "Profile templates"
            },
            {
                "id": "3c1a0080-5282-436b-885c-ab27d5004aa8",
                "name": "Proxy configuration templates"
            },
            {
                "id": "6811b909-2e4b-45db-ab62-f14f515523cf",
                "name": "Extensions"
            },
            {
                "id": "58268a18-02b8-4d2d-ac59-9cc166ea4064",
                "name": "Cookies"
            },
            {
                "id": "bb80e9b9-b2bb-43b5-968b-c2ea9b509d7a",
                "name": "Passwords"
            },
            {
                "id": "8dfc6cec-4aad-41f0-ac87-ff44a4be0b3a",
                "name": "Automation Scripts"
            },
            {
                "id": "42d592bc-df3a-47b5-8d50-4b338df6ade2",
                "name": "Launch parameter templates"
            }
        ]
    }
}
```

### Get Statistics for Objects

`GET https://api.multilogin.com/api/v1/resources/statistics`

This endpoint allows you to retrieve statistics for the available resources.

**Responses**

- Get Statistics for Objects

```json
{
    "status": {
        "error_code": "",
        "http_code": 200,
        "message": ""
    },
    "data": {
        "global_count": 0,
        "global_count_limit": 124433543,
        "global_size": 0,
        "global_size_limit": 101623123,
        "object_types": [
            {
                "count": 0,
                "count_limit": 12121231,
                "id": "6811b909-2e4b-45db-ab62-f14f515523cf",
                "size": 0,
                "size_limit": 1500000
            },
            {
                "count": 0,
                "count_limit": 112312312,
                "id": "7e46e7f9-15d4-41b6-83b9-a652336793ec",
                "size": 0,
                "size_limit": 100123123
            }
        ]
    }
}
```

### Get Objects meta

`GET https://api.multilogin.com/api/v1/resources/metas`

This endpoint makes an HTTP GET request to retrieve metas from the specified resource.

**Query Params**

| Key | Value | Description |
| --- | --- | --- |
| limit | 0-100 | `Required`. Specify the number of objectsyou want to display. Default is `10`. |
| offset | 0-100 | `Required`. Specify the number of objects to skip from the beginning of the returned data before displaying the results. 0 means starting from the beginning. Defaults to `0`. |
| object_name | <name> | `Optional`. Specify the name of the objects you want to dispaly. |
| object_type_id | 42d592bc-df3a-47b5-8d50-4b338df6ade2 | `Optional`. Specify the object type you want to display. |
| storage_type | local, cloud, remote | `Optional`. Specify the storage type you want to display. |
| creator | c3e64137-68ab-4b43-93ee-b45f4bc26c61 | `Optional`. Specify the UUID of the creator of the objects you want to dispaly. |
| trashbin | true, false | `Optional`. Specify if you want to see either the objects inside the trashbin or the ones that are available. Default is `false`. |
| create_start_date | 2024-12-16 | `Optional`. Specify the create date of the objects. |
| create_end_date | 2024-12-16 | `Optional`. Specify the end date of the objects. |
| update_start_date | 2024-12-16 | `Optional`. Specify the update date of the objects. |
| update_end_date | 2024-12-16 | `Optional`. Specify the end update date of the objects. |

**Responses**

- Get Objects Meta

```json
{
    "status": {
        "http_code": 0,
        "error_code": "string",
        "message": "string"
    },
    "data": {
        "objects": [
            {
                "id": "string",
                "meta_info": {
                    "extension": {
                        "name": "string",
                        "version": "string"
                    }
                },
                "object_type_id": "string",
                "object_name": "string",
                "object_size": 0,
                "current_version": "string",
                "created_at": "string",
                "update_at": "string",
                "storage_type": "cloud",
                "created_by": "string",
                "update_by": "string"
            }
        ]
    }
}
```

### Get Object meta by ID

`GET https://api.multilogin.com/api/v1/resources/:id/meta`

This endpoint retrieves the meta data for a specific resource identified by its unique ID.

**Path Variables**

| Key | Value | Description |
| --- | --- | --- |
| id | <UUID> | `Required`. Specify the id of the object. |

**Responses**

- Get Objects Meta

```json
{
    "status": {
        "http_code": 0,
        "error_code": "string",
        "message": "string"
    },
    "data": {
        "id": "string",
        "meta_info": {
            "extension": {
                "name": "string",
                "version": "string"
            }
        },
        "object_type_id": "string",
        "object_name": "string",
        "object_size": 0,
        "current_version": "string",
        "created_at": "string",
        "update_at": "string",
        "storage_type": "cloud",
        "created_by": "string",
        "update_by": "string"
    }
}
```

### Delete Object

`GET https://api.multilogin.com/api/v1/resources/:id/delete`

This endpoint sends an HTTP GET request to delete a specific resource identified by the resource ID.

**Path Variables**

| Key | Value | Description |
| --- | --- | --- |
| id | <UUID> | `Required`. Specify the id of the object. |

**Query Params**

| Key | Value | Description |
| --- | --- | --- |
| permanently | true, false | `Optional`. Specify the boolean value to either delete the object to trashbin or permanently. Default to `false`. |

**Responses**

- Delete Object

```json
{
    "status": {
        "http_code": 0,
        "error_code": "string",
        "message": "string"
    },
    "data": "string"
}
```

### Restore Object

`GET https://api.multilogin.com/api/v1/resources/:id/restore`

This endpoint makes an HTTP GET request to retrieve a specific resource by its ID and restore it. The request does not include a request body, and the resource ID is specified in the URL. The response will include the details of the restored resource.

**Path Variables**

| Key | Value | Description |
| --- | --- | --- |
| id | <UUID> | `Required`. Specify the id of the object. |

**Responses**

- Restore Object

```json
{
    "status": {
        "http_code": 0,
        "error_code": "string",
        "message": "string"
    },
    "data": "string"
}
```

### Cloud to Local

`POST https://launcher.mlx.yt:45001/api/v1/object_storage/local_to_cloud`

This endpoint is used to transfer a local object to cloud storage.

**Query Params**

| Key | Value | Description |
| --- | --- | --- |
| object_id | object_id | `Required`. Specify the id of the object. |

**Request Body**

```json
{
  "object_id": "<string>"
}
```

**Responses**

- Cloud to Local

```json
{
  "status": {
    "http_code": 0,
    "error_code": "string",
    "message": "string"
  }
}
```

### Local to Cloud

`POST https://launcher.mlx.yt:45001/api/v1/object_storage/local_to_cloud`

This endpoint is used to transfer an object from local storage to cloud storage.

**Query Params**

| Key | Value | Description |
| --- | --- | --- |
| object_path | object_path | `Required`. Specify the path to the object. |
| object_id | object_id | `Required`. Specify the id of the object. |

**Request Body**

```json
{
  "object_path": "<string>",
  "object_id": "<string>"
}
```

**Responses**

- Local to Cloud

```json
{
  "status": {
    "http_code": 0,
    "error_code": "string",
    "message": "string"
  },
  "data": {
    "meta_id": "string"
  }
}
```

### Download Object

`GET https://launcher.mlx.yt:45001/api/v1/object_storage/<id_upload>/download`

This endpoint sends an HTTP GET request to retrieve the object storage data for a specific upload ID. The response of this request is a JSON schema representing the object storage data.

**Query Params**

| Key | Value | Description |
| --- | --- | --- |
| id_upload | id_upload | `Required`. Specify the id of the object. |

**Responses**

- Get Object meta by ID

```json
{
  "status": {
    "http_code": 0,
    "error_code": "string",
    "message": "string"
  }
}
```

### Create Extension

`POST https://launcher.mlx.yt:45001/api/v1/create_extension_from_url`

This endpoint is used to create an extension from a given URL.

**Query Params**

| Key | Value | Description |
| --- | --- | --- |
| url | url | `Required`. The url to the extension. |
| browser_type | mimic, stealthfox | `Required`. Specify the browser type. Note that the browser type should be the same as the extension you want to use. |
| storage_type | local, cloud | `Required`, specify the storage type. |

**Request Body**

```json
{
  "url": "<string>",
  "browser_type": "<value>",
  "storage_type": "<value>"
}
```

**Responses**

- Create Extension

```json
{
    "status": {
        "http_code": 0,
        "error_code": "string",
        "message": "string"
    }
}
```

### Enable Extension

`POST https://api.multilogin.com/api/v1/resources/:object_id/enable_for_profiles`

This endpoint enables the specified object for the associated profiles.

**Path Variables**

| Key | Value | Description |
| --- | --- | --- |
| object_id |  |  |

**Query Params**

| Key | Value | Description |
| --- | --- | --- |
| object_id | object_id | `Required`. Specify the object id of the extension. |
| profile_ids | profile_ids | `Required`. Specify the profiles you want to apply the extension on. |

**Request Body**

```json
{
  "profile_ids": [
    "profile_id"
  ]
}
```

**Responses**

- Enable Extension

```json
{
    "status": {
        "http_code": 0,
        "error_code": "string",
        "message": "string"
    },
    "data": "string"
}
```

### Disable Extension

`POST https://api.multilogin.com/api/v1/resources/:object_id/disable_for_profiles`

This endpoint makes an HTTP POST request to disable a resource for specific profiles.

**Path Variables**

| Key | Value | Description |
| --- | --- | --- |
| object_id |  |  |

**Query Params**

| Key | Value | Description |
| --- | --- | --- |
| profile_ids | profile_id | `Required`. Specify the profiles you want to disable the extension on. |
| object_id | object_id | `Required`. Specify the id of the extension you want to disable. |

**Request Body**

```json
{
  "profile_ids": [
    "<profile_id>"
  ]
}
```

**Responses**

- Disable Extension

```json
{
    "status": {
        "http_code": 0,
        "error_code": "string",
        "message": "string"
    },
    "data": "string"
}
```

### List of Objects per profile

`GET https://api.multilogin.com/api/v1/resources/profile_object_usages?object_type=object_type&profile_id=profile_id`

This endpoint allows you to retrieve the usage statistics for a specific profile object.

**Query Params**

| Key | Value | Description |
| --- | --- | --- |
| object_type | object_type | `Required`. Specify the object type. |
| profile_id | profile_id | `Required`. Specify the profile id you want to check. |

**Request Body**

```json
{
  "mode": "raw",
  "raw": "",
  "options": {
    "raw": {
      "language": "json"
    }
  }
}
```

**Responses**

- List of Objects per profile

```json
{
    "status": {
        "http_code": 0,
        "error_code": "string",
        "message": "string"
    },
    "data": [
        {
            "id": "string",
            "name": "string",
            "type": "string",
            "meta_info": {},
            "is_enabled": true
        }
    ]
}
```

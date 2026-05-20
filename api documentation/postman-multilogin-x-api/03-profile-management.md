# Profile Management

Source: Multilogin Postman collection (caee91dd-0a38-4db6-8f66-e65db86c1a2a)
Generated locally: 2026-05-18

## Endpoints

### Tag Create

`POST https://api.multilogin.com/tag/create`

Create tags.

**Query Params**

| Key | Value | Description |
| --- | --- | --- |
| tags | name, color | `Required`. |
| color | blue, green, red, orange, purple, teal, yellow, gray | `Required`. Specify the tag color. |
| name | tag_name | `Required`. Specify the tag name. |

**Headers**

| Key | Value | Description |
| --- | --- | --- |
| Content-Type | application/json |  |
| Authorization | •••••• |  |

**Request Body**

```json
{
    "tags": [
        {
            "name": "<string>",
            "color": "<string>"
        }
    ]
}
```

**Responses**

- Tag Create (201)

```json
{
    "status": {
        "error_code": "",
        "http_code": 201,
        "message": "Tags successfully created"
    },
    "data": {
        "ids": [
            "af16ad96-7c72-40fc-9bdf-60ddec64d22a"
        ]
    }
}
```

### Tag Update

`POST https://api.multilogin.com/tag/create`

Update tags.

**Query Params**

| Key | Value | Description |
| --- | --- | --- |
| tag_id | uuid | `Required`. Specify the tag id. |
| color | blue, green, red, orange, purple, teal, yellow, gray | `Required`. Specify the new tag color. |
| name | new_name | `Required`. Specify the new tag name. |

**Headers**

| Key | Value | Description |
| --- | --- | --- |
| Content-Type | application/json |  |
| Authorization | •••••• |  |

**Request Body**

```json
{
    "tag_id": "<string>",
    "color": "<string>",
    "name": "<string>"
}
```

**Responses**

- Tag Create (200)

```json
{
    "status": {
        "error_code": "",
        "http_code": 200,
        "message": "tag updated"
    },
    "data": null
}
```

### Tag Remove

`POST https://api.multilogin.com/tag/remove`

Remove tags

**Query Params**

| Key | Value | Description |
| --- | --- | --- |
| ids | ["uuid"] | `Required`. Specify the list of tags. |

**Headers**

| Key | Value | Description |
| --- | --- | --- |
| Content-Type | application/json |  |
| Authorization | Bearer <token> |  |

**Request Body**

```json
{
    "ids": [
        "<string>"
    ]
}
```

**Responses**

- Tag Remove (200)

```json
{
    "status": {
        "error_code": "",
        "http_code": 200,
        "message": "Tag successfully deleted"
    },
    "data": null
}
```

### Tag Assign

`POST https://api.multilogin.com/profile/tag/assign`

Assign tags.

**Query Params**

| Key | Value | Description |
| --- | --- | --- |
| profile_id | uuid | `Required`. Specify the profile ID. |
| tags | tag uuid | `Required`. Specify the list of tags IDs. |

**Headers**

| Key | Value | Description |
| --- | --- | --- |
| Content-Type | application/json |  |
| Authorization | Bearer <token> |  |

**Request Body**

```json
{
    "profile_id": "<string>",
    "tags": [
        "<string>"
    ]
}
```

**Responses**

- Tag Assign (200)

```json
{
    "status": {
        "error_code": "",
        "http_code": 200,
        "message": "tags successfully assigned"
    },
    "data": null
}
```

### Tag Search

`POST https://api.multilogin.com/tag/remove`

Search tags.

**Query Params**

| Key | Value | Description |
| --- | --- | --- |
| search_text | "text" | `Required`. Can be an empty string to search through all the tags. |
| limit | 1-100 | `Required`. |
| offset | 0-10000 | `Required`. |
| order_by | "name", "created_at", "updated_at" | `Optional`. Default is by `name`. |
| sort | "asc", "desc" | `Optional`. Default is by `asc`. |

**Request Body**

```json
{
    "search_text": "<string>",
    "limit": <integer>,
    "offset": <integer>,
    "order_by": "<string>",
    "sort": "<string>"
}
```

**Responses**

- Tag Search

```json
{
    "status": {
        "error_code": "",
        "http_code": 200,
        "message": "Tags search done"
    },
    "data": {
        "tags": [
            {
                "color": "gray",
                "created_at": "2025-07-30T13:46:02.407724Z",
                "created_by": "user@multilogin.com",
                "id": "5b6e75bc-9e79-4242-9b40-4dc0e70dcad3",
                "in_use_count": 0,
                "name": "Isaias",
                "updated_at": "2025-07-30T13:46:02.407724Z"
            }
        ],
        "total_count": 1
    }
}
```

### Profile Create

`POST https://api.multilogin.com/profile/create`

This endpoint supports both Strict and Non-Strict modes. In Strict mode, all required parameters must be explicitly specified. In contrast, Non-Strict mode allows for faster usage by applying default values to any unspecified parameters. Default values will be visible for each parameter.

Create a new regular profile. Fingerprint parameters need providing only if flags set to `Custom`.

Check out **Params** to see what each key-value pair is about. To copy the example request body, navigate to **Body**.

If you would like to avoid having your profiles updated to the latest available core, specify `auto_update_core` (`true` or `false`) and a specific `core_version`.

**NB: It is recommended to use the default values, which keep your browser cores up-to-date. Multilogin does not bear any responsability for ban or detection-related issues if profiles have a dated core version.**

**Required parameters for Strict mode:**

```json
{
    "name": "",
    "browser_type": "",
    "folder_id": "",
    "os_type": "",
    "auto_update_core": ,
    "core_version": ,
    "parameters": {
        "flags": {
            "audio_masking": "value",
            "fonts_masking": "value",
            "geolocation_masking": "value",
            "geolocation_popup": "value",
            "graphics_masking": "value",
            "graphics_noise": "value",
            "localization_masking": "value",
            "media_devices_masking": "value",
            "navigator_masking": "value",
            "ports_masking": "value",
            "proxy_masking": "value",
            "screen_masking": "value",
            "timezone_masking": "value",
            "webrtc_masking": "value",
            "canvas_noise": "value",
            "startup_behavior": "value"
        },
        "storage": {
            "is_local": ,
            "save_service_worker":
        },
        "times": ,
        "notes": "",
        "custom_start_urls": [
         "string"
          ],
        "fingerprint": {
          "cmd_params": {
           "params": [
          {
            "flag": "string",
            "value": "string"
          }
          ]
         },
         }
}

```

The number of parameters in `fingerprint` may vary depending on the flag values passed in the request body.

**Query Params**

| Key | Value | Description |
| --- | --- | --- |
| name | "profile_name" | `Required`. Name your profiles. |
| browser_type | "mimic", "stealthfox" | `Required`. Choose the browser type. Note: For `android` only mimic is supported! Defaults to `mimic`. |
| folder_id | "uuid" | `Required`. Specify the folder in which profiles will be created. The ID can be retrived with `GET /workspace/folders.` |
| os_type | "linux", "macos", "windows", "android" | `Required`. Specify the OS. Defaults to `windows`. |
| core_version | 124 | `Optional`. You can skip specifying the value since your profiles will be updated to the latest core by default each time it is launched. Cannot specify the version that is 6 versions older then the current latest one. |
| core_minor_version | 1 | `Optional`. Specify the minor version based on its availability. |
| auto_update_core | true, false | `Optional` You can skip specifying the value since your profiles will be updated to the latest core by default each time it is launched. Defaults to `true`. |
| tags | ["string"] | `Optional`. Specify tags. Max number is 10. |
| times | 1 - 10 | `Optional`. Specify a number of profiles to create. Defaults to `1`. |
| notes | "your_notes" | `Optional`. Add notes to your profiles. Defaults to an empty string`""`. Max length 400 is chars. |
| parameters | flags, fingerprints, storage, proxy, custom_start_urls | `Required`. Specify parameters for your profiles. `flags`, `fingerprint`, `storage` **are required** for **parameters**. |
| flags | webrtc_masking, proxy_masking, geolocation_popup, audio_masking, graphics_noise, ports_masking, navigator_masking, localization_masking, timezone_masking, graphics_masking, fonts_masking, media_devices_masking, screen_masking, geolocation_masking,  quic_mode, canvas_noise, startup_behavior | `Required`. Specify flags for your profiles. `webrtc_masking, proxy_masking, geolocation_popup, audio_masking, graphics_noise, ports_masking, navigator_masking, localization_masking, timezone_masking, graphics_masking, fonts_masking, media_devices_masking, screen_masking, geolocation_masking` **are required** for **parameters**. |
| webrtc_masking | "natural", "custom", "mask", "disabled" | `Required` for `flags`. Defaults to `mask`. |
| audio_masking, graphics_noise, ports_masking | "mask", "natural" | `Required` for `flags`. Defaults to `natural` for audio_masking and `mask` for rest. |
| proxy_masking | "custom", "disabled" | `Required` for `flags`. Defaults to `disabled` unless proxy is configured, than defaults to `custom`. |
| geolocation_popup | "prompt", "allow", "block" | `Required` for `flags`. Defaults to `prompt`. |
| navigator_masking, localization_masking, timezone_masking, graphics_masking, fonts_masking, media_devices_masking, screen_masking | "natural", "custom", "mask" | `Required` for `flags`. Defaults to `mask` and for media_devices_masking defaults to `natural`. |
| geolocation_masking | "mask", "custom" | `Required` for `flags`. Defaults to `mask`. |
| quic_mode | "natural", "disabled" | `Optional` for `flags`. `disabled` by default. |
| startup_behavior | "recover",  "custom" | `Optional` for `flags`. `recover` is set by default and allows opening profiles with the tabs from the last session. `custom` opens up profiles with provided custom pages in `custom_start_urls`. Defaults to `recover`. |
| canvas_noise | "mask", "natural", "disabled" | `Optional` for `flags`. The value is set based on the value of `graphics_noise` by default. To set a specific value for `canvas_noise`, include `canvas_noise` in your request body. |
| fingerprint | navigator, localization, timezone, graphic, webrtc, media_devices, screen,  geolocation,  ports,  fonts,  cmd_params | In Strict mode is`Required` for `parameters`. Specify fingerprints of your profiles if flags are set to `Custom`. Defaults to `optional` unless custom is set. |
| hardware_concurrency | 2, 4, 6 , 8, 12, 16, 32 | `Required` for `navigator`. Specify the value for `hardware_concurrency` if the flag is `Custom`. |
| user_agent | "your_custom_value" | `Required` for `navigator`. Specify the value for `user-agent`. |
| platform | "your_custom_value" | `Required` for `navigator`. Specify the value for `platform` if the flag is `Custom`. |
| os_cpu | "your_custom_value" | `Optional` for `navigator`. Specify the value for `os_cpu`if the flag is `Custom`. |
| accept_languages | "your_custom_value" | `Required` for `localization`. Specify the value for `accept_languages` if the flag is `Custom`. |
| languages | "your_custom_value" | `Required` for `localization`. |
| locale | "your_custom_value" | `Required` for `localization`. |
| zone | "your_custom_value" | `Required` for `timezone` Specify the value for `zone`. |
| vendor | "your_custom_value" | `Required` for `graphic`. Specify the value for `vendor` if the flag is `Custom`. |
| renderer | "your_custom_value" | `Required` for `graphic`. Specify the value for `renderer` if the flag is `Custom`. |
| vendor_id | "your_custom_value" | `Optional` for `graphic`. Specify the value for `vendor_id` if the flag is `Custom`. |
| renderer_id | "your_custom_value" | `Optional` for `graphic`. Specify the value for `renderer` if the flag is `Custom`. |
| public_ip | "your_custom_value" | `Required` for `webrtc`. Specify the value for `renderer_id` if the flag is `Custom`. |
| audio_outputs | your_number | `Required` for `media_devices`. Specify the value for `audio_outputs` if the flag is `Custom`. |
| audio_inputs | your_number | `Required` for `media_devices`. Specify the value for `audio_inputs` if the flag is `Custom`. |
| video_inputs | your_number | `Required` for `media_devices`. Specify the value for `video_inputs` if the flag is `Custom`. |
| width | Value from Screen Resolution Endpoint | `Required` for `screen`. Specify the value for `width` if the flag is `Custom`. The Screen Resolution endpoint is found under Profile Management->Screen Resolution |
| height | Value from Screen Resolution Endpoint | `Required` for `screen`. Specify the value for `height` if the flag is `Custom`. The Screen Resolution endpoint is found under Profile Management->Screen Resolution |
| pixel_ratio | 1.0 - 5.0 | `Required` for `screen`. Specify the value for `pixel_ratio` if the flag is `Custom`. |
| accuracy | your_number | `Required` for `geolocation`. Specify the value for `accuracy` if the flag is `Custom`. |
| altitude | your_number | `Required` for `geolocation`. Specify the value for `altitude` if the flag is `Custom`. |
| latitude | your_number | `Required` for `geolocation`. Specify the value for `latitude` if the flag is `Custom`. |
| longitude | your_number | `Required` for `geolocation`. Specify the value for `longitude` if the flag is `Custom`. |
| ports | [0 - 65535] | `Optional` for `fingerprint`. Specify the value for `ports` if the flag is `Custom`. |
| fonts | ["Font"] | `Optional` for `fingerprint`. Specify the value for `fonts` if the flag is `Custom`. |
| cmd_params | {                 "params": [                     {                         "flag": "<string>",                         "value": "<string>"                     }                 ]             } | `Optional` for `fingerprint`. Specify command line parameters for browsers. Defaults to an empty string `""`. |
| is_local | true, false | `Required` for `storage`. Defaults to `true`. |
| save_service_worker | true, false | `Optional` for `storage`. Defaults to `true`. |
| proxy | {     "host": "foo",     "type": "foo",     "port": 1234,     "username": "foo",     "password": "foo"      "save_traffic": false } | `Optional` for `fingerprint`. Add a proxy to your profiles. |
| save_traffic | true, false | `Optional` for `proxy`. `false` is set by default. When set to `true`,  disables the loading of images/videos saving the proxy traffic. |
| custom_start_urls | ["url"] | `Optional` for `fingerprint`. Specify custom URLs. Max amount is 5. Defaults to `optional` unless custom is set. |
| max_touch_points | 1 - 10 | `Optional` for `fingerprint` with `android` os. Default is 5. |

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
    "browser_type": "<string>",
    "folder_id": "<string>",
    "os_type": "<string>",
    "core_version": <integer>,
    "core_minor_version": <integer>,
    "times": <integer>,
    "notes": "<string>",
    "parameters": {
        "flags": {
            "audio_masking": "<string>",
            "fonts_masking": "<string>",
            "geolocation_masking": "<string>",
            "geolocation_popup": "<string>",
            "graphics_masking": "<string>",
            "graphics_noise": "<string>",
            "localization_masking": "<string>",
            "media_devices_masking": "<string>",
            "navigator_masking": "<string>",
            "ports_masking": "<string>",
            "proxy_masking": "<string>",
            "screen_masking": "<string>",
            "quic_mode": "<string>",
            "timezone_masking": "<string>",
            "webrtc_masking": "<string>",
            "canvas_noise:": "<string>",
            "startup_behavior": "<string>"
        },
        "storage": {
            "is_local": <boolean>,
            "save_service_worker": <boolean>
        },
        "fingerprint": {
            "navigator": {
                "hardware_concurrency": <integer>,
                "platform": "<string>",
                "user_agent": "<string>",
                "os_cpu": "<string>"
            },
            "localization": {
                "languages": "<string>",
                "locale": "<string>",
                "accept_languages": "<string>"
            },
            "timezone": {
                "zone": "<string>"
            },
            "graphic": {
                "renderer": "<string>",
                "vendor": "<string>"
            },
            "webrtc": {
                "public_ip": "<string>"
            },
            "media_devices": {
                "audio_inputs": <integer>,
                "audio_outputs": <integer>,
                "video_inputs": <integer>
            },
            "screen": {
                "height": <integer>,
                "pixel_ratio": <double>,
                "width": <integer>
            },
            "geolocation": {
                "accuracy": <number>,
                "altitude": <number>,
                "latitude": <number>,
                "longitude": <number>
            },
            "ports": [
                <integer>,
            ],
            "fonts": [
                "<string>"
            ],
            "cmd_params": {
                "params": [
                    {
                        "flag": "<string>",
                        "value": "<boolean>"
                    }
                ]
            }
        },
        "proxy": {
            "host": "<string>",
            "type": "<string>",
            "port": <integer>,
            "username": "<string>",
            "password": "<string>",
            "save_traffic": "<boolean>"
        },
        "custom_start_urls": [
            "<string>"
        ]
    }
}
```

**Responses**

- Profile Created (201)

```json
{
    "status": {
        "error_code": "",
        "http_code": 201,
        "message": "Profile successfully created"
    },
    "data": {
        "ids": [
            "4500dd84-d8c5-4450-b2df-1c64daed8bad"
        ]
    }
}
```

### Profile Search

`POST https://api.multilogin.com/profile/search`

This endpoint supports both Strict and Non-Strict modes. In Strict mode, all required parameters must be explicitly specified. In contrast, Non-Strict mode allows for faster usage by applying default values to any unspecified parameters. Default values will be visible for each parameter.

Search profiles.

**Required parameters for Strict mode:**

```json
{
  "is_removed": ,
  "core_version": ,
  "limit": ,
  "offset": ,
  "search_text": "",
  "folder_id": "",
  "storage_type": "",
  "order_by": "",
  "sort": ""
}
// The request body with full parameters
// {
//     "is_removed": ,
//     "core_version": ,
//     "limit": ,
//     "offset": ,
//     "search_text": "",
//     "folder_id": "",
//     "storage_type": "",
//     "order_by": "",
//     "created_from": "",
//     "created_to": "",
//     "updated_from": "",
//     "updated_to": "",
//     "last_launched_from": "",
//     "last_launched_to": "",
//     "last_launched_by": "",
//     "last_launched_on": "",
//     "last_updated_by": "",
//     "in_use_by": "",
//     "created_by": "",
//     "sort": ""
// }

```

**Query Params**

| Key | Value | Description |
| --- | --- | --- |
| is_removed | true, false | `Required`. Specify which type of profiles to search from. Defaults to `false`. |
| limit | 1 - 100 | `Required`. Specify the number of profiles to search. Defaults to `10`. |
| offset | 0 - 10000 | `Required`. Specify the number of profiles to skip from the beginning of the returned data before displaying the results. 0 means starting from the beginning. Defaults to `0`. |
| search_text | "your_profile_search" | `Required`. Search profiles by name. `maxLength`: 50 characters. An empty string searches from all the profiles. |
| storage_type | "all", "cloud", "local" | `Required`. Specify the storage type of profiles to search. |
| folder_id | "uuid" | `Optional`. Specify the folder in which searching is done |
| order_by | "name", "created_at", "updated_at", "started_at", "removed_at" | `Optional`. Order to sort resulting list of profiles. |
| sort | "asc", "desc" | `Optional`.  Specify the order order of sorting. Defaults to `asc`. |
| core_version | 124 | `Optional`. Specify the core version. |
| created_from | "1957-01-05T16:11:34.713Z" | `Optional`. Specify the start of the date range. |
| created_to | "1950-11-13T01:52:41.682Z" | `Optional`. Specify the end of the date range. |
| updated_from | "2001-07-28T09:31:08.497Z" | `Optional`.  Specify the start of the date range. |
| updated_to | "1968-11-17T06:43:16.606Z" | `Optional`. Specify the end of the date range. |
| last_launched_from | "1968-03-23T21:16:38.097Z" | `Optional`. Specify the start of the date range. |
| last_launched_to | "1979-09-14T06:17:21.890Z" | `Optional`. Specify the end of the date range. |
| last_launched_by | "mail@gmail.com" | `Optional`. Specify the email. |
| last_launched_on | "machine_id" | `Optional`. Specify machine_id. |
| last_updated_by | "mail@gmail.com" | `Optional`. Specify the email. |
| in_use_by | "mail@gmail.com" | `Optional`. Specify the email. |
| created_by | "mail@gmail.com" | `Optional`. Specify the email. |
| tags | ["tag_name"] | `Optional`. Specify the tags. |

**Headers**

| Key | Value | Description |
| --- | --- | --- |
| Content-Type | application/json |  |
| Accept | application/json |  |
| X-Strict-Mode | boolean | Default to false. If set to true, you must specify values for all required parameters. |

**Request Body**

```json
{
  "is_removed": <boolean>,
  "core_version": <integer>,
  "limit": <integer>,
  "offset": <integer>,
  "search_text": "<string>",
  "folder_id": "<string>",
  "storage_type": "all",
  "order_by": "created_at",
  "sort": "asc"
}

// The request body with full parameters
// {
//     "is_removed": <boolean>,
//     "core_version": <integer>,
//     "limit": <integer>,
//     "offset": <integer>,
//     "search_text": "<string>",
//     "folder_id": "<string>",
//     "storage_type": "<string>",
//     "order_by": "<string>",
//     "created_from": "<string>",
//     "created_to": "<string>",
//     "updated_from": "<string>",
//     "updated_to": "<string>",
//     "last_launched_from": "<string>",
//     "last_launched_to": "<string>",
//     "last_launched_by": "<string>",
//     "last_launched_on": "<string>",
//     "last_updated_by": "<string>",
//     "in_use_by": "<string>",
//     "tags": ["<string>"],
//     "created_by": "<string>",
//     "sort": "<string>"
// }
```

**Responses**

- Search Done (200)

```json
{
    "status": {
        "error_code": "",
        "http_code": 200,
        "message": "Search profile successfully result"
    },
    "data": {
        "profiles": [
            {
                "abp_status": false,
                "browser_type": "stealthfox",
                "core_version": 139,
                "created_at": "2025-06-26T13:08:51.80859Z",
                "created_by": "user@multilogin.com",
                "folder_id": "fb9b0b1c-f16e-4b08-bb69-25942e2c7b0a",
                "id": "3a19dc1e-7bc5-40f6-854b-3869ec5e4b6a",
                "in_use_by": "",
                "is_local": false,
                "last_launched_by": "",
                "last_launched_on": "",
                "name": "Gilbert_Renner",
                "notes": "HELLO HELLO",
                "os_type": "windows",
                "password_protected": false,
                "password_restricted": false,
                "updated_at": "2025-06-26T13:08:51.80859Z"
            },
            {
                "abp_status": false,
                "browser_type": "stealthfox",
                "core_version": 139,
                "created_at": "2025-06-26T13:53:18.271941Z",
                "created_by": "user@multilogin.com",
                "folder_id": "fb9b0b1c-f16e-4b08-bb69-25942e2c7b0a",
                "id": "7402a60d-74c8-498f-8e63-4d87f058ec5c",
                "in_use_by": "user@multilogin.com",
                "is_local": false,
                "last_launched_at": "2025-06-26T13:53:48.078867Z",
                "last_launched_by": "user@multilogin.com",
                "last_launched_on": "30a2a2487443a77d7f19f3e9f5abd4fe7e52987682f9fc3aa5d415b9f9f51637",
                "locked_by": "user@multilogin.com",
                "name": "Gregg.Keeling",
                "notes": "HELLO HELLO",
                "os_type": "windows",
                "password_protected": false,
                "password_restricted": false,
                "updated_at": "2025-06-26T13:53:18.271941Z"
            },
            {
                "abp_status": false,
                "browser_type": "stealthfox",
                "core_version": 139,
                "created_at": "2025-06-26T13:56:26.674672Z",
                "created_by": "user@multilogin.com",
                "folder_id": "fb9b0b1c-f16e-4b08-bb69-25942e2c7b0a",
                "id": "4ac17621-dcd5-47c4-bc30-07320d580414",
                "in_use_by": "user@multilogin.com",
                "is_local": false,
                "last_launched_at": "2025-06-26T13:56:32.334589Z",
                "last_launched_by": "user@multilogin.com",
                "last_launched_on": "30a2a2487443a77d7f19f3e9f5abd4fe7e52987682f9fc3aa5d415b9f9f51637",
                "locked_by": "user@multilogin.com",
                "name": "Martina64",
                "notes": "HELLO HELLO",
                "os_type": "windows",
                "password_protected": false,
                "password_restricted": false,
                "updated_at": "20
...truncated...
```

### Profile Remove

`POST https://api.multilogin.com/profile/remove`

This endpoint supports both Strict and Non-Strict modes. In Strict mode, all required parameters must be explicitly specified. In contrast, Non-Strict mode allows for faster usage by applying default values to any unspecified parameters. Default values will be visible for each parameter.

Remove profiles. Setting the value of `permanently` allows managing profile deletion. Deleting with `False` allows recovering deleted profiles when needed.

Check out **Params** to see what each key-value pair is about. To copy the example request body, please navigate to **Body**.

**Required parameters for Strict mode:**

```json
{
  "ids": [
    ""
  ],
  "permanently":
}

```

**Query Params**

| Key | Value | Description |
| --- | --- | --- |
| ids | ["uuid"] | `Required`. Specify the ID of the profile to be deleted. |
| permanently | true, false | `Required`. Specify the value to delete profiles perminantly or not. Defaults to `false`. |

**Headers**

| Key | Value | Description |
| --- | --- | --- |
| Content-Type | application/json |  |
| Accept | application/json |  |
| X-Strict-Mode | boolean | Default to false. If set to true, you must specify values for all required parameters. |

**Request Body**

```json
{
  "ids": [
    "<string>"
  ],
  "permanently": <boolean>
}
```

**Responses**

- Profile Removed (200)

```json
{
    "status": {
        "error_code": "",
        "http_code": 200,
        "message": "Profile successfully removed"
    },
    "data": null
}
```

### Profile Update

`POST https://api.multilogin.com/profile/update`

Update a profile. Fingerprint parameters need providing only if flags set to `Custom`.

Check out **Params** to see what each key-value pair is about. To copy the example request body, please navigate to **Body**.

If you would like to avoid having your profiles updated to the latest available core, specify `auto_update_core` (`true` or `false`). Updating existing profiles to a specific core version is not supported.

If you update an existing profile, created with `auto_update_core: false`, `auto_update_core: false` still has to be specified in the request. Otherwise, `auto_update_core` will be changed to `true`.

**NB:**

- **It is recommended to use the default values, which keep your browser cores up-to-date. Multilogin does not bear any responsability for ban or detection-related issues if profiles have a dated core version.**

- **If you update an existing profile, created with** **`auto_update_core: false`**, **`auto_update_core: false`** **still has to be specified in the request. Otherwise,** **`auto_update_core`** **will be changed to** **`true`**.

**Required parameters:**

```json
{
    "name": "",
    "profile_id": "",
    "parameters": {
        "flags": {
            "audio_masking": "value",
            "fonts_masking": "value",
            "geolocation_masking": "value",
            "geolocation_popup": "value",
            "graphics_masking": "value",
            "graphics_noise": "value",
            "localization_masking": "value",
            "media_devices_masking": "value",
            "navigator_masking": "value",
            "ports_masking": "value",
            "proxy_masking": "value",
            "screen_masking": "value",
            "timezone_masking": "value",
            "webrtc_masking": "value",
        },
        "storage": {
            "is_local": ,
            "save_service_worker":
        },
        "fingerprint": {}
}

```

The number of parameters in `fingerprint` may vary depending on the flag values passed in the request body.

**Query Params**

| Key | Value | Description |
| --- | --- | --- |
| auto_update_core | true,false | `Optional`. Setting to True allows passing "core_version" and "core_minor_version". |
| core_version | 123 | `Optional`. Cannot specify the version that is 6 versions older then the current latest one. |
| core_minor_version | 1 | `Optional`. Specify the minor version based on its availability. |
| profile_id | "uuid" | `Required`. Specify the ID of the profile to be updated. |
| name | "profile_name" | `Required`. Name your profiles. |
| tags | ["string"] | `Optional`. Specify tags. Max number is 10. |
| parameters | flags,  fingerprints, storage, proxy, custom_start_urls | `Required`. Specify parameters for your profiles. `flags`, `fingerprint`, `storage` **are required** for **parameters**. |
| flags | webrtc_masking, proxy_masking, geolocation_popup, audio_masking, graphics_noise, ports_masking, navigator_masking, localization_masking, timezone_masking, graphics_masking, fonts_masking, media_devices_masking, screen_masking, geolocation_masking, quic_mode, canvas_noise, startup_behavior | `Required`. Specify flags for your profiles. `webrtc_masking, proxy_masking, geolocation_popup, audio_masking, graphics_noise, ports_masking, navigator_masking, localization_masking, timezone_masking, graphics_masking, fonts_masking, media_devices_masking, screen_masking, geolocation_masking` **are required** for **parameters**. |
| webrtc_masking | "natural", "custom", "mask", "disabled" | `Required` for `flags`. |
| audio_masking, graphics_noise, ports_masking | "mask", "natural" | `Required` for `flags`. |
| proxy_masking | "custom", "disabled" | `Required` for `flags`. |
| geolocation_popup | "prompt", "allow", "block" | `Required` for `flags`. |
| navigator_masking, localization_masking, timezone_masking, graphics_masking, fonts_masking, media_devices_masking, screen_masking | "natural", "custom", "mask" | `Required` for `flags`. |
| geolocation_masking | "mask", "custom" | `Required` for `flags`. |
| auto_update_core | true, false | `Optional`. You can skip specifying the value since your profiles will be updated to the latest core by default each time it is launched. |
| quic_mode | "natural", "disabled" | `Optional` for `flags`. `disabled` by default. |
| canvas_noise | "mask", "natural", "disabled" | `Optional` for `flags`. The value is set based on the value of `graphics_noise` by default. To set a specific value for `canvas_noise`, include `canvas_noise` in your request body. |
| startup_behavior | "recover",  "custom" | `Optional` for `flags`. `recover` is set by default and allows opening profiles with the tabs from the last session. `custom` opens up profiles with provided custom pages in `custom_start_urls`. |
| fingerprint | navigator, localization, timezone, graphic, webrtc, media_devices, screen,  geolocation,  ports,  fonts,  cmd_params | `Required` for `parameters`. Specify fingerprints of your profiles if flags are set to `Custom`. |
| hardware_concurrency | 2, 4, 6 , 8, 12, 16, 32 | `Required` for `navigator`. Specify the value for `hardware_concurrency` if the flag is `Custom`. |
| user_agent | "your_custom_value" | `Required` for `navigator`. Specify the value for `user-agent`. |
| platform | "your_custom_value" | `Required` for `navigator`. Specify the value for `platform` if the flag is `Custom`. |
| os_cpu | "your_custom_value" | `Optional` for `navigator`. Specify the value for `os_cpu`if the flag is `Custom`. |
| accept_languages | "your_custom_value" | `Required` for `localization`. Specify the value for `accept_languages` if the flag is `Custom`. |
| languages | "your_custom_value" | `Required` for `localization`. |
| locale | "your_custom_value" | `Required` for `localization`. Pass an empty string. |
| zone | "your_custom_value" | `Required` for `timezone` Specify the value for `zone`. |
| vendor | "your_custom_value" | `Required` for `graphic`. Specify the value for `vendor` if the flag is `Custom`. |
| renderer | "your_custom_value" | `Required` for `graphic`. Specify the value for `renderer` if the flag is `Custom`. |
| vendor_id | "your_custom_value" | `Optional` for `graphic`. Specify the value for `vendor_id` if the flag is `Custom`. |
| renderer_id | "your_custom_value" | `Optional` for `graphic`. Specify the value for `renderer_id` if the flag is `Custom`. |
| public_ip | "your_custom_value" | `Required` for `webrtc`. Specify the value for `public_ip` if the flag is `Custom`. |
| audio_outputs | your_number | `Required` for `media_devices`. Specify the value for `audio_outputs` if the flag is `Custom`. |
| audio_inputs | your_number | `Required` for `media_devices`. Specify the value for `audio_inputs` if the flag is `Custom`. |
| video_inputs | your_number | `Required` for `media_devices`. Specify the value for `video_inputs` if the flag is `Custom`. |
| width | 360 - 5000 | `Required` for `screen`. Specify the value for `width` if the flag is `Custom`. |
| height | 640 - 3000 | `Required` for `screen`. Specify the value for `height` if the flag is `Custom`. |
| pixel_ratio | 1.0 - 5.0 | `Required` for `screen`. Specify the value for `pixel_ratio` if the flag is `Custom`. |
| accuracy | your_number | `Required` for `geolocation`. Specify the value for `accuracy` if the flag is `Custom`. |
| altitude | your_number | `Required` for `geolocation`. Specify the value for `altitude` if the flag is `Custom`. |
| latitude | your_number | `Required` for `geolocation`. Specify the value for `latitude` if the flag is `Custom`. |
| longitude | your_number | `Required` for `geolocation`. Specify the value for `longitude` if the flag is `Custom`. |
| ports | [0 - 65535] | `Optional` for `fingerprint`. Specify the value for `ports` if the flag is `Custom`. |
| fonts | ["Font"] | `Optional` for `fingerprint`. Specify the value for `fonts` if the flag is `Custom`. |
| cmd_params | {                 "params": [                     {                         "flag": "<string>",                         "value": "<string>"                     }                 ]             } | `Optional` for `fingerprint`. Specify command line parameters for browsers. |
| is_local | true, false | `Required` for `storage`. |
| save_service_worker | true, false | `Optional` for `storage`. |
| proxy | {     "host": "foo",     "type": "foo",     "port": 1234,     "username": "foo",     "password": "foo"      "save_traffic": false } | `Optional` for `fingerprint`. Add a proxy to your profiles. |
| save_traffic | true, false | `Optional` for `proxy`. `false` is set by default. When set to `true`,  disables the loading of images/videos saving the proxy traffic. |
| custom_start_urls | ["url"] | `Optional` for `fingerprint`. Specify custom URLs. Max amount is 5. |
| notes | "your_notes" | `Optional`. Add notes to your profiles. Max length is 400 chars. |
| max_touch_points | 1 - 10 | `Optional` for `fingerprint` with `android` os. Default is 5. |

**Headers**

| Key | Value | Description |
| --- | --- | --- |
| Content-Type | application/json |  |
| Accept | application/json |  |

**Request Body**

```json
{
    "profile_id": "<string>",
    "auto_update_core": <boolean>,  // Specify False to be able to pass "core_version" and "core_minor_version"
    "core_version": <integer>,
    "core_minor_version": <integer>,
    "name": "<string>",
    "parameters": {
        "flags": {
            "audio_masking": "<string>",
            "fonts_masking": "<string>",
            "geolocation_masking": "<string>",
            "geolocation_popup": "<string>",
            "graphics_masking": "<string>",
            "graphics_noise": "<string>",
            "localization_masking": "<string>",
            "media_devices_masking": "<string>",
            "navigator_masking": "<string>",
            "ports_masking": "<string>",
            "proxy_masking": "<string>",
            "screen_masking": "<string>",
            "timezone_masking": "<string>",
            "webrtc_masking": "<string>",
            "canvas_noise:": "<string>",
            "startup_behavior": "<string>",
        },
        "storage": {
            "is_local": <boolean>,
            "save_service_worker": <boolean>
        },
        "fingerprint": {
            "navigator": {
                "hardware_concurrency": <integer>,
                "platform": "<string>",
                "user_agent": "<string>",
                "os_cpu": "<string>"
            },
            "localization": {
                "languages": "<string>",
                "locale": "<string>",
                "accept_languages": "<string>"
            },
            "timezone": {
                "zone": "<string>"
            },
            "graphic": {
                "renderer": "<string>",
                "vendor": "<string>"
            },
            "webrtc": {
                "public_ip": "<string>"
            },
            "media_devices": {
                "audio_inputs": <integer>,
                "audio_outputs": <integer>,
                "video_inputs": <integer>
            },
            "screen": {
                "height": <integer>,
                "pixel_ratio": <double>,
                "width": <integer>
            },
            "geolocation": {
                "accuracy": <number>,
                "altitude": <number>,
                "latitude": <number>,
                "longitude": <number>
            },
            "ports": [
                <integer>,
            ],
            "fonts": [
                "<string>"
            ],
            "cmd_params": {
                "params": [
                    {
                        "flag": "<string>",
                        "value": "<boolean>"
                    }
                ]
            }
        },
        "proxy": {
            "host": "<string>",
            "type": "<string>",
            "port": <integer>,
            "username": "<string>",
            "password": "<string>",
            "save_traffic": "<boolean>"
        },
        "custom_start_urls": [
            "<string>"
        ]
    },
    "notes": "<string>"
}
```

**Responses**

- Profile Updated (201)

```json
{
    "status": {
        "error_code": "",
        "http_code": 200,
        "message": "Profile successfully updated"
    },
    "data": null
}
```

### Profile Move

`POST https://api.multilogin.com/profile/move`

Move profiles to a specified folder.

**Required parameters:**

```json
{
  "dest_folder_id": "",
  "ids": [
    ""
  ]
}

```

**Query Params**

| Key | Value | Description |
| --- | --- | --- |
| dest_folder_id | "uuid" | `Required`. Specify the folder, to which profiles will be moved. |
| ids | ["uuid"] | `Required`. Provide a list of profiles to be moved. Max number of IDs is 20. |

**Headers**

| Key | Value | Description |
| --- | --- | --- |
| Content-Type | application/json |  |
| Accept | application/json |  |

**Request Body**

```json
{
  "dest_folder_id": "<string>",
  "ids": [
    "<string>"
  ]
}
```

**Responses**

- Profiles Moved (200)

```json
{
    "status": {
        "error_code": "",
        "http_code": 200,
        "message": "Profiles successfully moved"
    },
    "data": null
}
```

### Profile Partial Update

`POST https://api.multilogin.com/profile/partial_update`

Update a profile partially according to your requirements. Fingerprint parameters need providing only if flags set to `Custom`.

Check out **Params** to see what each key-value pair is about. To copy the example request body, please navigate to **Body**.

If you would like to avoid having your profiles updated to the latest available core, specify `auto_update_core` (`true` or `false`) and a specific `core_version`. Updating existing profiles to a specific core version is not supported.

**NB:**

- **It is recommended to use the default values, which keep your browser cores up-to-date. Multilogin does not bear any responsability for ban or detection-related issues if profiles have a dated core version.**

- **If you update an existing profile, created with** **`auto_update_core: false`**, **`auto_update_core: false`** **still has to be specified in the request. Otherwise,** **`auto_update_core`** **will be changed to** **`true`**.

**Required parameters:**

```json
{
    "profile_id": ""
}

```

The number of parameters in `fingerprint` may vary depending on the flag values passed in the request body.

**Query Params**

| Key | Value | Description |
| --- | --- | --- |
| profile_id | "uuid" | `Required`. Specify the ID of the profile to be updated. |
| name | "profile_name" | `Optional`. Name your profiles. |
| auto_update_core | true, false | `Optional`. You can skip specifying the value since your profiles will be updated to the latest core by default each time it is launched. |
| core_minor_version | 124 | `Optional`. Specify the minor version based on its availability. |
| core_version | 1 | `Optional`. Cannot specify the version that is 6 versions older then the current latest one. |
| tags | ["string"] | `Optional`. Specify tags. Max number is 10. |
| proxy | {     "host": "foo",     "type": "foo",     "port": 1234,     "username": "foo",     "password": "foo"      "save_traffic": false } | `Optional` for `fingerprint`. Add a proxy to your profiles. |
| save_traffic | true, false | `Optional` for `proxy`. `false` is set by default. When set to `true`,  disables the loading of images/videos saving the proxy traffic. |
| custom_start_urls | ["url"] | `Optional` for `fingerprint`. Specify custom URLs. Max amount is 5. |
| notes | "your_notes" | `Optional`. Add notes to your profiles. Max length is 400 chars. |
| parameters | flags,  fingerprints, storage, proxy,  custom_start_urls | `Optional`. |
| flags | webrtc_masking, proxy_masking, geolocation_popup, audio_masking, graphics_noise, ports_masking, navigator_masking, localization_masking, timezone_masking, graphics_masking, fonts_masking, media_devices_masking, screen_masking, geolocation_masking, quic_mode, canvas_noise, startup_behavior | `Optional`. |
| webrtc_masking | "natural", "custom", "mask", "disabled" | `Optional`. |
| audio_masking, graphics_noise, ports_masking | "mask", "natural" | `Optional`. |
| proxy_masking | "custom", "disabled" | `Optional`. |
| geolocation_popup | "prompt", "allow", "block" | `Optional`. |
| navigator_masking, localization_masking, timezone_masking, graphics_masking, fonts_masking, media_devices_masking, screen_masking | "natural", "custom", "mask" | `Optional`. |
| geolocation_masking | "mask", "custom" | `Optional`. |
| quic_mode | "natual", "disabled" | `Optional` for `flags`. `disabled` by default. |
| canvas_noise | "mask", "natural", "disabled" | `Optional` for `flags`. The value is set based on the value of `graphics_noise` by default. To set a specific value for `canvas_noise`, include `canvas_noise` in your request body. |
| startup_behavior | "recover",  "custom" | `Optional` for `flags`. `recover` is set by default and allows opening profiles with the tabs from the last session. `custom` opens up profiles with provided custom pages in `custom_start_urls`. |
| is_local | true, false | `Required` for `storage`. |
| save_service_worker | true, false | `Optional` for `storage`. |
| fingerprint | navigator, localization, timezone, graphic, webrtc, media_devices, screen,  geolocation,  ports,  fonts,  cmd_params | `Required` for `parameters`. Specify fingerprints of your profiles if flags are set to `Custom`. |
| hardware_concurrency | 2, 4, 6 , 8, 12, 16, 32 | `Required` for `navigator`. Specify the value for `hardware_concurrency` if the flag is `Custom`. |
| user_agent | "your_custom_value" | `Required` for `navigator`. Specify the value for `user-agent`. |
| platform | "your_custom_value" | `Required` for `navigator`. Specify the value for `platform` if the flag is `Custom`. |
| os_cpu | "your_custom_value" | `Optional` for `navigator`. Specify the value for `os_cpu`if the flag is `Custom`. |
| accept_languages | "your_custom_value" | `Required` for `localization`. Specify the value for `accept_languages` if the flag is `Custom`. |
| languages | "your_custom_value" | `Required` for `localization`. |
| locale | "your_custom_value" | `Required` for `localization`. Pass an empty string. |
| zone | "your_custom_value" | `Required` for `timezone` Specify the value for `zone`. |
| vendor | "your_custom_value" | `Required` for `graphic`. Specify the value for `vendor` if the flag is `Custom`. |
| renderer | "your_custom_value" | `Required` for `graphic`. Specify the value for `renderer` if the flag is `Custom`. |
| vendor_id | "your_custom_value" | `Optional` for `graphic`. Specify the value for `vendor_id` if the flag is `Custom`. |
| renderer_id | "your_custom_value" | `Optional` for `graphic`. Specify the value for `renderer_id` if the flag is `Custom`. |
| public_ip | "your_custom_value" | `Required` for `webrtc`. Specify the value for `public_ip` if the flag is `Custom`. |
| audio_outputs | your_number | `Required` for `media_devices`. Specify the value for `audio_outputs` if the flag is `Custom`. |
| audio_inputs | your_number | `Required` for `media_devices`. Specify the value for `audio_inputs` if the flag is `Custom`. |
| video_inputs | your_number | `Required` for `media_devices`. Specify the value for `video_inputs` if the flag is `Custom`. |
| width | 360 - 5000 | `Required` for `screen`. Specify the value for `width` if the flag is `Custom`. |
| height | 640 - 3000 | `Required` for `screen`. Specify the value for `height` if the flag is `Custom`. |
| pixel_ratio | 1.0 - 5.0 | `Required` for `screen`. Specify the value for `pixel_ratio` if the flag is `Custom`. |
| accuracy | your_number | `Required` for `geolocation`. Specify the value for `accuracy` if the flag is `Custom`. |
| altitude | your_number | `Required` for `geolocation`. Specify the value for `altitude` if the flag is `Custom`. |
| latitude | your_number | `Required` for `geolocation`. Specify the value for `latitude` if the flag is `Custom`. |
| longitude | your_number | `Required` for `geolocation`. Specify the value for `longitude` if the flag is `Custom`. |
| ports | [0 - 65535] | `Optional` for `fingerprint`. Specify the value for `ports` if the flag is `Custom`. |
| fonts | ["Font"] | `Optional` for `fingerprint`. Specify the value for `fonts` if the flag is `Custom`. |
| cmd_params | {                 "params": [                     {                         "flag": "<string>",                         "value": "<string>"                     }                 ]             } | `Optional` for `fingerprint`. Specify command line parameters for browsers. |
| max_touch_points | 1 - 10 | `Optional` for `fingerprint` with `android` os. Default is 5. |

**Headers**

| Key | Value | Description |
| --- | --- | --- |
| Content-Type | application/json |  |
| Accept | application/json |  |

**Request Body**

```json
{
    "profile_id": "<string>",
    "name": "<string>",
    "auto_update_core": <boolean>,  // Specify False to be able to pass "core_version" and "core_minor_version"
    "core_version": <integer>,
    "core_minor_version": <integer>,
    "proxy": {
        "host": "<string>",
        "type": "<string>",
        "port": <integer>,
        "username": "<string>",
        "password": "<string>",
        "save_traffic": "<boolean>"
    },
    "custom_start_urls": [
        "<string>"
    ],
    "notes": "<string>",
    "parameters": {
        "flags": {
            "audio_masking": "<string>",
            "fonts_masking": "<string>",
            "geolocation_masking": "<string>",
            "geolocation_popup": "<string>",
            "graphics_masking": "<string>",
            "graphics_noise": "<string>",
            "localization_masking": "<string>",
            "media_devices_masking": "<string>",
            "navigator_masking": "<string>",
            "ports_masking": "<string>",
            "proxy_masking": "<string>",
            "screen_masking": "<string>",
            "timezone_masking": "<string>",
            "webrtc_masking": "<string>",
            "canvas_noise": "<string>",
            "startup_behavior": "<string>"
        },
        "storage": {
            "is_local": <boolean>,
            "save_service_worker": <boolean>
        },
        "fingerprint": {
            "navigator": {
                "hardware_concurrency": <integer>,
                "platform": "<string>",
                "user_agent": "<string>",
                "os_cpu": "<string>"
            },
            "localization": {
                "languages": "<string>",
                "locale": "<string>",
                "accept_languages": "<string>"
            },
            "timezone": {
                "zone": "<string>"
            },
            "graphic": {
                "renderer": "<string>",
                "vendor": "<string>"
            },
            "webrtc": {
                "public_ip": "<string>"
            },
            "media_devices": {
                "audio_inputs": <integer>,
                "audio_outputs": <integer>,
                "video_inputs": <integer>
            },
            "screen": {
                "height": <integer>,
                "pixel_ratio": <double>,
                "width": <integer>
            },
            "geolocation": {
                "accuracy": <number>,
                "altitude": <number>,
                "latitude": <number>,
                "longitude": <number>
            },
            "ports": [
                <integer>,
            ],
            "fonts": [
                "<string>"
            ],
            "cmd_params": {
                "params": [
                    {
                        "flag": "<string>",
                        "value": "<string>"
                    }
                ]
            }
        }
    }
}
```

**Responses**

- Profile Updated (200)

```json
{
    "status": {
        "error_code": "",
        "http_code": 200,
        "message": "Profile successfully updated"
    },
    "data": null
}
```

### Profile Restore

`POST https://api.multilogin.com/profile/restore`

Restore profiles deleted with the `permanently` value set to `False`.

Check out **Params** to see what each key-value pair is about. To copy the example request body, please navigate to **Body**.

**Required parameters:**

```json
{
  "ids": [
    ""
  ]
}

```

**Query Params**

| Key | Value | Description |
| --- | --- | --- |
| ids | ["uuid"] | `Required`. Specify the ID of the profile you would like to restore. |

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

- Profile Restored (200)

```json
{
    "status": {
        "error_code": "",
        "http_code": 200,
        "message": "Profile successfully restored"
    },
    "data": null
}
```

### Profile Metas

`POST https://api.multilogin.com/profile/metas`

Fetch metas of profiles. The number of parameters depends on the data specified when profiles have been created.

Check out **Params** to see what each key-value pair is about. To copy the example request body, please navigate to **Body**.

**Required parameters:**

```json
{
  "ids": [
    ""
  ]
}

```

**Query Params**

| Key | Value | Description |
| --- | --- | --- |
| ids | ["uuid"] | `Required`. Specify the ID of the profile, which metas you would like to fetch. |

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

- Profile Meta Fetched (200)

```json
{
    "status": {
        "error_code": "",
        "http_code": 200,
        "message": "List of profiles metadata"
    },
    "data": {
        "profiles": [
            {
                "id": "56253ac4-5793-4d56-8448-7250eb369d3f",
                "is_auto_update": true,
                "name": "Mollie_Williamson41",
                "notes": "HELLO HELLO",
                "parameters": {
                    "fingerprint": {},
                    "flags": {
                        "audio_masking": "natural",
                        "canvas_noise": "mask",
                        "fonts_masking": "mask",
                        "geolocation_masking": "mask",
                        "geolocation_popup": "prompt",
                        "graphics_masking": "mask",
                        "graphics_noise": "mask",
                        "localization_masking": "mask",
                        "media_devices_masking": "mask",
                        "navigator_masking": "mask",
                        "ports_masking": "mask",
                        "proxy_masking": "disabled",
                        "quic_mode": "disabled",
                        "screen_masking": "mask",
                        "startup_behavior": "recover",
                        "timezone_masking": "mask",
                        "webrtc_masking": "mask"
                    },
                    "storage": {
                        "is_local": false,
                        "save_service_worker": false
                    }
                },
                "browser_type": "stealthfox",
                "core_version": 140,
                "os_type": "windows",
                "created_at": "2025-07-07T14:05:35.464754Z",
                "created_by": "api_test@multilogin.com",
                "in_use_by": "",
                "last_launched_at": "2025-07-07T14:05:35.464754Z",
                "last_launched_by": "",
                "last_launched_on": "localhost",
                "last_update_at": "2025-07-07T14:05:35.464754Z",
                "last_updated_by": "",
                "removed_at": "0001-01-01T00:00:00Z",
                "removed_by": "",
                "status": "",
                "folder_id": "4ddbfee1-43bd-41dc-9ce4-e125324e455f",
                "workspace_id": "4ddbfee1-43bd-41dc-9ce4-e125324e455f"
            }
        ]
    }
}
```

### Profile Summary

`GET https://api.multilogin.com/profile/summary?meta_id=uuid`

Fetch profile fingerprints.

**Query Params**

| Key | Value | Description |
| --- | --- | --- |
| meta_id | uuid | `Required`. Specify the profile id. |

**Headers**

| Key | Value | Description |
| --- | --- | --- |
| Content-Type | application/json |  |
| Accept | application/json |  |

**Request Body**

```json
{
  "mode": "raw",
  "raw": "",
  "options": {
    "raw": {
      "headerFamily": "json",
      "language": "json"
    }
  }
}
```

**Responses**

- Profile Summary Fetched (200)

```json
{
    "status": {
        "error_code": "",
        "http_code": 200,
        "message": "List of ready to start profiles"
    },
    "data": {
        "fonts": [
            "Font 1",
            "Font 2",
            "Font 3",
            "Font 4",
            "Font 5"
        ],
        "geolocation": {
            "accuracy": 0,
            "altitude": 0,
            "latitude": 0,
            "longitude": 0
        },
        "graphic": {
            "device_id": "1111",
            "renderer": "ANGLE (Intel, Intel(R) HD Graphics 530 Direct3D11 vs_5_0 ps_5_0, D3D11)",
            "vendor": "Google Inc. (Intel)",
            "vendor_id": "1212"
        },
        "localization": {
            "accept_languages": "en-US,en;q=0.9",
            "languages": "en-US,en",
            "locale": "en-US"
        },
        "masking_options": {},
        "media_devices": {
            "audio_inputs": 1,
            "audio_outputs": 2,
            "video_inputs": 1
        },
        "navigator": {
            "hardware_concurrency": 2,
            "max_touch_points": 0,
            "os_cpu": "",
            "platform": "Win32",
            "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.7049.85 Safari/537.36"
        },
        "ports": [],
        "screen": {
            "height": 768,
            "pixel_ratio": 1,
            "width": 1366
        },
        "timezone": {
            "zone": ""
        },
        "webrtc": {
            "public_ip": "0.0.0.0/32"
        }
    }
}
```

### Profile Clone

`POST https://api.multilogin.com/profile/clone`

This endpoint supports both Strict and Non-Strict modes. In Strict mode, all required parameters must be explicitly specified. In contrast, Non-Strict mode allows for faster usage by applying default values to any unspecified parameters. Default values will be visible for each parameter.

Clone profiles.

Check out **Params** to see what each key-value pair is about. To copy the example request body, please navigate to **Body**.

**Required parameters for Strict mode:**

```json
{
  "profile_id": "",
  "times":
}

```

**Query Params**

| Key | Value | Description |
| --- | --- | --- |
| profile_id | "uuid" | `Required`. Specify the ID of the original profile. |
| times | 1-10 | `Required`. Specify the number of profiles you would like to clone. Defaults to `1`. |

**Headers**

| Key | Value | Description |
| --- | --- | --- |
| Content-Type | application/json |  |
| Accept | application/json |  |
| X-Strict-Mode | boolean | Default to false. If set to true, you must specify values for all required parameters. |

**Request Body**

```json
{
  "profile_id": "<string>",
  "times": <integer>
}
```

**Responses**

- Profile Cloned (200)

```json
{
    "status": {
        "error_code": "",
        "http_code": 200,
        "message": "Profile successfully cloned"
    },
    "data": {
        "ids": [
            "2072fd5b-5762-44ba-8a51-da3c3d52950e"
        ]
    }
}
```

### Profile Convert

`POST https://launcher.mlx.yt:45001/api/v1/profile/:profile_id/convert`

Check out **Params** to see what each key-value pair is about. To copy the example request body, please navigate to **Body**.

**Path Variables**

| Key | Value | Description |
| --- | --- | --- |
| profile_id | "uuid" | `Required`. Specify the ID of the original profile. |

**Query Params**

| Key | Value | Description |
| --- | --- | --- |
| convert_to_local | true, false | `Required`. True if you want to convert from cloud to local and false otherwise. |
| workspace_id | "uuid" | `Required`. Specify the workspace id. |
|  |  |  |

**Headers**

| Key | Value | Description |
| --- | --- | --- |
| Content-Type | application/json |  |
| Accept | application/json |  |

**Request Body**

```json
{
    "workspace_id": "<string>",
    "convert_to_local" : <boolean>
}
```

**Responses**

- Profile Convert (200)

```json
{
    "status": {
        "error_code": "",
        "http_code": 200,
        "message": "profile successfully converted from cloud to local"
    }
}
```

### Screen Resolution

`GET https://api.multilogin.com/fpb/resolutions`

Fetch a list of available screen resolutions.

**Headers**

| Key | Value | Description |
| --- | --- | --- |
| Accept | application/json |  |

**Responses**

- Screen Resolution Fetched (200)

```json
{
    "status": {
        "error_code": "",
        "http_code": 200,
        "message": "success"
    },
    "data": {
        "resolutions": [
            {
                "height": 720,
                "width": 1280
            },
            {
                "height": 800,
                "width": 1280
            },
            {
                "height": 1024,
                "width": 1280
            },
            {
                "height": 768,
                "width": 1366
            },
            {
                "height": 900,
                "width": 1440
            },
            {
                "height": 864,
                "width": 1536
            },
            {
                "height": 900,
                "width": 1600
            },
            {
                "height": 1050,
                "width": 1680
            },
            {
                "height": 1080,
                "width": 1920
            },
            {
                "height": 1200,
                "width": 1920
            },
            {
                "height": 1440,
                "width": 2304
            },
            {
                "height": 1440,
                "width": 2560
            },
            {
                "height": 1600,
                "width": 2560
            },
            {
                "height": 1800,
                "width": 2880
            },
            {
                "height": 2160,
                "width": 3840
            },
            {
                "height": 2304,
                "width": 4096
            },
            {
                "height": 2880,
                "width": 5120
            }
        ]
    }
}
```

### Set Profile Password

`POST https://api.multilogin.com/profile/security/enable`

**Query Params**

| Key | Value | Description |
| --- | --- | --- |
| profiles | profile_id, password, confirm_password, restricted | `Required`. |
| profile_id | uuid | `Required`. |
| password | your_password | `Required`. |
| confirm_password | your_password | `Required`. |
| restricted | "profile_move", "profile_clone", "profile_start", "profile_export", "profile_update", "profile_data_change" | `Required`. Specify restricted actions. When sending an empty array, all the actions are restricted. |

**Headers**

| Key | Value | Description |
| --- | --- | --- |
| Content-Type | application/json |  |
| Accept | application/json |  |
| Authorization | Bearer <token> |  |

**Request Body**

```json
{
    "profiles": [
        {
            "profile_id": "<string>",
            "password": "<string>",
            "confirm_password": "<string>",
            "restricted": [
                    "profile_move",
                    "profile_clone",
                    "profile_start",
                    "profile_export",
                    "profile_update",
                    "profile_data_change"
            ]
        }
    ]
}
```

**Responses**

- Set Profile Password

```json
{
    "status": {
        "error_code": "",
        "http_code": 200,
        "message": "Successfully setting a password for a profile"
    },
    "data": [
        "f1641bea-9326-40b5-b63e-60123304a3c8"
    ]
}
```

### Remove Password

`POST https://api.multilogin.com/profile/security/disable`

**Query Params**

| Key | Value | Description |
| --- | --- | --- |
| profile_ids | ["uuid"] | `Required`. |

**Headers**

| Key | Value | Description |
| --- | --- | --- |
| Content-Type | application/json |  |
| Accept | application/json |  |
| Authorization | Bearer <token> |  |

**Request Body**

```json
{
    "profile_ids": [
        "<string>"
    ]
}
```

**Responses**

- Remove Password

```json
{
    "status": {
        "error_code": "",
        "http_code": 200,
        "message": "Password removed successfully"
    },
    "data": null
}
```

### Log In Profile

`POST https://api.multilogin.com/profile/login`

**Query Params**

| Key | Value | Description |
| --- | --- | --- |
| profile_id | uuid | `Required`. |
| password | your_password | `Required`. |

**Headers**

| Key | Value | Description |
| --- | --- | --- |
| Content-Type | application/json |  |
| Accept | application/json |  |
| Authorization | Bearer <token> |  |

**Request Body**

```json
{
  "password": "<string>",
  "profile_id": "<string>"
}
```

**Responses**

- Log In Profile (200)

```json
{
    "status": {
        "error_code": "",
        "http_code": 200,
        "message": "Authenticated successfully"
    },
    "data": {
        "token": "your.jwt.token"
    }
}
```

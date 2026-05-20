# Launcher

Source: Multilogin Postman collection (caee91dd-0a38-4db6-8f66-e65db86c1a2a)
Generated locally: 2026-05-18

For automation users, if you need the agent to be launched automatically every time you restart your device, here is the article from our support knowledge on how to make it happen.

## Endpoints

### Start Browser Profile

`GET https://launcher.mlx.yt:45001/api/v2/profile/f/:folder_id/p/:profile_id/start?automation_type=selenium, puppeteer, playwright&headless_mode=false,true`

This endpoint supports both Strict and Non-Strict modes. In Strict mode, all required parameters must be explicitly specified. In contrast, Non-Strict mode allows for faster usage by applying default values to any unspecified parameters. Default values will be visible for each parameter.

Start a browser profile.

The endpoint will return a port for automation in the response message if the automation type parameter is passed. See `automation_type` in the "Query Params" section.

**NB: Mimic profiles will work with** **`custom_start_urls`** **only if** **`automation_type`** **is NOT specified. This is to be fixed soon.****Stealthfox profiles work as expected.**

**Required parameters for Strict mode:**

```json
"folder_id":"",
"profile_id":"",
"automation_type":"",
"headless_mode":

```

**Path Variables**

| Key | Value | Description |
| --- | --- | --- |
| folder_id | uuid | `Required`. Specify the ID of the folder where the profile to launch is stored. Defaults to `default folder`. |
| profile_id | uuid | `Required`. Specify the ID of the profile to launch. |

**Query Params**

| Key | Value | Description |
| --- | --- | --- |
| automation_type | selenium, puppeteer, playwright | `Optional`. Specify the automation type. Mimic can work with any of the types. Stealthfox can only work with **selenium**. Defaults to `selenium`. |
| headless_mode | false,true | `Optional`. Enable headless mode for all browsers. Defaults to `false`. |

**Headers**

| Key | Value | Description |
| --- | --- | --- |
| Accept | application/json |  |
| X-Strict-Mode | boolean | Default to false. If set to true, you must specify values for all required parameters. |

**Responses**

- Profile Started (200)

```json
{
    "data": {
        "browser_type": "mimic",
        "core_version": 132,
        "id": "81b5627a-1212-4016-9467-3dbe4d6f78eb",
        "is_quick": false,
        "port": "55513"
    },
    "status": {
        "error_code": "",
        "http_code": 200,
        "message": "Profile started successfully"
    }
}
```

### Start Quick Profile v3

`POST https://launcher.mlx.yt:45001/api/v3/profile/quick`

This endpoint supports both Strict and Non-Strict modes. In Strict mode, all required parameters must be explicitly specified. In contrast, Non-Strict mode allows for faster usage by applying default values to any unspecified parameters. Default values will be visible for each parameter.

Create a one-time quick browser profile, that opens up after the call is successfully made. Browsing activity and its related data is not saved after the profle has been stopped.

Fingerprint parameters need providing only if flags set to `Custom`.

Check out **Params** to see what each key-value pair is about. To copy the example request body, navigate to **Body**.

Note that the custom URL feature will be available for Mimic quick browsers **ONLY** if the `automation` value is not provided in the request. Stealthfox browsers works as expected.

If you would like to avoid having your profiles updated to the latest available core, specify `auto_update_core` (`true` or `false`) and a specific `core_version`.
Updating existing profiles to a specific core version is not supported.

**Mimic quick profiles will work with** **`custom_start_urls`** **only if** **`automation_type`** **is NOT specified. This is to be fixed soon. Stealthfox profiles work as expected.**

**NB: It is recommended to use the default values, which keep your browser cores up-to-date. Multilogin does not bear any responsability for ban or detection-related issues if profiles have a dated core version.**

**Required parameters for Strict mode:**

Start Quick Profile v3 has `proxy` inside `parameters`.

```json
{
    "browser_type": "",
    "os_type": "",
    "automation": "",
    "auto_update_core": ,
    "core_version": ,
    "is_headless": ,
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
            "canvas_noise" :"value",
            "startup_behavior" :"value"
        }
        "fingerprint": {}
}

```

The number of parameters in `fingerprint` may vary depending on the flag values passed in the request body.

To use quick profiles with Script Runner, use the following additional parameters:

```json
"automation": "selenium",
"script_file": "your_file.py"

```

**Query Params**

| Key | Value | Description |
| --- | --- | --- |
| browser_type | "mimic", "stealthfox" | `Required`. Choose the browser type. Note: For `android` only mimic is supported! Defaults to `mimic`, |
| core_version | 124 | `Optional`. You can skip specifying the value since your profiles will be updated to the latest core each time it is launched. Defaults to `latest`. Cannot specify the version that is 6 versions older then the current latest one. |
| core_minor_version | 1 | `Optional`. Specify the minor version based on its availability. |
| os_type | "linux", "macos", "windows", "android" | `Required`. Specify the OS. Defaults to `windows`. |
| script_file | "your_.py_file" | `Optional` |
| automation | selenium | `Optional`. `selenium` only for working with Script Runner. Defaults to `selenium`. |
| is_headless | true,false | `Optional`. Enable headless mode. Defaults to `false`. |
| proxy | {     "host": "foo",     "type": "foo",     "port": 1234,     "username": "foo",     "password": "foo"      "save_traffic": false } | `Optional` for `parameters`. Add a proxy to your profiles. |
| save_traffic | false, true | `Optional` for `proxy`. `false` is set by default. When set to `true`,  disables the loading of images/videos saving the proxy traffic. |
| parameters | flags,  fingerprints, storage, proxy,  custom_start_urls | `Required`. Specify parameters for your profiles. `flags`, `fingerprints`, `storage` **are required** for **parameters**. |
| flags | webrtc_masking, proxy_masking, geolocation_popup, audio_masking, graphics_noise, ports_masking, navigator_masking, localization_masking, timezone_masking, graphics_masking, fonts_masking, media_devices_masking, screen_masking, geolocation_masking, canvas_noise, startup_behavior | `Required`. Specify flags for your profiles. `webrtc_masking, proxy_masking, geolocation_popup, audio_masking, graphics_noise, ports_masking, navigator_masking, localization_masking, timezone_masking, graphics_masking, fonts_masking, media_devices_masking, screen_masking, geolocation_masking` **are required** for **parameters**. |
| webrtc_masking | "natural", "custom", "mask", "disabled" | `Required` for `flags`. Defaults to `mask`. |
| geolocation_popup | "prompt", "allow", "block" | `Required` for `flags`. Defaults to `prompt`. |
| audio_masking, graphics_noise | "mask", "natural" | `Required` for `flags`. Defaults to `mask` for graphic_noise and to `natural` for audio masking. |
| proxy_masking | "custom", "disabled" | `Required` for `flags`. Defaults to `disabled` unsell proxy is provided, than defaults to `custom`. |
| navigator_masking, localization_masking, timezone_masking, graphics_masking, fonts_masking, media_devices_masking, screen_masking, ports_masking | "natural", "custom", "mask" | `Required` for `flags`. Defaults to `mask` and for media_devices_masking defaults to `natural`. |
| geolocation_masking | "custom", "mask" | `Required` for `flags`. Defaults to `mask`. |
| canvas_noise | "mask", "natural", "disabled" | `Optional` for`flags`. The value is set based on the value of `graphics_noise` by default. To set a specific value for `canvas_noise`, include `canvas_noise` in your request body. Defaults to `mask`. |
| startup_behavior | "recover",  "custom" | `Optional` for `flags`. `recover` is set by default and allows opening profiles with the tabs from the last session. `custom` opens up profiles with provided custom pages in `custom_start_urls`. Defaults to `recover`. |
| fingerprint | navigator, localization, timezone, graphic, webrtc, media_devices, screen,  geolocation,  ports,  fonts,  cmd_params | `Required` for `parameters`. Specify fingerprints of your profiles if flags are set to `Custom`. Defaults to `optional` unless custom is set. |
| hardware_concurrency | 2, 4, 6, 8, 12, 16, 32 | `Required` for `navigator`. Specify the value for `hardware_concurrency` if the flag is `Custom`. |
| user_agent | "your_custom_value" | `Required` for `navigator`. Specify the value for `user-agent`. |
| platform | "your_custom_value" | `Required` for `navigator`. Specify the value for `platform` if the flag is `Custom`. |
| os_cpu | "your_custom_value" | `Oprtional` for `navigator`. Specify the value for `os_cpu`if the flag is `Custom`. |
| accept_languages | "your_custom_value" | `Required` for `localization`. Specify the value for `accept_languages` if the flag is `Custom`. |
| languages | "your_custom_value" | `Required` for `localization`. Pass an empty string. |
| locale | "your_custom_value" | `Required` for `localization`. Pass an empty string. |
| zone | "your_custom_value" | `Required` for `timezone`.  Specify the value for `zone`. |
| vendor | "your_custom_value" | `Required` for `graphic`. Specify the value for `vendor` if the flag is `Custom`. |
| renderer | "your_custom_value" | `Required` for `graphic`. Specify the value for `renderer` if the flag is `Custom`. |
| vendor_id | "your_custom_value" | `Optional` for `graphic`. Specify the value for `vendor_id` if the flag is `Custom`. |
| renderer_id | "your_custom_value" | `Optional` for `graphic`. Specify the value for `renderer_id` if the flag is `Custom`. |
| public_ip | "your_custom_value" | `Required` for `webrtc`. Specify the value for `public_ip` if the flag is `Custom`. |
| audio_outputs | your_number | `Required` for `media_devices`. Specify the value for `audio_outputs` if the flag is `Custom`. |
| video_inputs | your_number | `Required` for `media_devices`. Specify the value for `video_inputs` if the flag is `Custom`. |
| audio_inputs | your_number | `Required` for `media_devices`. Specify the value for `audio_inputs` if the flag is `Custom`. |
| width | 360 - 5000 | `Required` for `screen`. Specify the value for `width` if the flag is `Custom`. |
| height | 640 - 3000 | `Required` for `screen`.  Specify the value for `height` if the flag is `Custom`. |
| pixel_ratio | 1.0 - 5.0 | `Required` for `screen`. Specify the value for `pixel_ratio` if the flag is `Custom`. |
| ports | [0 - 65535] | `Optional`. Specify the value for `ports` if the flag is `Custom`. |
| accuracy | your_number | `Required` for `geolocation`. Specify the value for `accuracy` if the flag is `Custom`. |
| altitude | your_number | `Required` for `geolocation`. Specify the value for `altitude` if the flag is `Custom`. |
| longitude | your_number | `Required` for `geolocation`. Specify the value for `longitude` if the flag is `Custom`. |
| latitude | your_number | `Required` for `geolocation`. Specify the value for `latitude` if the flag is `Custom`. |
| fonts | ["Font"] | `Optional` for `fingerprints`. Specify the value for `fonts` if the flag is `Custom`. |
| cmd_params | {                 "params": [                     {                         "flag": "<string>",                         "value": "<string>"                     }                 ]             } | `Optional` for `fingerprints`. Specify command line parameters for browsers. |
| custom_start_urls | ["url"] | `Optional`. Specify custom URLs. Max amount is 5. Defaults to `optional` unselss custom is set. |
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
    "browser_type": "<string>",
    "os_type": "<string>",
    "script_file": "<string>",
    "automation": "<string>",
    "core_version": <integer>,
    "core_minor_version": <integer>,
    "is_headless": <boolean>,
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
            "startup_behavior": "<string>"
        },
        "proxy": {
            "host": "<string>",
            "type": "<string>",
            "port": <integer>,
            "username": "<string>",
            "password": "<string>"
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
        "custom_start_urls": [
            "<string>"
        ]
    }
}
```

**Responses**

- Quick Profile v3 started (200)

```json
{
    "data": {
        "browser_type": "mimic",
        "core_version": 132,
        "id": "d04aa438-d887-11ef-8d6d-0a0027000012",
        "is_quick": true,
        "port": "55579"
    },
    "status": {
        "error_code": "",
        "http_code": 200,
        "message": "Quick profile started successfully"
    }
}
```

### Start Quick Profile

`POST https://launcher.mlx.yt:45001/api/v2/profile/quick`

**To be deprecated. Use Start Quick Profile v3 for starting quick browser profiles.**

Create a one-time quick browser profile, that opens up after the call is successfully made. Browsing activity and its related data is not saved after the profle has been stopped.

Fingerprint parameters need providing only if flags set to `Custom`.

Check out **Params** to see what each key-value pair is about. To copy the example request body, navigate to **Body**.

If you would like to avoid having your profiles updated to the latest available core, specify `auto_update_core` (`true` or `false`) and a specific `core_version`.
Updating existing profiles to a specific core version is not supported.

**Mimic quick profiles will work with** **`custom_start_urls`** **only if** **`automation_type`** **is NOT specified. This is to be fixed soon. Stealthfox profiles work as expected.**

**NB: It is recommended to use the default values, which keep your browser cores up-to-date. Multilogin does not bear any responsability for ban or detection-related issues if profiles have a dated core version.**

**Required parameters:**

```json
{
    "browser_type": "",
    "os_type": "",
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
            "webrtc_masking": "value"
        }
        "fingerprint": {}
}

```

The number of parameters in `fingerprint` may vary depending on the flag values passed in the request body.

**Query Params**

| Key | Value | Description |
| --- | --- | --- |
| browser_type | "mimic", "stealthfox" | `Required`. Choose the browser type. Note: For `android` only mimic is supported! |
| auto_update_core | true, false | `Optional` You can skip specifying the value since your profiles will be updated to the latest core by default each time it is launched. |
| core_version | 124 | `Optional`. You can skip specifying the value since your profiles will be updated to the latest core each time it is launched. |
| os_type | "linux", "macos", "windows", "android" | `Required`. Specify the OS. |
| automation | selenium, playwright, puppeteer | `Optional`. Specify the automation type. Mimic can work with any of the types. Stealthfox can only work with **selenium**. |
| is_headless | true,false | `Optional`. Enable headless mode. |
| proxy | {     "host": "foo",     "type": "foo",     "port": 1234,     "username": "foo",     "password": "foo" } | `Optional` for `parameters`. Add a proxy to your profiles. |
| save_traffic | false, true | `Optional` for `proxy`. `false` is set by default. When set to `true`,  disables the loading of images/videos saving the proxy traffic. |
| parameters | flags,  fingerprints, storage, proxy,  custom_start_urls | `Required`. Specify parameters for your profiles. `flags`, `fingerprints`, `storage` **are required** for **parameters**. |
| flags | webrtc_masking, proxy_masking, geolocation_popup, audio_masking, graphics_noise, ports_masking, navigator_masking, localization_masking, timezone_masking, graphics_masking, fonts_masking, media_devices_masking, screen_masking, geolocation_masking, canvas_noise, startup_behavior | `Required`. Specify flags for your profiles. `webrtc_masking, proxy_masking, geolocation_popup, audio_masking, graphics_noise, ports_masking, navigator_masking, localization_masking, timezone_masking, graphics_masking, fonts_masking, media_devices_masking, screen_masking, geolocation_masking` **are required** for **parameters**. |
| webrtc_masking | "natural", "custom", "mask", "disabled" | `Required` for `flags`. |
| geolocation_popup | "prompt", "allow", "block" | `Required` for `flags`. |
| audio_masking, graphics_noise | "mask", "natural" | `Required` for `flags`. |
| proxy_masking | "custom", "disabled" | `Required` for `flags`. |
| navigator_masking, localization_masking, timezone_masking, graphics_masking, fonts_masking, media_devices_masking, screen_masking, ports_masking | "natural", "custom", "mask" | `Required` for `flags`. |
| geolocation_masking | "custom", "mask" | `Required` for `flags`. |
| canvas_noise | "mask", "natural", "disabled" | `Optional` for`flags`. The value is set based on the value of `graphics_noise` by default. To set a specific value for `canvas_noise`, include `canvas_noise` in your request body. |
| startup_behavior | "recover",  "custom" | `Optional` for `flags`. `recover` is set by default and allows opening profiles with the tabs from the last session. `custom` opens up profiles with provided custom pages in `custom_start_urls`. |
| fingerprint | navigator, localization, timezone, graphic, webrtc, media_devices, screen,  geolocation,  ports,  fonts,  cmd_params | `Required` for `parameters`. Specify fingerprints of your profiles if flags are set to `Custom`. |
| hardware_concurrency | 2, 4, 6, 8, 12, 16, 32 | `Required` for `navigator`. Specify the value for `hardware_concurrency` if the flag is `Custom`. |
| user_agent | "your_custom_value" | `Required` for `navigator`. Specify the value for `user-agent`. |
| platform | "your_custom_value" | `Required` for `navigator`. Specify the value for `platform` if the flag is `Custom`. |
| os_cpu | "your_custom_value" | `Oprtional` for `navigator`. Specify the value for `os_cpu`if the flag is `Custom`. |
| accept_languages | "your_custom_value" | `Required` for `localization`. Specify the value for `accept_languages` if the flag is `Custom`. |
| languages | "your_custom_value" | `Required` for `localization`. Pass an empty string. |
| locale | "your_custom_value" | `Required` for `localization`. Pass an empty string. |
| zone | "your_custom_value" | `Required` for `timezone`.  Specify the value for `zone`. |
| vendor | "your_custom_value" | `Required` for `graphic`. Specify the value for `vendor` if the flag is `Custom`. |
| renderer | "your_custom_value" | `Required` for `graphic`. Specify the value for `renderer` if the flag is `Custom`. |
| vendor_id | "your_custom_value" | `Optional` for `graphic`. Specify the value for `vendor_id` if the flag is `Custom`. |
| renderer_id | "your_custom_value" | `Optional` for `graphic`. Specify the value for `renderer_id` if the flag is `Custom`. |
| public_ip | "your_custom_value" | `Required` for `webrtc`. Specify the value for `public_ip` if the flag is `Custom`. |
| audio_outputs | your_number | `Required` for `media_devices`. Specify the value for `audio_outputs` if the flag is `Custom`. |
| video_inputs | your_number | `Required` for `media_devices`. Specify the value for `video_inputs` if the flag is `Custom`. |
| audio_inputs | your_number | `Required` for `media_devices`. Specify the value for `audio_inputs` if the flag is `Custom`. |
| width | 360 - 5000 | `Required` for `screen`. Specify the value for `width` if the flag is `Custom`. |
| height | 640 - 3000 | `Required` for `screen`.  Specify the value for `height` if the flag is `Custom`. |
| pixel_ratio | 1.0 - 5.0 | `Required` for `screen`. Specify the value for `pixel_ratio` if the flag is `Custom`. |
| ports | [0 - 65535] | `Optional`. Specify the value for `ports` if the flag is `Custom`. |
| accuracy | your_number | `Required` for `geolocation`. Specify the value for `accuracy` if the flag is `Custom`. |
| altitude | your_number | `Required` for `geolocation`. Specify the value for `altitude` if the flag is `Custom`. |
| longitude | your_number | `Required` for `geolocation`. Specify the value for `longitude` if the flag is `Custom`. |
| latitude | your_number | `Required` for `geolocation`. Specify the value for `latitude` if the flag is `Custom`. |
| fonts | ["Font"] | `Optional` for `fingerprints`. Specify the value for `fonts` if the flag is `Custom`. |
| cmd_params | {                 "params": [                     {                         "flag": "<string>",                         "value": "<string>"                     }                 ]             } | `Optional` for `fingerprints`. Specify command line parameters for browsers. |
| custom_start_urls | ["url"] | `Optional`. Specify custom URLs. Max amount is 5. |
| max_touch_points | 1 - 10 | `Optional` for `fingerprint` with `android` os. Default is 5. |

**Headers**

| Key | Value | Description |
| --- | --- | --- |
| Content-Type | application/json |  |
| Accept | application/json |  |

**Request Body**

```json
{
    "browser_type": "<string>",
    "os_type": "<string>",
    "automation": "<string>",
    "core_version": <integer>,
    "is_headless": <boolean>,
    "proxy": {
        "host": "<string>",
        "type": "<string>",
        "port": <integer>,
        "username": "<string>",
        "password": "<string>",
        "save_traffic": "<boolean>"
    },
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
            "startup_behavior": "<string>"
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
        "custom_start_urls": [
            "<string>"
        ]
    }
}
```

**Responses**

- Quick Profile Started (200)

```json
{
    "data": {
        "browser_type": "mimic",
        "core_version": 132,
        "id": "d04aa438-d887-11ef-8d6d-0a0027000012",
        "is_quick": true,
        "port": "55579"
    },
    "status": {
        "error_code": "",
        "http_code": 200,
        "message": "Quick profile started successfully"
    }
}
```

### Stop Browser Profile

`GET https://launcher.mlx.yt:45001/api/v1/profile/stop/p/:profile_id`

Stop a browser profile.

**Path Variables**

| Key | Value | Description |
| --- | --- | --- |
| profile_id | uuid | `Required`. Specify the ID of the profile to launch. |

**Headers**

| Key | Value | Description |
| --- | --- | --- |
| Accept | application/json |  |

**Responses**

- Profile Removed (200)

```json
{
    "status": {
        "error_code": "",
        "http_code": 200,
        "message": ""
    }
}
```

### Stop All Profiles

`GET https://launcher.mlx.yt:45001/api/v1/profile/stop_all?type=all, regular, quick`

Stop all the launched profiles.

**Query Params**

| Key | Value | Description |
| --- | --- | --- |
| type | all, regular, quick | `Optional`. Specify the type of profile to stop. `all` is set by default. |

**Headers**

| Key | Value | Description |
| --- | --- | --- |
| Accept | application/json |  |

**Responses**

- Profiles Stopped (200)

```json
{
    "status": {
        "error_code": "",
        "http_code": 200,
        "message": ""
    }
}
```

### Get Version

`GET https://launcher.mlx.yt:45001/api/v1/version`

Fetch the launcher version.

**Headers**

| Key | Value | Description |
| --- | --- | --- |
| Accept | application/json |  |

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

- Version Fetched (200)

```json
{
    "data": {
        "env": "SOME_ENV",
        "version": "1.11.1"
    },
    "status": {
        "error_code": "",
        "http_code": 200,
        "message": ""
    }
}
```

### Get Profile Status

`GET https://launcher.mlx.yt:45001/api/v1/profile/status/p/:profile_id`

Get the status of a single profile launched during the last session with Agent. If Agent is restarted, there will be no data to fetch.

Possible profile statuses:

- `download_browser_profile_metadata`

- `download_browser_profile_data`

- `download_browser_core`

- `download_finished`

- `download_meta_error`

- `download_data_error`

- `download_core_error`

- `download_meta_finished`

- `download_data_finished`

- `download_core_finished`

- `validate_proxy`

- `validate_proxy_error`

- `start_browser`

- `start_browser_error`

- `browser_running`

- `stopped`

**Path Variables**

| Key | Value | Description |
| --- | --- | --- |
| profile_id | uuid | `Required`. Specify the ID of the profile to launch. |

**Headers**

| Key | Value | Description |
| --- | --- | --- |
| Accept | application/json |  |

**Responses**

- Status Fetched (200)

```json
{
    "data": {
        "browser_type": "stealthfox",
        "core_version": 139,
        "folder_id": "az9b0b1c-f16e-4b08-bb70-50000e2c7b0a",
        "in_use_by": "user@multilogin.com",
        "is_quick": false,
        "last_launched_at": "2025-06-26T13:53:48.0788673Z",
        "last_launched_by": "user@multilogin.com",
        "last_launched_on": "30a2a2487443a77d7f19f3e9f5abd4fe7e52987682f9fc3aa5d415b9f9f51637",
        "message": "",
        "name": "Gregg.Keeling",
        "profile_id": "7402a60d-74c8-498f-8e63-4d87f058ec5c",
        "status": "browser_running",
        "timestamp": 1750946030108,
        "workspace_id": "az9b0b1c-f16e-4b08-bb70-50000e2c7b0a"
    },
    "status": {
        "error_code": "",
        "http_code": 200,
        "message": ""
    }
}
```

### Get All Profiles Status

`GET https://launcher.mlx.yt:45001/api/v1/profile/statuses`

Get the status of all the profiles launched during the last session with Agent. If Agent is restarted, there will be no data to fetch.

**Possible profile statuses:**

- `download_browser_profile_metadata`

- `download_browser_profile_data`

- `download_browser_core`

- `download_finished`

- `download_meta_error`

- `download_data_error`

- `download_core_error`

- `download_meta_finished`

- `download_data_finished`

- `download_core_finished`

- `validate_proxy`

- `validate_proxy_error`

- `start_browser`

- `start_browser_error`

- `browser_running`

- `stopped`

**Possible script statuses:**

- `running`

- `finished`

- `stopped`

- `error`

**Headers**

| Key | Value | Description |
| --- | --- | --- |
| Accept | application/json |  |

**Responses**

- Status Fetched (200)

```json
{
    "data": {
        "active_counter": {
            "cloud": 2,
            "local": 0,
            "quick": 1
        },
        "states": {
            "4ac17621-dcd5-47c4-bc30-07320d580414": {
                "browser_type": "stealthfox",
                "core_version": 139,
                "folder_id": "fb9b0b1c-f16e-4b08-bb69-25942e2c7b0a",
                "in_use_by": "user@multilogin.com",
                "is_quick": false,
                "last_launched_at": "2025-06-26T13:56:32.3345897Z",
                "last_launched_by": "user@multilogin.com",
                "last_launched_on": "30a2a2487443a77d7f19f3e9f5abd4fe7e52987682f9fc3aa5d415b9f9f51637",
                "message": "",
                "name": "Martina64",
                "profile_id": "4ac17621-dcd5-47c4-bc30-07320d580414",
                "status": "browser_running",
                "timestamp": 1750946194258,
                "workspace_id": "fb9b0b1c-f16e-4b08-bb69-25942e2c7b0a"
            },
            "6f8566f7-5295-11f0-b714-0a0027000014": {
                "browser_type": "mimic",
                "core_version": 137,
                "folder_id": "",
                "in_use_by": "",
                "is_quick": true,
                "last_launched_by": "",
                "last_launched_on": "",
                "message": "",
                "name": "intelligent_adam",
                "profile_id": "6f8566f7-5295-11f0-b714-0a0027000014",
                "status": "browser_running",
                "timestamp": 1750946223504,
                "workspace_id": "fb9b0b1c-f16e-4b08-bb69-25942e2c7b0a"
            },
            "7402a60d-74c8-498f-8e63-4d87f058ec5c": {
                "browser_type": "stealthfox",
                "core_version": 139,
                "folder_id": "fb9b0b1c-f16e-4b08-bb69-25942e2c7b0a",
                "in_use_by": "user@multilogin.com",
                "is_quick": false,
                "last_launched_at": "2025-06-26T13:53:48.0788673Z",
                "last_launched_by": "user@multilogin.com",
                "last_launched_on": "30a2a2487443a77d7f19f3e9f5abd4fe7e52987682f9fc3aa5d415b9f9f51637",
                "message": "",
                "name": "Gregg.Keeling",
                "profile_id": "7402a60d-74c8-498f-8e63-4d87f058ec5c",
                "status": "browser_running",
                "timestamp": 1750946030108,
                "workspace_id": "fb9b0b1c-f16e-4b08-bb69-25942e2c7b0a"
            }
        }
    },
    "status": {
        "error_code": "",
        "http_code": 200,
        "message": ""
    }
}
```

### Get All Quick Profiles Status

`GET https://launcher.mlx.yt:45001/api/v1/profile/quick/statuses`

Get the status of all the quick profiles launched during the last session with Agent. If Agent is restarted, there will be no data to fetch.

**Possible profile statuses:**

- `download_browser_profile_metadata`

- `download_browser_profile_data`

- `download_browser_core`

- `download_finished`

- `download_meta_error`

- `download_data_error`

- `download_core_error`

- `download_meta_finished`

- `download_data_finished`

- `download_core_finished`

- `validate_proxy`

- `validate_proxy_error`

- `start_browser`

- `start_browser_error`

- `browser_running`

- `stopped`

**Headers**

| Key | Value | Description |
| --- | --- | --- |
| Accept | application/json |  |

**Responses**

- Status Fetched (200)

```json
{
    "data": {
        "active_counter": 2,
        "states": {
            "0f917d6e-13a3-11f0-b2e5-0a0027000012": {
                "browser_type": "mimic",
                "is_quick": true,
                "message": "57165",
                "name": "hardworking_vladimir",
                "status": "browser_running",
                "timestamp": 1744025152872
            },
            "115282d0-13a3-11f0-b2e5-0a0027000012": {
                "browser_type": "mimic",
                "is_quick": true,
                "message": "57193",
                "name": "compassionate_lindsey",
                "status": "browser_running",
                "timestamp": 1744025155051
            }
        }
    },
    "status": {
        "error_code": "",
        "http_code": 200,
        "message": ""
    }
}
```

### Loaded Browser Cores

`GET https://launcher.mlx.yt:45001/api/v1/loaded_browser_cores`

Fetch a list of cores saved on your machine.

**Headers**

| Key | Value | Description |
| --- | --- | --- |
| Accept | application/json |  |

**Responses**

- Cores Loaded (200)

```json
{
    "data": [
        {
            "is_latest": true,
            "latest_version": "123",
            "type": "mimic",
            "versions": [
                "121.28"
            ]
        },
        {
            "is_latest": true,
            "latest_version": "124",
            "type": "stealthfox",
            "versions": [
                "124.8"
            ]
        }
    ],
    "status": {
        "error_code": "",
        "http_code": 200,
        "message": ""
    }
}
```

### Browser Core List

`GET https://api.multilogin.com/bcs/core/list`

This endpoint supports both Strict and Non-Strict modes. In Strict mode, all required parameters must be explicitly specified. In contrast, Non-Strict mode allows for faster usage by applying default values to any unspecified parameters. Default values will be visible for each parameter.

Fetch a list of available browser core versions for a given browser.

**NB: Make certain that Launcher is running before calling the endpoint.**

**Required parameters for Strict mode:**

```json
{
  "browser_type": ""
}

```

**Query Params**

| Key | Value | Description |
| --- | --- | --- |
| browser_type | mimic, stealthfox | Specify the browser type. Defaults to `mimic`. |

**Headers**

| Key | Value | Description |
| --- | --- | --- |
| Accept | application/json |  |
| X-Strict-Mode | boolean | Default to false. If set to true, you must specify values for all required parameters. |

**Request Body**

```json
{
  "browser_type": "<string>"
}
```

**Responses**

- Browser Core List Fetched (200)

```json
{
    "status": {
        "error_code": "",
        "http_code": 200,
        "message": ""
    },
    "data": {
        "core_versions": [
            {
                "browser_type": "mimic",
                "versions": [
                    {
                        "full_versions": [
                            "135.3"
                        ],
                        "major_version": 135
                    },
                    {
                        "full_versions": [
                            "134.5"
                        ],
                        "major_version": 134
                    },
                    {
                        "full_versions": [
                            "133.9",
                            "133.6"
                        ],
                        "major_version": 133
                    },
                    {
                        "full_versions": [
                            "132.4",
                            "132.3"
                        ],
                        "major_version": 132
                    },
                    {
                        "full_versions": [
                            "131.7",
                            "131.2"
                        ],
                        "major_version": 131
                    },
                    {
                        "full_versions": [
                            "130.6",
                            "130.2"
                        ],
                        "major_version": 130
                    }
                ]
            },
            {
                "browser_type": "stealthfox",
                "versions": [
                    {
                        "full_versions": [
                            "137.1"
                        ],
                        "major_version": 137
                    },
                    {
                        "full_versions": [
                            "136.4"
                        ],
                        "major_version": 136
                    },
                    {
                        "full_versions": [
                            "135.5",
                            "135.3"
                        ],
                        "major_version": 135
                    },
                    {
                        "full_versions": [
                            "134.2",
                            "134.1"
                        ],
                        "major_version": 134
                    },
                    {
                        "full_versions": [
                            "133.2"
                        ],
                        "major_version": 133
                    },
                    {
                        "full_versions": [
                            "132.3"
                        ],
                        "major_version": 132
                    }
                ]
            }
        ]
    }
}
```

### Load Browser Core

`GET https://launcher.mlx.yt:45001/api/v1/load_browser_core?browser_type=mimic,stealthfox&version=123`

This endpoint supports both Strict and Non-Strict modes. In Strict mode, all required parameters must be explicitly specified. In contrast, Non-Strict mode allows for faster usage by applying default values to any unspecified parameters. Default values will be visible for each parameter.

Load a particular browser core from the server.

Please note that launching profiles with a dated core version may significantly increase the chances of getting detected.

**Required parameters for Strict mode:**

```json
"browser_type": "value>",
"version" :

```

**Query Params**

| Key | Value | Description |
| --- | --- | --- |
| browser_type | mimic,stealthfox | `Required`. Specify the browser type. Defaults to `mimic` |
| version | 123 | `Required`. Specify the core version. Defaults to `latest`. |

**Headers**

| Key | Value | Description |
| --- | --- | --- |
| Accept | application/json |  |
| X-Strict-Mode | boolean | Default to false. If set to true, you must specify values for all required parameters. |

**Responses**

- Core Loaded (500)

```json
{
    "status": {
        "error_code": "",
        "http_code": 200,
        "message": "Download started"
    }
}
```

### Delete Browser Core

`DELETE https://launcher.mlx.yt:45001/api/v1/delete_browser_core?browser_type=mimic,stealthfox&version=116`

This endpoint supports both Strict and Non-Strict modes. In Strict mode, all required parameters must be explicitly specified. In contrast, Non-Strict mode allows for faster usage by applying default values to any unspecified parameters. Default values will be visible for each parameter.

Delete a browser core from your machine.

**Required parameters for Strict mode:**

```json
"browser_type": "value>",
"version" :

```

**Query Params**

| Key | Value | Description |
| --- | --- | --- |
| browser_type | mimic,stealthfox | `Required`. Specify the browser type. Defaults to `mimic` |
| version | 116 | `Required`. Specify the core version. Defaults to `latest`. |

**Headers**

| Key | Value | Description |
| --- | --- | --- |
| Accept | application/json |  |
| X-Strict-Mode | boolean | Default to false. If set to true, you must specify values for all required parameters. |

**Responses**

- Core Deleted (200)

```json
{
    "status": {
        "error_code": "",
        "http_code": 200,
        "message": ""
    }
}
```

### Validate Proxy

`POST https://launcher.mlx.yt:45001/api/v1/proxy/validate`

This endpoint supports both Strict and Non-Strict modes. In Strict mode, all required parameters must be explicitly specified. In contrast, Non-Strict mode allows for faster usage by applying default values to any unspecified parameters. Default values will be visible for each parameter.

Check your proxy connection.

**Required parameters for Strict mode:**

```json
{
  "type": "",
  "host": "",
  "port": ,
  "username": "",
  "password": ""
}

```

**Query Params**

| Key | Value | Description |
| --- | --- | --- |
| type | "http", "socks5" | `Required`. Specify the proxy type. Defaults to `http`. |
| host | "your_host.com" | `Required`. Specify the proxy host. |
| port | 1234 | `Required`. Specify the proxy port. |
| username | "your_username" | `Required`. Specify the proxy username. |
| password | "your_password" | `Required`. Specify the proxy password. |

**Headers**

| Key | Value | Description |
| --- | --- | --- |
| accept | application/json |  |
| Content-Type | application/json |  |
| X-Strict-Mode | boolean | Default to false. If set to true, you must specify values for all required parameters. |

**Request Body**

```json
{
  "type": "<string>",
  "host": "<string>",
  "port": <interger>,
  "username": "<string>",
  "password": "<string>"
}
```

**Responses**

- Validate Proxy

```json
{
    "data": {
        "accuracy": 200,
        "altitude": 100,
        "country_code": "CI",
        "ip": "102.67.255.140",
        "latitude": 5.3536,
        "longitude": -4.0012,
        "timezone": "Africa/Abidjan"
    },
    "status": {
        "error_code": "",
        "http_code": 200,
        "message": ""
    }
}
```

### Cookie Import

`POST https://launcher.mlx.yt:45001/api/v1/cookie_import`

This endpoint supports both Strict and Non-Strict modes. In Strict mode, all required parameters must be explicitly specified. In contrast, Non-Strict mode allows for faster usage by applying default values to any unspecified parameters. Default values will be visible for each parameter.

Import cookies or pre-made cookies into your profiles.

Check out **Params** to see what each key-value pair is about. To copy the example request body, please navigate to **Body**.

If the endpoint is beind called programmatically, a text file with a JSON object will be taken as payload.

For Postman users, provide cookies as a JSON object converted to a string directly in to `cookies`.

**Required parameters for Strict mode:**

```json
{
  "profile_id": "",
  "import_advanced_cookies": ,
  "cookies" : "[{\"secure\":true,\"session\":false,\"hostOnly\":false,\"name\":\"compass_uid\",\"path\":\"/\",\"value\":\"7a44a512-551e-4b2b-847d-4ad9df82a74e\",\"domain\":\".eluniversal.com.mx\",\"storeId\":\"0\",\"httpOnly\":false,\"expirationDate\":1729843683463}]"
}

```

**Query Params**

| Key | Value | Description |
| --- | --- | --- |
| profile_id | <your profile id> | `Required` |
| folder_id | <folder of the profile id> | `Required`. Defaults to `default profile ID` |
| import_advanced_cookies | true, false | `Required`. Set `true` if you want to imported the created cookies. |
| cookies | cookies | `Optional`. Only add this if you are using `import_advanced_cookies` to `false` |

**Headers**

| Key | Value | Description |
| --- | --- | --- |
| X-Strict-Mode | boolean | Default to false. If set to true, you must specify values for all required parameters. |

**Request Body**

```json
{
  "profile_id": "<string>",
  "folder_id": "<string>",
  "import_advanced_cookies": <boolean>,
  "cookies" : "[{\"secure\":true,\"session\":false,\"hostOnly\":false,\"name\":\"compass_uid\",\"path\":\"/\",\"value\":\"7a44a512-551e-4b2b-847d-4ad9df82a74e\",\"domain\":\".eluniversal.com.mx\",\"storeId\":\"0\",\"httpOnly\":false,\"expirationDate\":1729843683463}]"
}
```

**Responses**

- Cookie Import

```json
{
    "status": {
        "error_code": "",
        "http_code": 200,
        "message": "Cookies successfully imported"
    }
}
```

### Cookie Export

`POST https://launcher.mlx.yt:45001/api/v1/cookie_export`

Export cookies from your browser profiles.

**Query Params**

| Key | Value | Description |
| --- | --- | --- |
| profile_id | <your profile id> | `Required` |
| folder_id | <folder of the profile id> | `Required` |

**Request Body**

```json
{
  "profile_id": "<string>",
  "folder_id": "<string>"
}
```

**Responses**

- Cookie Import

```json
{
    "data": {
        "cookies": "[cookies]",
        "profile_id": "profile_id",
        "timestamp": 1738595753833
    },
    "status": {
        "error_code": "",
        "http_code": 200,
        "message": "Cookies downloaded successfully."
    }
}
```

### Convert QBP to Profile

`POST https://launcher.mlx.yt:45001/api/v1/profile/quick/save`

In order to use the Convert from QBP to normal profile, you must have the QBP up and running.

**Request Body**

```json
{
  "data": [
    {
      "profile_id": "QBP_id"
    }
  ]
}
```

**Responses**

- Convert QBP to Profile

```json
{
    "status": {
        "error_code": "",
        "http_code": 200,
        "message": "Quick profile successfully saved as local"
    }
}
```

### Get QBP status

`GET https://launcher.mlx.yt:45001/api/v1/profile/quick/statuses`

This endpoint makes an HTTP GET request to retrieve the quick statuses of profiles. The request does not require a request body as it is a GET request. The response will include the status information for the profiles, including details such as profile ID, status message, and timestamp.

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

- Get QBP Status

```json
{
    "data": {
        "active_counter": 1,
        "states": {
            "QBP_id": {
                "browser_type": "mimic",
                "is_quick": true,
                "message": "",
                "name": "test",
                "status": "browser_running",
                "timestamp": 1744706373229
            }
        }
    },
    "status": {
        "error_code": "",
        "http_code": 200,
        "message": ""
    }
}
```

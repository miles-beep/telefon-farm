# Pre-made Cookies

Source: Multilogin Postman collection (caee91dd-0a38-4db6-8f66-e65db86c1a2a)
Generated locally: 2026-05-18

Multilogin X pre-made cookies serve to achieve the highest success rate possible for your browser profiles, eliminating the need of manual labour of collecting cookies and saving you much time when running browser automation or managing multiple profiles.

Multilogin X pre-made cookies are grouped into 6 categories, based on your target website:

- amazon

- bing

- ebay

- facebook

- google

- etsy

- mix

These catergories will enable you to collect reliable cookies for creating a trustworthy browsing history for your profiles.

For more information on Multilogin X pre-made cookies, please visit our knowledge base.

## Endpoints

### Target Website List

`GET https://cookies.multilogin.com/api/v1/cookies/metadata/websites`

Get a list of the target websites available as well as the keyword for the **target_website.**

**Responses**

- Target Website List (200)

```json
{
    "data": [
        {
            "key": "google",
            "value": "google.com"
        },
        {
            "key": "ebay",
            "value": "ebay.com"
        },
        {
            "key": "etsy",
            "value": "etsy.com"
        },
        {
            "key": "bing",
            "value": "bing.com"
        },
        {
            "key": "mix",
            "value": "Mixed cookies (other websites)"
        },
        {
            "key": "facebook",
            "value": "facebook.com"
        },
        {
            "key": "amazon",
            "value": "amazon.com"
        }
    ],
    "status": {
        "error_code": "",
        "http_code": 200,
        "message": ""
    }
}
```

### Create Cookies Metadata

`POST https://cookies.multilogin.com/api/v1/cookies/metadata`

This endpoint supports both Strict and Non-Strict modes. In Strict mode, all required parameters must be explicitly specified. In contrast, Non-Strict mode allows for faster usage by applying default values to any unspecified parameters. Default values will be visible for each parameter.

Create cookies metadata for a given profile. The endpoint does not create cookies by itself. It serves to add cookies-related metadata into a profile. This profile cookies metadata will be used by the server to provide the right cookies for a given target website.

**Required parameters for Strict mode:**

```json
{
  "profile_id": "",
  "target_website": ""
}

```

**Query Params**

| Key | Value | Description |
| --- | --- | --- |
| profile_id | <your profile id> | `Required` |
| target_website | etsy, bing, mix, facebook, amazon, google, ebay | `Required`. Defaults to `mix`. |

**Headers**

| Key | Value | Description |
| --- | --- | --- |
| X-Strict-Mode | boolean | Default to false. If set to true, you must specify values for all required parameters. |

**Request Body**

```json
{
  "profile_id": "<string>",
  "target_website": "<string>"
}
```

**Responses**

- Create Cookies Metadata (201)

```json
{
    "data": {
        "profile_id": "5ff40368-5e1d-451f-8942-30ed23b62c3e"
    },
    "status": {
        "error_code": "",
        "http_code": 201,
        "message": "cookies metadata successfully created"
    }
}
```

### Cookies List

`GET https://cookies.multilogin.com/api/v1/cookies/<your profile id>`

Fetch cookies for a given profile, based on the target website in the cookies metatada created by `POST https://cookies.multilogin.com/api/v1/cookies/metadata.`

Note that cookies returned in the response may not be the same ones to be imported into your browser profiles. The endpoint returns cookies randomly, based on the target website.

**Responses**

- Cookies List (200)

```json
{
    "data": {
        "cookies": [
            {
                "created_at": "2023-07-11T04:37:45.917Z",
                "data": [
                    {
                        "sameParty": false,
                        "name": "__privaci_cookie_no_action",
                        "path": "/",
                        "size": 94,
                        "value": "{\"status\":\"no-action-consent-in-progress\",\"timestamp\":1689050265879}",
                        "domain": "www.dell.com",
                        "secure": true,
                        "sameSite": "None",
                        "sourcePort": 443,
                        "session": false,
                        "httpOnly": false,
                        "sourceScheme": "Secure",
                        "expirationDate": 1740851445102
                    },
                    {
                        "value": "191cf124-2c8b-418f-9dc3-403b21d2006b:36",
                        "domain": "www.dell.com",
                        "httpOnly": false,
                        "sameParty": false,
                        "expirationDate": 1740851445102,
                        "path": "/",
                        "size": 73,
                        "secure": true,
                        "session": false,
                        "sameSite": "None",
                        "sourcePort": 443,
                        "sourceScheme": "Secure",
                        "name": "__privaci_cookie_consent_generated"
                    },
                    {
                        "value": "191cf124-2c8b-418f-9dc3-403b21d2006b:36",
                        "domain": "www.dell.com",
                        "secure": true,
                        "session": false,
                        "sourceScheme": "Secure",
                        "path": "/",
                        "size": 68,
                        "sameSite": "None",
                        "sameParty": false,
                        "sourcePort": 443,
                        "expirationDate": 1740851445102,
                        "name": "__privaci_cookie_consent_uuid",
                        "httpOnly": false
                    },
                    {
                        "name": "_abck",
                        "path": "/",
                        "domain": ".dell.com",
                        "secure": true,
                        "session": false,
                        "sourceScheme": "Secure",
                        "size": 442,
                        "value": "662DBC6DA7610357FB41C44E80C0F51E~-1~YAAQNrsQAnFIFgKJAQAAgbc9Qwo76tL+eovwwoLhG4LQSxSQLVXafQXXCZBXC8xr44Q7UdDD2jko3wfudSCHn1+B7bNV7a1TX3l1JiuxSLgiKLrYomSdCIgdMsDk2G+A/J9rJAxBwuBJ8L/OSllBRLcCg2R9ZtPpM6RQlBBJrxHqj2CZLnuksYBcfxNh98P/JHhq5+XWiShEXXelSFpHaeVyy8jYp5KTz+R4l0kFBiy674llVuMKcvGn3cM2ICRvNjrmWEOqMVkVCQyXUFCS+828Z6l8EfwmEk293FwmEqVLbwqv/3AXGZegnYF16HE07IiFK/BeUwRpioXZ4GZmhyHmIkVaZrH57YaNtf2C6kYsv6WVFz3a9oyJPQiZ+CDLzX5PHPQ=~-1~-1~-1",
                        "
...truncated...
```

### Update Cookies Metadata

`PUT https://cookies.multilogin.com/api/v1/cookies/metadata`

This endpoint supports both Strict and Non-Strict modes. In Strict mode, all required parameters must be explicitly specified. In contrast, Non-Strict mode allows for faster usage by applying default values to any unspecified parameters. Default values will be visible for each parameter.

Update cookies metadata to change the target website.

**Required parameters for Strict mode:**

```json
{
  "profile_id": "",
  "target_website": ""
}

```

**Query Params**

| Key | Value | Description |
| --- | --- | --- |
| profile_id | <your profile id> | `Required` |
| target_website | etsy, bing, mixed, facebook, amazon, google, ebay | `Required`. Defaults to `mix`. |
| additional_website | <string> | `Optional` |

**Headers**

| Key | Value | Description |
| --- | --- | --- |
| X-Strict-Mode | boolean | Default to false. If set to true, you must specify values for all required parameters. |

**Request Body**

```json
{
  "profile_id": "<string>",
  "target_website": "<string>",
   "additional_website": "<string>"
}
```

**Responses**

- Update Cookies Metadata

```json
{
    "status": {
        "error_code": "",
        "http_code": 200,
        "message": "cookies metadata successfully updated"
    }
}
```

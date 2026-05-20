# Browser Profile Data

Source: Multilogin Postman collection (caee91dd-0a38-4db6-8f66-e65db86c1a2a)
Generated locally: 2026-05-18

## Endpoints

### Unlock Locked Profiles

`GET https://api.multilogin.com/bpds/profile/unlock_profiles`

Unlocks all the locked.

To unlock specific profiles, pass the IDs in the request body. Sending a request without any request body unlocks all the profiles.

**It is important to close all the locked profiles before calling this endpoint!**

**Query Params**

| Key | Value | Description |
| --- | --- | --- |
| ids | ["uuid"] | `Optional`. Specify the ID of the profile to unlock. To unlock all the profile, call the endpoint without the body. |

**Headers**

| Key | Value | Description |
| --- | --- | --- |
| Accept | application/json |  |

**Request Body**

```json
{
    "ids": ["<string>"]
}
```

**Responses**

- Profiles Unlocked (500)

```json
{
    "status": {
        "error_code": "",
        "http_code": 200,
        "message": ""
    },
    "data": null
}
```

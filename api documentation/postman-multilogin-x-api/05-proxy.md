# Proxy

Source: Multilogin Postman collection (caee91dd-0a38-4db6-8f66-e65db86c1a2a)
Generated locally: 2026-05-18

## Endpoints

### Generate Proxy

`POST https://profile-proxy.multilogin.com/v1/proxy/connection_url`

This endpoint supports both Strict and Non-Strict modes. In Strict mode, all required parameters must be explicitly specified. In contrast, Non-Strict mode allows for faster usage by applying default values to any unspecified parameters. Default values will be visible for each parameter.

**Required parameters for Strict mode:**

```json
{
  "country": "",
  "sessionType": "",
  "protocol": "",
  "IPTTL": ,
  "count":
}

```

**Query Params**

| Key | Value | Description |
| --- | --- | --- |
| country | "some_country", "any" | `Required`. Specify the country code. Use ISO 3166-1 alpha-2 country codes. Send `any` to generate a random proxy. Defaults to `any`. |
| protocol | "socks5", "http" | `Required`. Specify the desired protocol for the proxy IP. Defaults to `http` |
| sessionType | "sticky", "rotating" | `Required`. Specify the desired session type. Defaults to `sticky`. |
| region | "some_region" | `Optional`. Specify the region or leave as empty string. Use snake_case for specifying the region. |
| city | "some_city" | `Optional`. Specify the city or leave as empty string. Use snake_case for specifying the city. |
| IPTTL | 0 | `Optional`. Specify the IP time-to-live value in seconds. The maximum value is 86400 seconds (24 hours). The value should be provided if `sessionType` is  `rotating`. Defaults to `86400`. |
| count | 0 | `Optional`. Specify the number of IPs to generate. Defaults to `1`. |

**Headers**

| Key | Value | Description |
| --- | --- | --- |
| X-Strict-Mode | boolean | Default to false. If set to true, you must specify values for all required parameters. |

**Request Body**

```json
{
  "country": "<string>",
  "sessionType": "<string>",
  "protocol": "<string>",
  "region": "<string>",
  "city": "<string>",
  "IPTTL": <interger>,
  "count": <interger>
}
```

**Responses**

- Fetch Proxy (201)

```json
{
    "status": 200,
    "data": "gate.multilogin.com:8080:103689_964b7913_db50_4420_b83b_d0d515c56ab0_multilogin_com-country-us-region-new_jersey-city-east_brunswick-sid-mRzZcoWpwr2yRsbO-filter-medium:sjvqznqpo7"
}
```

### Fetch Proxy Data

`GET https://profile-proxy.multilogin.com/v1/user`

Fetch proxy-related data. The return value is in bytes.

**Headers**

| Key | Value | Description |
| --- | --- | --- |
| Content-Type | application/json |  |
| Accept | application/json |  |

**Responses**

- Proxy Data Fetched (200)

```json
{
    "traffic": 6181814163,
    "billingId": "103689"
}
```

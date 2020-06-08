---
title: Vendor licensing
---

API requests must be made using the ApisCP X.509 provided after establishing a vendor relationship with ApisCP. The ApisCP Root Certificates must be used to validate authenticity. These are bundled in `/usr/local/apnscp/resources/apnscp.ca` or through the public [Yum repository](http://yum.apiscp.com/apnscp.ca).

Requests are made using REST. All vendor requests are prefixed in the vendor/ namespace.

::: danger API in development
This API is still under development. This may change! Please direct all feedback to matt@apisnetworks.com
:::



## Managing activation codes

**POST** `vendor/code`  
Adds a new license code that may be converted into a license. Codes, once created, count toward license allowance regardless of redemption status.

See [LICENSE.md](LICENSE.md) for upgrading from an activation code within ApisCP. Codes may be activated at [install time](https://github.com/apisnetworks/apiscp-bootstrapper#registered-licenses) as well; however, it's advised to install without specifying a code to use a trial license until satisfied with the system configuration. MySQL and PostgreSQL cannot be changed once provisioned.

**SAMPLE CODE**

```bash
curl -i \
	--cacert ./apnscp.ca \
	-E ./license.pem \
	-H "Content-Type: application/json" \
	-X POST
	-d '{"type":"startup"}' \
	https://license.apiscp.com/vendor/code 
```

**SAMPLE RESPONSE**
```
{"code":"iifGi10LQpKo6cAk2oNKSMMvgz5t2ZC4qcOHN5W8iyssD85TZzYHKhIxUcCB"}
```

::: details
Above creates 1 Startup license activation without any features, such as network restrictions. This means the license may be used anywhere!
:::

::: danger Use network restrictions!
Network restrictions limit the license usage on a single machine or subnet. Network restrictions may be set using the `features` property + `net` subproperty. In the above payload, the license may be restricted on 64.22.68.1/24 by specifying features.net: 64.22.68.1/24:

`-d '{"type":"startup","features":{"net":["64.22.68.1/24"]}}'`
:::

Codes accept a variety of parameters that influence generation.

| Parameter         | Type                                   |
| ----------------- | -------------------------------------- |
| type **REQUIRED** | enum from set ['mini','startup','pro'] |
| common_name       | string, max length 64 characters       |
| features          | array                                  |

Likewise features may consist of one or more optional license attributes.

| Feature parameter | Type  | Description                                           |
| ----------------- | ----- | ----------------------------------------------------- |
| net               | array | Network CIDR or IP address restrictions. See warning. |

::: warning IP restriction usage

IP range must include network gateway. If single IP, then IP listed must be in /24 of gateway. `ip route show 0/0` will show primary route on server.

- 64.22.68.14 *is valid* if gateway is 64.22.68.1.
- 64.22.68.14 *is not valid* if gateway is 64.22.69.1. 64.22.68.1/23 would be used instead.

*Rationale*
Failure to do this would allow one to bind an IP restricted address to server in multi-home environment without ever using it thus satisfying restriction requirement.
:::


### Removing codes
**DELETE** `vendor/code/ID`  
Activation codes that have not yet been redeemed may be deleted.

**SAMPLE CODE**

```bash
curl -i \
	--cacert ./apnscp.ca \
	-E ./license.pem \
	-H "Content-Type: application/json" \
	-X DELETE \
	"https://license.apiscp.com/vendor/code/iifGi10LQpKo6cAk2oNKSMMvgz5t2ZC4qcOHN5W8iyssD85TZzYHKhIxUcCB"
```

### Listing codes

**GET** `vendor/code`  
A list of all codes generated may be retrieved through this endpoint.

```bash
curl -i \
	--cacert ./apnscp.ca \
	-E ./license.pem \
	-H "Content-Type: application/json" \
	-X GET \
	"https://license.apiscp.com/vendor/code"
```

**SAMPLE RESPONSE**
```bash
[{"code":"iifGi10LQpKo6cAk2oNKSMMvgz5t2ZC4qcOHN5W8iyssD85TZzYHKhIxUcCB","available":1,"issued":1591601554,"created_at":1591601554,"common_name":"server123"}]
```

## Managing licenses

### Listing licenses

**GET** `vendor/license`  

List all redeemed licenses.

**SAMPLE REQUEST**

```bash
curl -i \
	--cacert ./apnscp.ca \
	-E ./license.pem \
	-H "Content-Type: application/json" \
	-X GET \
	"https://license.apiscp.com/vendor/license"
```

**SAMPLE RESPONSE**

```bash
[{"id":91,"common_name":"server123","ip":"192.168.0.147","expire":1595149179,"created":1591693179}]
```

### Revoking licenses

**DELETE** `vendor/license/ID`  

**SAMPLE CODE**

```bash
curl -i \
	--cacert ./apnscp.ca \
	-E ./license.pem \
	-H "Content-Type: application/json" \
	-X GET \
	"https://license.apiscp.com/vendor/license/91"
```

**SAMPLE RESPONSE**

```bash
true
```

A 204 is returned when the request succeeds otherwise a 403 if the license ID is unknown or has already been revoked.

## Vendor stats

**GET** `vendor/stats`  
List license statistics.

**SAMPLE REQUEST**

```bash
curl -i \
	--cacert ./apnscp.ca \
	-E ./license.pem \
	-H "Content-Type: application/json" \
	-X GET \
	"https://license.apiscp.com/vendor/stats"
```

**SAMPLE RESPONSE**
```bash
[{"type":"startup","total":1,"expired":"0","revoked":"0"}]
```

"total" reflects all licenses issued. "active" would be determined from *total* - *expired* - *revoked*.

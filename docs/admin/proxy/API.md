<p align="center">
    <img title="ApisCP Panel Proxy" src="https://apiscp.com/images/logo-inv.svg" />
</p>

ApisCP panel proxy provides a centralized login portal for all participating ApisCP nodes. Panel proxy
consists of three components: (1) reverse proxy **cp-proxy**, (2) aggregation client **cp-collect**, and 
(3) API service **cp-api**.

This is the API service that responds with lookup requests for domains.

# API quickstart

The following quickstart assumes **cp-collect** stores domain information within a MySQL database running on the same hostname as **cp-api**. **cp-collect** is under the account `collector.mydomain.com` while **cp-api** is under `api.mydomain.com`.

1. Create domain, `AddDomain -c siteinfo,domain=api.mydomain.com -c mysql,dbaseprefix=api_`

2. Relocate public/ to html/

    ```bash
    su api.mydomain.com
    cd /var/www
    git clone https://github.com/apisnetworks/cp-api /var/www/html-api
    cp .env.example .env
    ln -s html-api/public html
    cd html-api
    composer install
    exit
    ```

3. Detect application. Open up logging permissions. Request SSL.

    ```bash
    cpcmd -d api.mydomain.com webapp:discover api.mydomain.com
    cpcmd -d api.mydomain.com webapp:fortify api.mydomain.com
    cpcmd -d api.mydomain.com letsencrypt:request '[api.mydomain.com]'
    ```

4. Add grants for user to [proxy database](https://github.com/apisnetworks/cp-collector/README.md).

    ```bash
    cpcmd -d collector.mydomain.com mysql:add-user apiuser localhost random-password
    cpcmd -d collector.mydomain.com mysql:set-privileges apiuser localhost proxy '[read: true]'
    ```

5. Edit `.env` within `html-api/`. Set `DB_HOST`, `DB_DATABASE`, `DB_USERNAME`, and `DB_PASSWORD`.

6. Configure ApisCP machines to use this callback location.

    All configuration must be changed in `config/custom/config.ini`. [cpcmd](https://docs.apiscp.com/admin/CLI/#cpcmd) provides a short-hand means of doing this, e.g.

    ```
    cpcmd scope:set cp.config <SECTION> <NAME> <VALUE>
    ```

| Section | Name                 | Description                                                  | Sample Value                                        |
| ------- | -------------------- | ------------------------------------------------------------ | --------------------------------------------------- |
| auth    | secret               | Must be the same across *all* instances. Used to encrypt cookies. | ABCDEFGH                                            |
| auth    | server_format        | Optional format that appends a domain to the result of *server_query*. \<SERVER> is substituted with result from JSON query. | \<SERVER>.mydomain.com                               |
| auth    | server_key           | Must be the same across *all* instances. Key for extended domain metadata. | ABC12345                                            |
| auth    | server_query         | API location that cp-api resides on. | https://api.mydomain.com/                     |
| core    | http_trusted_forward | [cp-proxy](https://github.com/apisnetworks/cp-proxy) service IP address. | 1.2.3.4                                             |
| misc    | cp_proxy             | Control panel proxy endpoint that cp-proxy resides on.       | [https://cp.mydomain.com](https://cp.mydomain.com/) |
| misc	| sys_status	| Optional Cachet location for system status	| https://demo.cachethq.io/  |

Perform a quick test to validate setup works as intended.

```bash
curl -i \
    -H "Content-Type: application/json" \
    -H "Accept: application/json" \
    -X POST -d '{"domain":"mydomain.com", "full": false}' \
    https://api.mydomain.com/lookup
```

## Full and partial results
**New in 3.2.34**

An *authorization key* provides enhanced API access. For example, `/lookup` with an authorization key includes additional fields including: site ID, invoice, and email address of a domain. Without providing the *authorization key* just the server name is returned.

A single authorization key is used for all panel installs. To create the key in **cp-api** run `./artisan key:generate`. This value will be set in `.env` under the key `API_KEY_EXTENDED`. Likewise, to set the value on all control panel instances use:

```bash
cpcmd scope:set cp.config auth server_key KEY-FROM-ABOVE
```

```bash
curl -i \
    -H "Content-Type: application/json" \
    -H "Accept: application/json" \
    -H "X-Auth-Key: ABC12345" \
    -X POST -d '{"domain":"mydomain.com", "full": true}' \
    https://api.mydomain.com/lookup
```

```json
{
    "status":true,
    "data": {
        "server":"epsilon",
        "domain":"example.com",
        "original_domain":null,
        "server_name":"epsilon",
        "status":"active",
        "addon":0,
        "site_id":1,
        "invoice":"APISCP-123",
        "email":"help@example.com"
    }
}
```

## Debugging

Set `APP_ENV=` to `local` and `APP_DEBUG=false`. By default, `production` is used which masks errors.

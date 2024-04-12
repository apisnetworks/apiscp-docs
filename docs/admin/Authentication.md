# Authentication

## Keyring
**New in 3.2.42**

Sensitive data may be stored using the **keyring** API. Keyring values are encrypted using AES-256-GCM whose digest is derived from **[auth]** => *secret* within [config.ini](Customizing/#apiscp-configuration). Encoded values are stored within `config/auth.yaml` and may be referenced by supporting modules using `keyring:index` notation. A common usage of Keyring is to protect API keys attached to accounts from access by secondary users.
```bash
# Create a new keyring value
cpcmd keyring:set dns.hetzner 'my-secret-api-key'
# keyring:dns.hetzner will now reference this value stored in config/auth.yaml
cpcmd keyring:get dns.hetzner
# reports "keyring:<base64:CRYPTED>#<base64:IV>#<base64:TAG>"
EditDomain -c dns,key='keyring:dns.hetzner' -c dns,provider=hetzner domain.com
```

Likewise when this data is queried by any individual on the site, the encoded key reference is produced instead of the secret.

```bash
cpcmd -d domain.com common:get-service-value dns key
# reports "keyring:dns.hetzner"
```

### Decoding

Keyring values are not intended to be decoded through API. Keys may be decoded internally using `Opcenter\Crypto\Keyring::decode()`.

### Transferring keyrings

Keyrings represent an integral bonding with the server. A keyring cannot be decoded without knowing the server secret. If this value is known, then it may be re-encoded for another server with a different **[auth]** => *secret* value.

```bash
cpcmd scope:get cp.config auth secret
# Sample return value: EhvDAIL5a5dJ08HiKDkQfncX5zT6sg4xBuP7J6SZ8qKmXvce
cpcmd keyring:set my-secret super-val
cpcmd scope:set cp.config auth secret pleasedontusethis
# Rebuild configuration
systemctl restart apiscp

cpcmd keyring:valid "$(cpcmd keyring:get my-secret)"
# Returns empty/false value

cpcmd keyring:reencode "$(cpcmd keyring:get my-secret)" EhvDAIL5a5dJ08HiKDkQfncX5zT6sg4xBuP7J6SZ8qKmXvce
# Produce a new value. Encoding can by skipped by passing a third parameter, $raw
cpcmd keyring:set my-secret 'VALUE-ABOVE' true

# Verify it works
cpcmd keyring:valid "$(cpcmd keyring:get my-secret)"
# Returns 1
```
::: tip Changing secrets
Changing a server secret will invalid all saved passwords as well as invalidate intraservice access within the UI. Server secrets should be the same across related servers for use with [cp-proxy](Panel%20proxy.md).
:::
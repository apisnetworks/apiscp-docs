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

### Encoding

`keyring:encode` will convert a mixed value into a Keyring type. These values may be used in lieu of keyring references.

```bash
cpcmd keyring:encode 'foobar'
cpcmd keyring:encode '[key:foo,name:bar]'
EditDomain -c dns,key="$(cpcmd keyring:encode my-special-key)" domain.com

cpcmd -d domain.com common:get-service-value dns key
# Reports encoded keyring
```

Data types are preserved when decoded internally.

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
Changing a server secret will invalidate all saved passwords as well as invalidate intraservice access within the UI. Server secrets should be the same across related servers for use with [cp-proxy](Panel%20proxy.md).
:::

## Multi-factor authentication

See "[Restricting Authorization](../SECURITY.md#totp)" in SECURITY.md.


## Session multipath

**New in 3.2.46**

Multiple concurrent sessions is supported when **[frontend]** => **multipath_length** is set to a value greater than 0. This represents the first *n* characters of the active session. All active requests will be prefixed with an "id_XXXX" marker; likewise cookies will be set within this path. [RFC 6265 § 5.4](https://datatracker.ietf.org/doc/html/rfc6265#section-5.4) provides a strong recommendation that these path marker cookies will take precedence over root-level cookies. 

The feature may be enabled by specifying a multipath length greater than 0:

```bash
cpcmd scope:set cp.config frontend multipath_length 4
```

Sessions are uniformly distributed over a 62^32 space that provides adequate protection against brute-force attempts. In event of a collision, the most recent session would overwrite the prior. Longer multipaths have a greater tendency to occlude the location bar. [Birthday attack](https://en.wikipedia.org/wiki/Birthday_attack) formula can be used to approximate the likelihood of a collision.  An approximation of a 50% collision for a length *n* is calculated as:

![multipath collision probability](./images/multipath-collision.png)

*Or roughly: 4800 separate browser tab-sessions for a 50/50 chance of another tab getting logged out when n=4...*

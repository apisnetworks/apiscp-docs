<p align="center">
    <img title="ApisCP Panel Proxy" src="https://apiscp.com/images/logo-inv.svg" />
</p>

ApisCP panel proxy provides a centralized login portal for all participating ApisCP nodes. Panel proxy
consists of three components: (1) reverse proxy **cp-proxy**, (2) aggregation client **cp-collect**, and 
(3) API application **cp-api**.

This is the aggregation client that collects and stores sites into a database for each server. 

------

## Quickstart
- [ ] All servers under the same domain, e.g. svr1.mydomain.com, svr2.mydomain.com

- [ ] Encryption key specified in .env or generated with `./proxy key:generate` 

- Create the cpcollect user
  ```bash
  useradd -rms /sbin/nologin cpcollect
  cd /home/cpcollect
  ```
  
- Clone the repository
  ```bash
  sudo -u cpcollect git clone https://github.com/apisnetworks/cp-collect.git /home/cpcollect/cp-collect
  cd cp-collect/
  ```
  
- Install vendor libraries
  ```bash
  sudo -u cpcollect composer install
  ```
  
- Copy .env.example to .env
  ```bash
  sudo -u cpcollect cp .env.example .env
  ```
  
- Create database layout, edit .env. "mysql" and "postgresql" are acceptable `DB_CONNECTION` types.
  ```mysql
  CREATE DATABASE proxy;
  GRANT ALL on proxy.* to proxyuser@localhost IDENTIFIED BY 'MAKEUPYOUROWNPASSWORD';
  ```
  Update the .env file, set the `DB_USERNAME`, `DB_PASSWORD` and `DB_DATABASE` fields.
  
- Generate an application key. This will be used to encrypt your API credentials.
  ```
  sudo -u cpcollect ./proxy key:generate
  ```
  
- Migrate the database
  ```bash
  sudo -u cpcollect ./proxy migrate:install
  sudo -u cpcollect ./proxy migrate
  ```
  
- For each linked server, create an API key, the command will return the key which you'll use on the Collector to add the server.
  ```bash
  ssh svr1.mydomain.com
  cpcmd auth:create-api-key "Proxy API key"
  ```
  Then add to the cp-proxy database:
  ```bash
  ./proxy server:add svr1 --auth=api --key=<api key returned from above>
  ```
  
 - Collect all domains
   ```bash
   ./proxy collect
   ```
   
 - List all domains
   ```bash
   ./proxy all
   ```
   
- Locate domain foo.com displaying the admin email + server name
   ```bash
   ./proxy --fields=name,email lookup foo.com
   ```

### Alternative configuration
#### Public key
Use `server:add` without specifying `--auth=` or `--key`. `native` authentication is assumed, which will use `ssh` with
`~/.ssh/id_rsa.pub` as its key.

#### Custom public key
Use `server:add --auth=ssh --key=USER:KEY-RAW` where `KEY-RAW` is the raw key and `USER:` is an optional user to authenticate
as. When omitted it will authenticate as the current user.

`USER` must be the ApisCP system user (typically "apnscp") or have access to run `cpcmd admin:collect`.

`server:add node --auth=ssh --key="cp-user:$(cat /path/to/privkey.pem)"`

::: tip ApisCP home directory
ApisCP can accept SSH keys for its user. Create a directory `mkdir --mode=0700 /usr/local/apnscp/storage/.ssh` 
and place the public key in `.ssh/authorized_keys`.
:::

### Deleted domains
Domains are soft deleted from the database when removed. These are excluded from queries unless the `status` field is explicitly requested.

```bash
./proxy lookup apisnetworks.test
# +--------+-----------+---------+
# | Domain | Node name | Invoice |
# +--------+-----------+---------+

./proxy lookup --fields=domain,status apisnetworks.test
# +-------------------+---------+
# | Domain            | Status  |
# +-------------------+---------+
# | apisnetworks.test | deleted |
# +-------------------+---------+
```

Soft deletions may be pruned from the database using `proxy clean`. Verbosity controls whether just domain domain (`-v`) or domain and server name (`-vvv`) are listed.

```bash
./proxy -vvv clean
# 8mlstnomyqi6gcdz.test localhost
# addon-domain-test.com localhost
# Deleted 2 domains from database
```

### Security

A fully-qualified domain name must not be used. A domain should always be
specified in **[auth]** => **server_format** to prevent an attacker from specifying 
*admin/some.other.server.com* as the username.

Login keys are encrypted within the database in `auth_key` column of `servers`. The encryption key
is stored in `.env` within the filesystem.

Running `./proxy key:generate` will roll `APP_KEY` and update all encrypted auth data. 

## Documentation

For full documentation, visit [docs.apiscp.com](https://docs.apiscp.com).

## License

ApisCP panel proxy is free open-source software licensed under the [MIT license](LICENSE.md).

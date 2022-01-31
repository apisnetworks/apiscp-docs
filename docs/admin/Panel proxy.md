# Panel proxy

Panel proxy provides a centralized login portal for all participating ApisCP nodes. Panel proxy consists of three components:

1. [Collection agent](./proxy/Collector.md), **cp-collect**
    *Repository* [apisnetworks/cp-collect](https://github.com/apisnetworks/cp-collect)
2. [API service](./proxy/API.md), **cp-api**
    *Repository* [apisnetworks/cp-api](https://github.com/apisnetworks/cp-api)
3. [Reverse proxy](./proxy/Proxy.md) **cp-proxy**
    *Repository* [apisnetworks/cp-proxy](https://github.com/apisnetworks/cp-proxy)

The designated panel proxy server will always be visible in the address bar regardless of server an account actually resides on. Locations will change when a user clicks through to phpMyAdmin, phpPgAdmin, or any webmail application. This is by design.

Panel proxy can be combined with [Cachet](https://cachethq.io/) to report server status on login, reported as "\<indicator> **Network Status**"

All components of panel proxy are available on [GitHub](https://github.com/search?q=topic%3Apanel-proxy+org%3Aapisnetworks&type=Repositories).

A typical topology exists of at least 2 nodes with the cp-api on a separate node from cp-proxy/cp-collector for security. 

::: details Layout considerations
cp-collector encrypts authentication data with a key outside the database. This key is required to decrypt authentication keys (API/SSH) to collect accounts. Separation of services adds an extra layer of security should the API server become compromised. This also allows the API service to run on a normal ApisCP instance as its own account.
:::

![Minimum recommended topology](./images/proxy-server-topology-basic.svg)

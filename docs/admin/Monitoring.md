# Service monitoring

Argos is a monitoring and notification relay engine for apnscp. It provides enhanced monitoring for [Monit](https://mmonit.com/monit/), which is a lightweight, proactive monitoring service for Linux. Monit relays service alerts through Argos, which can use one of several backends including Pushover, XMPP, Slack, and webhooks to relay notifications. We recommend pairing Argos with [Pushover](https://pushover.net/) to receive alerts on your phone, but any backend works with varying levels of features. Pushover includes quiet hours and user interaction for major events, such as maxing out storage or a database outage.

Argos comes installed with apnscp and begins monitoring immediately, but you'll need to perform some activation steps to enable push notifications to your phone.

![Image-1](https://hq.apiscp.com/content/images/2018/06/Image-1.png)

## Changing monitoring parameters

Any tweaks can be made in `/etc/monit.d/` following Monit's [documentation](https://mmonit.com/monit/documentation/monit.html). To reload Monit, issue `sudo systemctl reload monit`. All configuration values shipped with Argos are what we recommend and utilize for our servers.

## Creating an Argos backend

First, setup an account with [Pushover](https://pushover.net/) and download the app to your phone. Alternatively the following backends are supported for Argos:

- notifico
- pushbullet
- pushjet
- pushover
- simplepush
- slack
- systemlog
- xmpp

> Additional modules can be configured and setup by hand in `/root/.argos.conf` without using apnscp's API to configure Argos. Documentation for all backend relays are provided with ntfy's [documentation](https://ntfy.readthedocs.io/en/latest/#backends).

Initialize Argos configuration:

```bash
cpcmd scope:set argos.init 1
```

Let's take a look at the YAML created in `/root/.argos.conf`. As a supplement, any [YAML tutorial](https://gettaurus.org/docs/YAMLTutorial/) is a great starting point.

```yaml
---
# Default backend invoked with:
# ntfy send "msg"
backends:
  - default
# Backend configuration
# See also https://github.com/dschep/ntfy
default: &default
  backend: pushover
  # May be overridden with -t title
  title: "nexus"
  api_token: TOKEN
  user_key: KEY
# High priority backend ntfy -b high send "msg"
high:
  title: "❗ nexus"
  priority: 2
  expire: 3600
  retry: 120
  <<: *default
```

- Two channels are created, *default* and *high*, which are hardcoded into Argos as low/high channels.
- **backends** denotes the default backends to send to when no channel is configured (`cpcmd argos_send "Test Message"`).
- **default** is a low priority channel that uses Pushover to relay messages.
- **high** is a high priority channel that inherits configuration from **default** (`<<: *default`)
- Both channels (default and high) require a backend provider to relay the messages. Both use pushover (`backend:` in **default** channel)

`api_token` and `user_key` need to be set for relays to work. You can edit the YAML by hand or use apnscp. Head over to Pushover to create an [application token](https://pushover.net/apps/build), which is unique to the monitoring application; and `user_key` is your user key.

### Setting relay authentication

Each backend has different authentication parameters. These are baked into `argos.auth` but can be set freeform too.

```bash
cpcmd scope:set argos.auth '' USERKEY
# is equivalent to...
cpcmd argos:config-relay high '[user_key:USERKEY]'
cpcmd argos:config-relay default '[user_key:USERKEY]'
```

Pushover requires one additional configuration parameter, API token:

```bash
cpcmd scope:set argos.config '' '[api_token:APITOKEN]'
# Alternatively...
cpcmd argos:config-relay default '[api_token:APITOKEN]'
cpcmd argos:config-relay high '[api_token:APITOKEN]'
```

Now test sending a relay through each backend:

```bash
cpcmd argos:test
cpcmd argos:test high
```

You can use Argos to relay messages at your leisure to configured channels. Of course apnscp needs to be operable for it to work, so this won't work when MySQL is down!

```bash
cpcmd argos:send "Some Message" high "Test Title"
```

Alternatively you can use ntfy directly, which works if MySQL is down,

```bash
ntfy -c /root/.argos.conf -b high -t "Test Title" send "Some Message"
```

## Verifying Monit => Argos notification

Once set, kill Apache to make sure everything works,

```bash
systemctl stop httpd
monit validate
```

A push notification should arrive to your phone nearly instantaneously. Now confirm the status has changed, then re-run validate to update Monit's internal record and generate a second notice to confirm everything is OK.

```bash
monit status apache
monit validate
monit status apache
```

![monit-status](https://hq.apiscp.com/content/images/2018/06/monit-status.png)

## Switching backends

Pushover comes highly recommended because of its features, but you can exchange pushover with any supported monitoring interface. To exchange with the apnscp API, use `argos:config()`,

```bash
cpcmd argos:config-relay default '[backend:slack]'
# Or alternatively
cpcmd scope:set argos.backend high default
```

- **default** now uses slack for its backend relay
- **high** depends upon the configuration from the **default** channel for its inherited configuration
- **default** requires reconfiguration with `cpcmd argos.auth default '[token:slacktoken,recipient:#somechannel]'`

> When installing Slack, be sure to install its dependency, `pip install ntfy[slack]`

## Stacking backends

Multiple channels may be stacked into a channel to expand notification. It requires creating a new channel, then enrolling the channel as a backend into either *default* or *high* unless you want to relay through a separate channel.

```bash
cpcmd argos:create-backend slack-relay slack
cpcmd argos:config-relay slack-relay '[token:slacktoken,recipient:#somechannel]'
# Stack slack-relay onto default
cpcmd argos:set-default-relay '[default,slack-relay]'
cpcmd argos:test slack-relay
# Alternatively...
ntfy -c /root/.argos.conf -b slack-relay send 'Test!'
```

**backends** now looks like:

```yaml
backends:
  - default
  - slack-relay
```

And calling argos_send without specifying a backend channel will relay the message through **default** and **slack-relay**.

## Robust monitoring

Argos works great to monitor internally, but what happens if a server goes down? A remote third-party service, such as [Hyperspin](http://www.hyperspin.com/en/) that monitors externally + provides Pushover integration is a great complement to internal monitoring with Argos. It's what we have used for our servers since 2010 and whole heartedly recommend using. The owner is a nice guy to boot!

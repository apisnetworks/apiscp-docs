---
title: HTTP brute-force protection
---

mod_evasive is a simple bean counter that tracks HTTP requests over a narrow window for use with brute-force deterrence in fail2ban. When an IP address exceeds the count limit within the duration, information is emitted via syslog to fail2ban, which determines how to dispose of the incident. Additionally a file named */tmp/dos-IP* is created marking the event.

Requests are tracked by two methods: same URI and globally.

## Configuration

`apache.evasive` [Scope](Scopes.md) manages mod_evasive parameters. This Scope interacts with /etc/httpd/conf.d/evasive.conf and adds a 2 minute delay to reloading HTTP configuration.

### Same URI tracking

Same URI tracks the full URI provided to Apache. Query strings are truncated from the request: */foo* is the same as */foo?bar=baz* and */foo?quu=qux&bar=baz*.

`page-count` and `page-interval` control hit count and window. Recommended settings are a low interval and count greater than interval.

```bash
cpcmd scope:set apache.evasive page-count 20
cpcmd scope:set apache.evasive page-interval 5
```

Above triggers protection if more than 20 same-URI requests happen within 5 seconds.

### Global tracking

Global tracking ignores URI distinctions and looks at all requests originating from an IP. */foo* and */bar* both accumulate hits.

`site-count` and `site-interval` control hit count and window. This ratio *must* be higher than page-based accumulation. Setting a high interval or low count will trigger false positives at a much higher rate, especially in plugin-dependent Web Applications, such as WordPress.

```bash
cpcmd scope:set apache.evasive site-count 300
cpcmd scope:set apache.evasive page-interval 2
```

Above triggers protection if more than 300 requests are made within 2 seconds.

### Empirical estimates

Running a site through webpagetest.org or using [DevTools](https://developers.google.com/web/tools/chrome-devtools) to see the average number of subrequests per page view can help you estimate a good baseline for your site. An ideal setting allows typical usage while disabling atypical extremes: bots don't adhere to netiquette when brute-forcing credentials. Some protection is necessary.

### Disabling per site

Create a file named `custom` in `/etc/httpd/conf/siteXX` where *siteXX* is the site ID for the domain. `get_site_id domain.com` from command-line will help you locate this value. Within `custom` add:

`DOSEnabled off`

Then rebuild and reload, `htrebuild && system reload httpd`.

## Filtering individual resources

mod_evasive is context-aware using Apache directives. For example, evasive ships with a filter to restrict POST attempts to xmlrpc.php and wp-login.php. `cpcmd config:set apache.evasive-wordpress-filter true` enables this filter with a very stringent post rate of 3 attempts in 2 seconds.

As an example, the following rule applies to files named "wp-login.php", *glob is quicker than regular expression patterns by a factor of 5-10x!* If the request method isn't a POST, disable bean counting. If more than 3 POST attempts to the same resource occur within a 2 second interval, then return a DOSHTTPStatus response (429 Too Many Requests) and log the message via syslog to /var/log/messages. fail2ban will pick up the request and place the IP address into the temporary ban list.

    # Block wp-login brute-force attempts
    <Files "wp-login.php">
        <If "%{REQUEST_METHOD} != 'POST'">
            DOSEnabled off
        </If>
        DOSPageCount 3
        DOSPageInterval 2
    </Files>

### Customizing

Copy `resources/templates/rampart/evasive/wordpress-filter.blade.php` to `config/custom/resources/templates/rampart/evasive/wordpress-filter.blade.php` creating parent directory structure as necessary:

```bash
cd /usr/local/apnscp
install -D -m 644 resources/templates/rampart/evasive/wordpress-filter.blade.php config/custom/resources/templates/rampart/evasive/wordpress-filter.blade.php
```

**First time** use requires regeneration of cache or restart of apnscp,,

```bash
cd /usr/local/apnscp
./artisan config:clear
```

## Approximating hash size

As a rule of thumb, hash tables should be 1.3x the size of expected number of entries rounded up to the nearest prime number. Each IP address is an entry, which leads to the approximation calculation:

```bash
zcat /home/virtual/*.*/var/log/httpd/access_log.1.gz | awk '{print $1}' | sort | uniq | wc -l
```

`cpcmd config:set apache.evasive hash-table-size N`  will adjust the table size. This table is created for each child worker and consequently discarded every time Apache restarts or a worker shuts down. Restarts and reloads should be factored into the overall setting.

## Compatibility with CloudFlare

mod_cloudflare updates the IP address of a request in `ap_hook_post_read_request()` before `ap_hook_access_checker()`; thus, at evaluation `rec->useragent_ip` reflects the upstream IP.

## See Also

- [README.md](https://github.com/apisnetworks/mod_evasive/blob/master/SOURCES/README.md) from mod_evasive

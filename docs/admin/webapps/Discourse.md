# Discourse

::: tip
Part of the Web Apps family, Nextcloud supports many familiar components shared by all other apps. See [WebApps.md](../WebApps.md) for preliminary information that covers the *update process*.
:::

## Troubleshooting

### Resource unavailable errors

Threading limits can exceed `cgroup`,`proclimit` values assigned for a site (default: 100). Raise the proclimit value for a site to avoid [exhausting PIDs](../Resource%20enforcement#process) for a site.

```bash
EditDomain -c cgroup,proclimit=250 -D domain.com
```
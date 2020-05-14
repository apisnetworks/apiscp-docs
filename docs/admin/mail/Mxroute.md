# MXRoute Mail Provider

This is a drop-in provider for [ApisCP](https://apiscp.com) to enable mail support for accounts that use MXRoute. This provider is built into apnscp.

## Configuring

A server name is required to configure MXRoute. Servers are assigned to each account and 
[provided at sign-up](https://community.mxroute.com/t/how-do-i-use-custom-hostnames-for-pop-imap-smtp-and-webmail/70/2) with MXRoute. For example,
"ghost" and "arrow" are two known MXRoute servers. Yours may be different. Substitute *SERVER* with your server name.

```bash
EditDomain -c mail,provider=mxroute -c mail,key=SERVER domain.com
```

## Components

* Module- overrides [Email_Module](https://github.com/apisnetworks/apnscp-modules/blob/master/modules/email.php) behavior
* Validator- optional service validator, checks input with AddDomain/EditDomain helpers

### Minimal module methods

All module methods can be overwritten. The following are the bare minimum that are overwritten for this Mail provider to work:

- `get_records`- returns a list of DNS records to provision for the domain

## Contributing

Submit a PR and have fun!
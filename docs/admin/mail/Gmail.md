# Gmail Mail Provider

This is a drop-in provider for [apnscp](https://apnscp.com) to enable mail support for accounts that use Gmail. This provider is built into apnscp.

## Configuring

```bash
EditDomain -c mail,provider=gmail domain.com
```

## Components

* Module- overrides [Email_Module](https://github.com/apisnetworks/apnscp-modules/blob/master/modules/email.php) behavior
* Validator- optional service validator, checks input with AddDomain/EditDomain helpers

### Minimal module methods

All module methods can be overwritten. The following are the bare minimum that are overwritten for this Mail provider to work:

- `get_records`- returns a list of DNS records to provision for the domain

## Contributing

Submit a PR and have fun!
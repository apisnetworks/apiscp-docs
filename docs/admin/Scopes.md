# Scopes

Scopes are configuration-specific entry points to apnscp. They may tie into [config.ini](https://gitlab.com/apisnetworks/apnscp/blob/master/config/config.ini), [Bootstrapper](https://github.com/apisnetworks/apnscp-playbooks), or system configuration. A configuration scope abstracts a more complex operation that could be achieved with blood, sweat, tears, trial, and a bit of error.

## Listing scopes

A list of available scopes can be gathered with `cpcmd scope:list`. All scopes correspond to a concrete implementations in [`Opcenter\Admin\Settings`](https://gitlab.com/apisnetworks/apnscp/tree/master/lib/Opcenter/Admin/Settings).

`scope:get` retrieves the scope's configured value. A scope value is idempotent; if it's set value is the same as its input it will not rewrite its settings nor process any tasks associated with itself. 

`scope:info` displays the configured value, default value, and description for the scope.

[Scopes-list.md](Scopes-list.md) contains a master list of all Scopes available to the platform.

## Setting scopes

`scope:set` reconfigures a scope and initiates any reconfiguration tasks associated with reassignment. Before altering a system value, check scopes first as these will be overwritten with `upcp -b` (run Bootstrapper).
# Hooks

The hook subsystem provides a simple, passive interface to apnscp without module extensions. Hooks are available for edit, create, delete, suspend, activate, import, and export operations. Unlike a module, a hook *cannot* interrupt flow.

## Installation

Example hooks are provided in `bin/hooks` as part of the apnscp distribution. Active hooks are located in `config/custom/hooks`. All hooks follow a familiar interface, with the first argument the *site identifier*. Import and export hooks also include the target format as well as source/destination file respectively.

A hook is accepted if it has a ".php" or ".sh" extension. Any other matching hook is ignored.

```bash
cd /usr/local/apnscp
mkdir -p config/custom/hooks
cp bin/hooks/editDomain.php config/custom/hooks
# Create the domain
env DEBUG=1 VERBOSE=-1 AddDomain -c siteinfo,domain=hooktest.com -c siteinfo,admin_user=hooktest -c dns,enabled=0
```

`env DEBUG=1` enables opportunistic debugging, which generates additional information at runtime. `VERBOSE=-1` is a shorthand flag to enable backtraces for all levels of error reporting. Backtraces help identify the pathway a problem bubbles up. Refer to sample code in each hook for context strategies.

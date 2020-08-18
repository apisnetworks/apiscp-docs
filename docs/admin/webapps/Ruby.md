# Ruby apps

## Lazy-loading rbenv

Since v3.1.44 it is possible to initialize rbenv helper code on first-run thus improving shell load times. Set `LAZY_LOAD_RUBY=1`  in `~/.bashrc`. A first-time invocation of `ruby`, `gem`, or `rbenv` will initialize rbenv code, shimming the path as needed.

## Selecting Ruby versions

It is strongly recommended to select a Ruby version other than system default.

Example: to change Ruby versions

```bash
rbenv install 2.4.3
rbenv local 2.4.3
# Set 2.4.3 as the default system interpreter
rbenv global 2.4.3
```
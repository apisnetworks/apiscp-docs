# Ruby apps

## Lazy-loading rbenv

Since v3.1.44 it is possible to initialize rbenv helper code on first-run thus improving shell load times. Set `LAZY_LOAD_RUBY=1`  in `~/.bashrc`. A first-time invocation of `ruby`, `gem`, or `rbenv` will initialize rbenv code, shimming the path as needed.


# Node apps



## Lazy-loading nvm

Since v3.1.44 it is possible to initialize nvm helper code on first-run thus improving shell load times. Set `LAZY_LOAD_NODE=1`  in `~/.bashrc`. A first-time invocation of `node`, `npm`, or `nvm` will initialize nvm code, shimming the path as needed.


# Node apps

## Lazy-loading nvm

Since v3.1.44 it is possible to initialize nvm helper code on first-run thus improving shell load times. Set `LAZY_LOAD_NODE=1`  in `~/.bashrc`. A first-time invocation of `node`, `npm`, or `nvm` will initialize nvm code, shimming the path as needed.

## Selecting Node versions
It is strongly recommended to select a Node version other than system default. [LTS](https://github.com/nodejs/LTS) is typically recommended for maximum compatibility with packages on npm.

Example: changing Node versions:

```bash
# List remote Nodes
nvm ls-remote
# Install LTS release "boron" (6.11)
nvm install lts/boron
```


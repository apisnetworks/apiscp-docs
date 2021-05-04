# Laravel

::: tip
Part of the Web Apps family, Laravel supports many familiar components shared by all other apps. See [WebApps.md](../WebApps.md) for preliminary information that covers the *update process*.
:::

## Troubleshooting

### Linking storage directory

`artisan storage:link` prior to Laravel 7 ([laravel/framework #32430](https://github.com/laravel/framework/pull/32430)) creates an absolute symbolic link, which cannot be properly traversed by Apache. 7+ includes a new flag, `--relative` to convert this link to a relative symlink. Both approaches are valid on Laravel 7+:

```bash
./artisan storage:link --relative
```

 Or convert absolute to relative:

```bash
LN="$(readlink public/storage)"
rm -f public/storage
ln -rs "$LN" public/storage
```

::: details Temporary variable
`ln` will create a symbolic link within a symbolic link when written as a one-liner, i.e. `ln -rsf "$(readlink public/storage)" public/storage` as it resolves the target, `public/storage/` then attempts to create a symlink within there named after the referent basename.

First unlinking the symlink allows for a symlink to be created named after the target.

Interestingly, if the target were a file, then `-f` (force overwrite) would behave as expected.
:::
# Ghost

::: tip
Part of the Web Apps family, Ghost supports many familiar components shared by all other apps. See [WebApps.md](../WebApps.md) for preliminary information that covers the *update process*.
:::

::: tip
Part of the Passenger subfamily, Ghost suports many familiar components with a few other Passenger-based apps. See [Passenger.md](Passenger.md) for additional information.
:::

## Recovering stalled update

Ghost may fail abruptly during an update, which ApisCP will try to recover. In the event it cannot recover and the version remains on the last upgrade version, perform a manual revert to the last version. This can be done by the following steps from the *application root* for Ghost:

- Rollback `active-version` in `.ghost-cli` to the previous known good version.

- Remove the symlink `current/` whose referent is the bad version.

- Remove the referent from `versions/`.

- Relink the `current/` to the previous good version.

    ```bash
    # within /var/www/html-ghost, the app root when Ghost is installed under /var/www/html
    rm -f current
    # remove the bad version, 3.30.2
    rm -rf versions/3.30.2
    # if 3.30.2 is bad and 3.30.1 was the last good update...
    ln -s versions/3.30.1 current
    ```

An update will retry again correctly moving from 3.30.1 to 3.30.2.
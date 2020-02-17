# Maps

Maps provide a primary means for quick lookup on important account metadata. Maps reside under `/etc/virtualhosting/mappings`. `domainmap.tch` for example is used with domain => site ID translation and is crucial to operation of apnscp.

## Recovering maps

If at any point a map becomes corrupted or for integrity checks, run `scripts/mapCheck.php`.

```bash
cd /usr/local/apnscp/bin/
# Look for missing records
./scripts/mapCheck.php check
# Add missing records
./scripts/mapCheck.php rebuild
```

A recovered map will provide the minimal environment to successfully delete a failed site addition, should it fail to delete entirely.

::: danger
Additional issues may persist after rebuilding your map. It is strongly encouraged then to validate HTTP configuration reloads without incident using `htrebuild` as well as configuring service alerts in [Argos](Monitoring.md).
:::
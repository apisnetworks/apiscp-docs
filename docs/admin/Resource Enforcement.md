# Resource Enforcement

## Troubleshooting

### Memory reported is different than application memory

cgroup reports all memory consumed within the OS by applications, which includes filesystem caches + network buffers. Cache can be automatically expunged when needed by the OS. To expunge the cache forcefully, write "1" to `/proc/sys/vm/drop_caches`. For example, working with "site1" or the first site created on the server:

```bash
cat /sys/fs/cgroup/memory/site1/memory.usage_in_bytes
# Value is total RSS + TCP buffer + FS cache
echo 1 > /proc/sys/vm/drop_caches
# Value is now RSS
cat /sys/fs/cgroup/memory/site1/memory.usage_in_bytes
```

This can be confirmed by examining `memory.stat` in the cgroup home. Likewise memory reported by a process may be higher than memory reported by cgroup, this is because cgroup only accounts for memory uniquely reserved by the application. A fork shares its parent's memory pages and copies-on-write at which point the newly claimed memory is charged to the cgroup.


# MySQL

## Troubleshooting

### Cyclic InnoDB crash

#### Background
* **Impact:** Severe
* **Affects:** All known versions when `data_center_mode` is enabled

In certain situations, when an account has a disk quota present and the account runs over 
quota, MySQL can first crash, then on autorepair continue to crash due to quota restrictions.

Sample from /var/log/mysqld.log:

<pre>
7f51e07fd700 InnoDB: Error: Write to file ./somedb/sometable.ibd failed at offset 180224.
InnoDB: 16384 bytes should have been written, only 0 were written.
InnoDB: Operating system error number 122.
InnoDB: Check that your OS and file system support files of this size.
InnoDB: Check also that the disk is not full or a disk quota exceeded.
InnoDB: Error number 122 means 'Disk quota exceeded'.
InnoDB: Some operating system error numbers are described at
InnoDB: http://dev.mysql.com/doc/refman/5.6/en/operating-system-error-codes.html
2017-08-02 06:12:06 7f51e07fd700  InnoDB: Operating system error number 122 in a file operation.
InnoDB: Error number 122 means 'Disk quota exceeded'.
InnoDB: Some operating system error numbers are described at
InnoDB: http://dev.mysql.com/doc/refman/5.6/en/operating-system-error-codes.html
170802  6:12:06 [ERROR] InnoDB: File ./somedb/sometable.ibd: 'os_file_write_func' returned OS error 222. Cannot continue operation
170802 06:12:06 mysqld_safe Number of processes running now: 0
170802 06:12:06 mysqld_safe mysqld restarted</pre>

#### Solution
Remove the disk quota from the account temporarily to allow MySQL to repair the tables. Once the table has been repaired, disk quotas can be reapplied to the account. 

1. Resolve which account the database is under.
    ```bash
    stat -c "%G %n" `readlink /var/lib/mysql/somedb`
    # admin34 /home/virtual/site34/shadow/var/lib/mysql/somedb
    ```
2. Remove quota from the group
    ```bash
    setquota -g admin34 0 0 0 0 -a
    ```
3. Verify MySQL has started up:
    ```bash
    tail -f /var/log/mysqld.log
    .. 
    # YYMMDD  6:15:05 [Note] Plugin 'FEEDBACK' is disabled.
    # YYMMDD  6:15:05 [Note] Server socket created on IP: '::'.
    # YYMMDD  6:15:05 [Note] /usr/sbin/mysqld: ready for connections.
    # Version: '10.0.31-MariaDB'  socket: '/.socket/mysql/mysql.sock'  port: 3306  MariaDB Server
    ```
4. Re-enable disk quota on the account or increase it:
    ```bash
    EditDomain -c diskquota,quota=20000 -c diskquota,unit=MB site34 
    ​```bash
    ```


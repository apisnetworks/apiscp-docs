# MySQL

[MariaDB](https://mariadb.org), a drop-in MySQL replacement developed by the original author of MySQL is used instead of MySQL. This decision was motivated strongly by greater stability in the product over Oracle MySQL.  MariaDB is implied when referring to MySQL throughout this documentation. 

MySQL version is determined at installation time via `mariadb_version`. Changing minor versions on a production server is ill-advised, instead consider migrating to another ApisCP platform using the [migration tool](Migrations%20-%20server.md). For example schema differences between 10.4 and 10.3 make a downgrade impossible ("user" is a view in 10.4 and table in 10.3). Officially, MariaDB [does not support](https://mariadb.com/kb/en/downgrading-between-major-versions-of-mariadb/) downgrading. Patch releases (10.3.1 => 10.3.2) are supported and deployed automatically without issue.

## Namespacing
All accounts are prefixed with a database namespace. In service metadata, this value is *mysql*,*dbaseprefix*. A prefix must end with an underscore ("_"). If not supplied, it will be automatically generated from the primary domain on the account. 

A prefix can be adjusted a couple ways. First, if *[auth]* => *allow_database_change* is enabled ([Tuneables.md](Tuneables.md)), then Site Administrators may change it under **Account** > **Settings**. If this value is disabled, then the Appliance Administrator may change the prefix either in **Nexus** or from the command-line using [EditDomain](Plans.md#editdomain).

```bash
# Change the prefix to "foo_"
EditDomain -c mysql,dbaseprefix=foo_ bar.com
```

When a prefix is changed, all authentication details must be updated to reference the new prefix. These **are not updated** on prefix change.

## Enabling remote connections

`data_center_mode` is a [Bootstrapper](Bootstrapper.md) setting that opens remote access to MySQL. Once opened, MySQL is protected by [Rampart](Rampart.md). `data_center_mode` opens up remote MySQL access in addition to a slew of other features. If you'd like to just open MySQL, use the **mysql.remote-access** [Scope](Scopes.md).


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
    ```

### Row size too large

#### Background
Importing a database backup from an older MySQL version (before 2017) may throw an exception of the form,

```
ERROR 1118 (42000) at line 2289: Row size too large (> 8126). Changing some columns to TEXT or BLOB may help. In current row format, BLOB prefix of 0 bytes is stored inline.
```

This typically is caused by poor database design. Dynamic rows with a multitude of columns can create significant [performance impairment](https://www.percona.com/blog/2009/09/28/how-number-of-columns-affects-performance/) that is better addressed through proper normalization, which in turn allows for deduplication of data and higher cardinality.

An example of such poor design is as follows,

```
CREATE TABLE `wp_bwg_theme` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `thumb_margin` int(4) NOT NULL,
  `thumb_padding` int(4) NOT NULL,
  `thumb_border_radius` varchar(32) NOT NULL,
  `thumb_border_width` int(4) NOT NULL,
  `thumb_border_style` varchar(16) NOT NULL,
  `thumb_border_color` varchar(8) NOT NULL,
  `thumb_bg_color` varchar(8) NOT NULL,
  `thumbs_bg_color` varchar(8) NOT NULL,
  `thumb_bg_transparent` int(4) NOT NULL,
  `thumb_box_shadow` varchar(32) NOT NULL,
  `thumb_transparent` int(4) NOT NULL,
  `thumb_align` varchar(8) NOT NULL,
  `thumb_hover_effect` varchar(128) NOT NULL,
  `thumb_hover_effect_value` varchar(128) NOT NULL,
  `thumb_transition` tinyint(1) NOT NULL,
  `thumb_title_font_color` varchar(8) NOT NULL,
  `thumb_title_font_style` varchar(16) NOT NULL,
  `thumb_title_pos` varchar(8) NOT NULL,
...
150 more columns
...
  `carousel_rl_btn_width` int(4) NOT NULL,
  `carousel_close_rl_btn_hover_color` varchar(8) NOT NULL,
  `carousel_rl_btn_style` varchar(16) NOT NULL,
  `carousel_mergin_bottom` varchar(8) NOT NULL,
  `carousel_font_family` varchar(8) NOT NULL,
  `carousel_feature_border_width` int(4) NOT NULL,
  `carousel_feature_border_style` varchar(8) NOT NULL,
  `carousel_feature_border_color` varchar(8) NOT NULL,
  `carousel_caption_background_color` varchar(8) NOT NULL,
  `carousel_caption_bottom` int(4) NOT NULL,
  `carousel_caption_p_mergin` int(4) NOT NULL,
  `carousel_caption_p_pedding` int(4) NOT NULL,
  `carousel_caption_p_font_weight` varchar(8) NOT NULL,
  `carousel_caption_p_font_size` int(4) NOT NULL,
  `carousel_caption_p_color` varchar(8) NOT NULL,
  `carousel_title_opacity` int(4) NOT NULL,
  `carousel_title_border_radius` varchar(8) NOT NULL,
  `default_theme` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
```
*Beyond storing things that could be represented numerically as non-numeric strings*, what if we want to add a new attribute such as the carousel's z-index or transform/skew property? Add a new column just for this specific purpose? It's a lot of wasted space and a lot of data to fetch for a simple query.

#### Solution
Avoid using such software. Would you live in a house that has failed its safety inspection? Seeing architecture like this hints there are deeper problems with the code because such design is easily avoidable with proper planning. As code grows so too does its complexity and with that complexity come new opportunities for vulnerabilities to exist.

##### See also

- [Troubleshooting Row Size Too Large Errors with InnoDB](https://mariadb.com/kb/en/troubleshooting-row-size-too-large-errors-with-innodb/) (mariadb.com)


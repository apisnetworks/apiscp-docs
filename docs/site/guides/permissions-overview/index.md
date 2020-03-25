---
title: "Permissions overview"
date: "2014-10-28"
---

Every file is made up of a permission set. These permissions consists of 3 sets of 3 bits for a total of 27 configurations. _Just kidding!_ It's not that complex!

`-r--r--r--    root   root 1972 Oct 13 23:14 test.mail -rw-r--r--   admin  admin 4345 Aug 29 12:33 test.php -rwxr-xr-x  nobody  admin  592 Sep 25 10:20 test.py drwxrwxrwx   admin nobody 4096 Jul  9 10:28 tmp`

Let's take a look at output from a [FTP client](https://kb.apnscp.com/ftp/accessing-ftp-server/#recommended). Three files and 1 directory exist in this example. A directory, tmp/, denoted by "**d**" is also called a folder: a place to stash files. Each file has different permission sets, which permit different interactions.

## Permissions

Permissions are broken into chunks that consist of read (r), write (w), and execute (x) properties. _Read_ permits access to read file or folder contents, _write_ permits access to modify the file or remove files within a directory, and _execute_ allows the file to run as a program or to open a directory. An absence of a permission is replaced by "-".

> **Note:** a directory could have just execute (x), lack read (r), and still be accessible by a user. File contents could not be listed, but if the filename were known, then it could be opened. This approach is recommended in multi-user accounts to protect against file snooping.
> 
> _Likewise_, if a directory lacks an execute bit (x), then neither it nor any directories within it may be opened.

Each file or directory consists of 3 chunks that are applied to the file _owner_, _group_, and everyone else (simply called "_other_"). Notice how each file has two users next to it?

`-rw-r--r--    **admin admin** 4345 Aug 29 12:33 test.php`

These 2 fields represent the _owner_ and _group_ to which the file belongs. Owner is the user who created the file, and group is the group to which the user belongs. "Everyone else" is everyone else who isn't the owner nor a member of the group, in particular the web server that runs as user "apache" in its own group. Only user _admin_ can write to the file. Other users created via **Users** > **Add User **can read the file, as can the web server, in addition to the creator, _admin_.

> Any file created by a user on your account will possess the same group, which is the primary username of the account. A special user "apache" is any file created by a web application. Permissions are applied nightly to permit modification by the primary user on the account. Ownership can be changed via **Files** > **File Manager** > **Properties** action within the control panel.

Permissions must be changed to allow another user, like a PHP application, write access to the file. But before that, take a quick aside to learn about the alternative form of presenting permissions...

## Octal Conversion

Permissions can be presented in set or octal form. Previously permissions were presented as sets for easy understanding. Now, map each permission type: \[r,w,x\] into a number: \[4, 2, 1\]. Add these numbers up for each permission chunk and you get a 3-digit number between 0 and 7 that represents permissions for the _owner_, _group_, and _other_.

`-rw----r--` becomes 604, `drwxr-xr-x` becomes 755, and so on. Whenever permissions are referred to as "777", this maps to `-rwxrwxrwx`.

604 Conversion

owner

group

other

r

w

\-

\-

\-

\-

r

\-

\-

4

2

0

0

0

0

4

0

0

6

0

4

755 Conversion

owner

group

other

r

w

x

r

\-

x

r

\-

x

4

2

1

4

0

1

4

0

1

7

5

5

Permissions from now on will be referred to in octal for brevity.

## Changing Permissions

Permissions may be edited in a variety of ways:

- FTP client. See [FTP access](https://kb.apnscp.com/ftp/accessing-ftp-server/) KB article for details
- Web-accessible FTP client via [ftp.apnscp.com](http://ftp.apnscp.com). Select _chmod_ operation.
- Within the control panel: **Files** > **File Manager** > **Properties** action
- [Terminal](https://kb.apnscp.com/terminal/accessing-terminal/): [chmod](http://apnscp.com/linux-man/man1/chmod.1.html)

Permissions may be applied to a single file or directory, or recursively to all files and directories within a directory. Files created after changes are applied will not inherit these new permissions and must be reapplied as necessary.

## 777 Permission

777 is a simple way to allow every user access to modify, create, and delete files. Often 777 is recommended to allow a PHP application access to create files. Yes, it does work and on Apis Networks' hosting platform is quite secure (PHP undergoes a separate round of security checkpoints), but other users on your account also have access to read, modify, and delete files. It is, therefore, **recommended to specify 717 instead of 777** to lockout other users on your account from making adjustments to files. PHP applications will still be able to write to those files - _and only those files_ - explicitly granted by 717 permissions.

## Why use multiple users?

Computing power has grown exponentially over the last decade; the cost to crawl a web site and brute-force has decreased. Along with the growth of knowledge, attackers have become more sophisticated carrying out attacks through [elaborate botnets](http://en.wikipedia.org/wiki/Botnet) consisting of several hundred thousand machines. Common exploitable vectors include weak FTP passwords for other users on your account as well as outdated web applications. These vectors are continuously accessed by unauthorized users throughout the day from thousands of IP addresses that slip below detection thresholds. Such attacks are orchestrated from a single command-and-control sever that command infected machines to periodically try a login/password combination.

A single machine may probe a site **2-5 times per hour** (once every 12 minutes). Multiplied out by **10,000** different machines in a botnet, **1,200,000** combinations per day is enough to try every possible 4-letter password combination consisting of lowercase letters and numbers 0-9 in **_only 1 day_** or test [every known WordPress exploit](https://cve.mitre.org/cgi-bin/cvekey.cgi?keyword=wordpress) against 65 different sites each day.

1. Attacks do happen, and the level of sophistication is much greater than a decade ago.
2. Use separate users to restrict the impact of an unauthorized breach.
3. Judiciously apply permissions to only those files that the web server or other users must have access to modify.

_Reduce your risk and impact by utilizing multiple users._

## See Also

- [PHP: Writing to files](https://kb.apnscp.com/php/writing-to-files/)

---
title: "File management with multiple users"
date: "2017-02-14"
---

Access control lists ([ACLs](https://wiki.archlinux.org/index.php/Access_Control_Lists)) may be used in multi-user environments to allow granular joint access to file management without allowing access by all users on the account. ACLs can be established either by the owner of the file or account admin using [Beacon](https://kb.apnscp.com/control-panel/scripting-with-beacon/).

ACLs come in two forms, an active entry and default. Active are actively applied to the file or directory whereas default ACL entries are applied on directories to files created in the future within that directory.

## Using setfacl

ACLs may be set from the [terminal](https://kb.apnscp.com/terminal/accessing-terminal/) using `setfacl` on all [v5+ platforms](https://kb.apnscp.com/platform/determining-platform-version/). `setfacl` may only be applied on files owned by the current user. For files owned by another user, use `file_set_acls` in Beacon (below) or take ownership of the files first using [file\_chown](http://api.apnscp.com/docs/class-File_Module.html#_chown) in Beacon or [chown](https://kb.apnscp.com/terminal/elevating-privileges-with-sudo/) in sudo.

Syntax to set an ACL entry is `setfacl -m [d:]_USERNAME_:_PERMISSIONS_ _FILE_` where:

- `d:` is an optional specifier to apply the ACLs as default ACLs rather than active ACLs
- _USERNAME_ is the user on the account to apply these ACLs to
- _PERMISSIONS_ is an [octal bitmask](https://kb.apnscp.com/guides/permissions-overview/) between 0 and 7 or a collection of r,w,x representing read/write/execute permissions respectively
- The -m ... command may be repeated an infinite number of times to apply new rules to other users
- \-R may be specified to apply the rules recursively

#### Simple usage

$ setfacl -m user:tom:7 newdata.zip
$ getfacl newdata.zip
# file: newdata.zip
# owner: myadmin
# group: myadmin
user::rw-
user:tom:rwx
group::r--
mask::rwx
other::r--

### More examples

- Granting an additional user read access `setfacl -m u:lisa:r file`
- Revoking write access from all groups and all named users (using the effective rights mask) `setfacl -m m::rx file`
- Removing a named group entry from a file’s ACL `setfacl -x g:staff file`
- Copying the ACL of one file to another `getfacl file1 | setfacl --set-file=- file2`
- Copying the access ACL into the Default ACL `getfacl --access dir | setfacl -d -M- dir`

### Further reading

Check out the man page on both [setfacl](https://linux.die.net/man/1/setfacl) and [getfacl](https://linux.die.net/man/1/getfacl)

## Using Beacon

[Beacon](https://kb.apnscp.com/control-panel/scripting-with-beacon/) provides an alternative interface to ACLs that can run from using [file\_set\_acls](http://api.apnscp.com/docs/class-File_Module.html#_set_acls) and [file\_get\_acls](http://api.apnscp.com/docs/class-File_Module.html#_get_acls). ACLs set via Beacon override traditional discretionary access checks when applied as the primary account holder; this means that as the primary user, you can alter any ACL on any file whereas using setfacl from the terminal requires that the file you are adjusting be owned by you.

$ beacon eval file\_set\_acls /var/www/html redline 7
1
$ getfacl /var/www/html
getfacl: Removing leading '/' from absolute path names
# file: var/www/html
# owner: myadmin
# group: myadmin
user::rwx
user:redline:rwx
group::r-x
mask::rwx
other::r-x

To set default ACLs, supply a third parameter: _default:1_ and to apply recursively, _recursive:1_

$ beacon eval file\_set\_acls /var/www/html/test redline 7 \[default:1,recursive:1\]
1
$ getfacl /var/www/html/test/foo
getfacl: Removing leading '/' from absolute path names
# file: var/www/html/test/foo
# owner: myadmin
# group: myadmin
# flags: -s-
user::rwx
user:redline:rwx #effective:r-x
group::rwx #effective:r-x
mask::r-x
other::--x
default:user::rwx
default:user:redline:rwx
default:group::rwx
default:mask::rwx
default:other::--x

To clear an ACL entry for a specific user, do not supply a permission parameter:

$ beacon eval file\_set\_acls /var/www/html/test redline 
$ getfacl /var/www/html/test/foo
getfacl: Removing leading '/' from absolute path names
# file: var/www/html/test/foo
# owner: myadmin
# group: myadmin
# flags: -s-
user::rwx
group::rwx #effective:r-x
mask::r-x
other::--x
default:user::rwx
default:group::rwx
default:mask::rwx
default:other::--x

Lastly, to mix and match users:

$ beacon eval file\_set\_acls /var/www/html/test \[redline:7,apache:7\]
1
$ getfacl /var/www/html/test
getfacl: Removing leading '/' from absolute path names
# file: var/www/html/test
# owner: myadmin
# group: myadmin
user::rwx
user:apache:rwx
user:redline:rwx
group::r-x
mask::rwx
other::r-x

## See also

- KB: [Permission overview](https://kb.apnscp.com/guides/permissions-overview/)
- KB: [Scripting with Beacon](https://kb.apnscp.com/control-panel/scripting-with-beacon/)

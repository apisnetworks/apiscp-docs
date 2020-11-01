# Perl apps

## Install CPAN packages

[CPAN](http://www.cpan.org/modules/index.html) is a comprehensive module repository for Perl. CPAN packages may be installed from command-line using the CPAN shell.

```bash
perl -MCPAN -e shell
install ACL::Lite
```

`ACL::Lite` package will be installed in `/usr/local/lib/perl5`. 

This is the recommend approach for Site Administrators. Packages installed as the Appliance Administrator will not be accessible by sites. We'll need to install packages system-wide using a relocated directory under `/.socket` to accomplish this in the next section.

### Installing system-wide

Modify CPAN to install into "vendor".

```bash
perl -MCPAN -e shell
o conf makepl_arg INSTALLDIRS=vendor
o conf commit
```

Perl modules will install under `/usr/share/perl5`, which is relocated to `/.socket/perl5/share`, a special [shared path](Filesystem.md) for system files.


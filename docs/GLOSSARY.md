{:#Account metadata}
: *Metadata* about an account that resides in *siteXX/info*. Examples of metadata include the primary domain, admin username, bandwidth allotment.

{:#API}
: An API is the exposed, public features of cod.

{:#Array}
: Set of values.

{:#Backtrace}
: Reverse order of the *call stack*

{:#Bandwidth}
: Amount of transfer (inbound and outbound) that an account registers over a period. Bandwidth is in bytes unless a *unit* prefix is specified.

{:#Billing invoice}
: An identifier that relates an account or set of accounts to a common billing entity. Billing invoices are stored in billing,invoice account metadata.

{:#Blocking}
: Typically used in relation to IO, an operation is blocking if it does not release control of the callstack.

{:#Byte}
: An indivisible unit comprised of 8 bits. Bytes are units of measure of how data is stored and transmitted.

{:#Call stack}
: Order of operations a program is currently processing. Often call stacks are nested indicating multiple layers of logic to arrive at a point.

{:#Class}
: Collection of related code that shares runtime attributes.

{:#Command-line}
: Direct server access accessed over terminal. SSH and embedded terminal (KVM) are used to access this mode.

{:#Complex type}
: Complex types may store more than one value. In the context of *service parameters*, a complex type is always an *array*. 
Examples: ipinfo,ipaddrs=['64.22.68.1'], aliases,aliases=['domain.com']. ipinfo,namebased=[]

{:#dentry}
: A dentry maintains a relationship between a directory - also stored as an *inode* - and its files. Dentries bind a file or directory name to its metadata (*inode*).

{:#Function}
: Collection of related code.

{:#get_site_id} *lit.*
: get_site_id is a [shell](#command-line) helper function to resolve a [domain](#primary-domain) (or addon domain) to its *site identifier*.
Example: get_site_id apiscp.com

{:#/home/virtual}
: Account home for all *virtual accounts*. All accounts follow a *siteXX* notation with a *primary domain* symlink for easy access. *get_site_id* is the preferred utility to resolve a domain to siteXX from the *command-line*.

{:#inode}
: inodes are created by the filesystem to track metadata about files and directories, such as its access times, access rights, and where it is stored. Compare with *dentry*.

{:#Method}
: A *function* within a *class* that often inherits attributes about itself.

{:#Load average}
: An erroneous definition. See *run-queue depth*.

{:#Metadata}
: Data about data. A common example of this is account metadata that lives in siteXX/info for each account.

{:#null} *or None*
: In context of service values: a service value that is undefined. *null* is the preferred definition; however, *None* may be also used owing homage to ApisCP's progenitor, Ensim WEBppliance. 

{:#Plan}
: Templates consisting of predefined account metadata to be applied to accounts that inherit this plan. Plan assignment is stored in *siteinfo,plan* account metadata. Plans live in `resources/templates/plans`. See [Plans.md](admin/Plans.md) for managing.

{:#Primary domain}
: Domain assigned via siteinfo,domain *service parameter* during account creation. This may be changed at a later date through the *API* using `auth:change-domain`.

{:#Run-queue depth}
: Often misrepresented as "load average" is the averaged depth of work parcels over a measured *unit* of time, jiffies. This value is meaningless without evaluating it relative to the number of logical CPUs attached to a server. Run-queue can be high without excessive computation if IO wait is high (indicating *blocking* IO). Likewise run-queue can hit stratospheric levels necessitating an (ASR)[#automated-system-recovery] 

{:#Service name}
: A collection of related *service parameters*; for example, "diskquota" controls how much storage is allotted to an account. Within diskquota are several service parameters that tune aspects relating to diskquota including storage limits and inode limits.

{:#Service parameter}
: An attribute within a service name. See *service name*. 

{:#Service value}
: Setting for a *service parameter*. Service values come in [simple](#simple-type) and complex forms. Certain service parameters have predictable values, such as "enabled" which is 1 or 0. Booleans (true/false) are encoded as 1/0 respectively. Arrays are stored as a *complex type*.

{#Simple type}
: Any value that may be represented as a number, string, or boolean. Simple types cannot hold more than one value. See *complex type*. 
Examples: diskquota,quota=4310.55, apache,webuser=apache, siteinfo,enabled=1

{:#siteXX}
: An expression that refers to /home/virtual/siteXX where siteXX is the *site identifier* of an account.

{:#Site identifier}
: Internal marker for sites, which is defined on account creation. Site identifier index begins at 1 and the next largest value is assigned. Site identifiers do not change unless the account is deleted, then recreated. Site identifiers may be determined by domain using *get_site_id* from the command-line.
Examples: site12, site1, site999999999..

{:#Site ID identifier}
: Numeric component of the *Site identifier*.

{:#Stack trace}
: A frozen *call stack* associated with bug reports. A stack trace includes the [call hierarchy](#call-stack) in addition to *parameters* passed to each *method*.

{:#Unit}
: A measurement quantity. "Bytes", the most common unit referenced, is a measurement of electronic data. 
# phpMyAdmin

## Technical overview

Password is first sourced from ~/.my.cnf via `mysql:get-option('password','client')`. In absence of this value, the account password is tested IFF the user has signed in through the UI authentication gate and *[auth]* => *retain_ui_password* is true. If either condition is false, SSO does not proceed prompting a user to enter their password.

Authentication is akin to connecting locally to MySQL using the sign-on username and supplied password, `mysql -u USERNAME -p PASSWORD`. This platform makes a distinction between localhost and 127.0.0.1; moreover, ident-based authentication (SO_PEERCRED) is not used in MySQL authentication.

*If prompted*: the form-submitted password is applied to the above MySQL authentication routine. Upon successful authentication, the password is updated in ~/.my.cnf under [client] via `mysql:set-option('password','client')`. 

*If authenticated*: a login session is simulated with the client. A session succeeds if pmaUser-1, pmaPass-1, phpMyAdmin, pma_mcrypt_iv-1, and pma_pmaAuth-1 are present in the login in addition to a redirection to a location that contains a query string parameter "token". These are passed to *PHPMYADMIN_LOCATION*/dummyset.php?&lt;param&gt;=&lt;val&gt; to apply the cookies from a trusted origin.

*PHPMYADMIN_LOCATION* is determined by the fully-qualified node (`uname -n`). This node must have a trusted SSL certificate to proceed (see [SSL.md](SSL.md)).
---
title: "Working with Laravel config:cache"
date: "2016-10-25"
---

Laravel provides a static cache utility [via Artisan](https://laravel.com/docs/5.3/configuration) to collapse configuration under `config/` into a single file to boost performance. Configuration may be cached using:

`php artisan config:cache`

When run from [terminal](https://kb.apnscp.com/terminal/is-terminal-access-available/), the paths provided may be incorrectly referenced when the application is accessed from the web resulting in application errors.

## Solution

Overwrite `bootstrap/app.php` to use a custom loader. We'll override a couple methods to bypass cache in CLI SAPI mode (_php artisan xx:yy_) and opportunistically regenerate the cache whenever remote changes are pushed upstream via git.

### Replacing bootstrapper

Create a new file called **ApplicationWrapper.php** in **app/** to provide additional functionality to Illuminate\\Foundation\\Application:

<?php
namespace App;

use Illuminate\\Foundation\\Application;

class ApplicationWrapper extends Application {

    public function \_\_construct($basePath)
    {
        if (!isset($\_SERVER\['SITE\_ROOT'\])) {
            $\_SERVER\['SITE\_ROOT'\] = '';
        }
        parent::\_\_construct($basePath);
    }

   /\*\*
    \* Fake configuration cache response for CLI
    \* as paths will always be different
    \* 
    \* @return bool
    \*/
    public function configurationIsCached() {
        if ($this->runningInConsole()) {
            return false;
        }
        return parent::configurationIsCached();
    }

   /\*\*
    \* Emulate \\Illuminate\\Foundation\\Console\\ConfigCache\\fire()
    \*
    \* @return bool
    \*/
    public function doCache() {
       if (!$this->runningInConsole()) {
           $config = $this->app\['config'\]->all();
           $this->files->put(
               $this->getCachedConfigPath(), '<?php return '.var\_export($config, true).';'.PHP\_EOL
           );
       }
        return true;
    }

    /\*
     \* Override boot to register production config cache
     \* @return boolean
     \*/
    public function boot()
    {
        parent::boot();
        if ($this->environment() !== "production") {
           return;
        }
        if (!$this->runningInConsole()) {
            $app = $this->app;
            $this->terminating(function() use ($app) {
                $app->configurationIsCached() || $app->doCache();
            });
        } else {
           $path = parent::getCachedConfigPath();
           $this->terminating(function() use ($path) {
              file\_exists($path) && unlink($path);
           });
        }

    }
}

A couple notes:

1. Cache is done post-boot so that configuration is properly loaded. Caching is done once at the end of the request to reduce overhead.
2. _APP\_ENV_ mode is assumed to be "production"; this is controlled by [.env](https://laravel.com/docs/configuration#environment-configuration).
3. **artisan config:cache** will create, then immediately unlink config.php in favor of generation by the web server

Next, adjust **bootstrap/app.php** to instantiate a new _ApplicationWrapper_ instance rather than _Illuminate\\Foundation\\Application_:

Change:

$app = new Illuminate\\Foundation\\Application(
    realpath(\_\_DIR\_\_.'/../')
);

to

$app = new App\\ApplicationWrapper(
    realpath(\_\_DIR\_\_.'/../')
);

And that's it! Run **php artisan config:clear** to have it automatically regenerate during the next page request.

### Regenerating Cache with git

Next, create a _post-receive_ hook in your git repository on the server. Create **hooks/post-receive** if it does not already exist with the following content:

#!/bin/sh
LIVE="/var/www/"

read oldrev newrev refname
if \[\[ $refname = "refs/heads/master" \]\]; then 
    echo "===== DEPLOYING TO LIVE SITE =====" 
    unset GIT\_DIR
    cd $LIVE
    ./build.sh
    echo "===== DONE ====="
fi

And **build.sh** is a shell script run after every successful _git push_ commit. The following script assumes your Laravel app path is /var/www/laravel-directory and git repository /var/www/git-repository

#!/bin/sh
pushd /var/www/laravel-directory
git pull /var/www/git-repository
# Recompile all class defs into a monolithic file
php artisan optimize --force
php artisan config:clear

Now the next git push will automatically deploy, generate a class loader, and recompile site configuration:

$ git push
Counting objects: 5, done.
Delta compression using up to 4 threads.
Compressing objects: 100% (5/5), done.
Writing objects: 100% (5/5), 440 bytes | 0 bytes/s, done.
Total 5 (delta 4), reused 0 (delta 0)
remote: ===== DEPLOYING TO LIVE SITE =====
remote: /var/www/laravel-production /var/www
remote: From ./../git
remote: \* branch HEAD -> FETCH\_HEAD
remote: Updating b7b99b8..d4f04a5
remote: Fast-forward
remote: config/filesystems.php | 4 ++--
remote: config/view.php | 4 ++--
remote: 2 files changed, 4 insertions(+), 4 deletions(-)
remote: Generating optimized class loader
remote: Compiling common classes
remote: Configuration cache cleared!
remote: ===== DONE =====
To ssh://apnscp#apnscp.com@luna.apnscp.com/var/www/git
 b7b99b8..d4f04a5 master -> master

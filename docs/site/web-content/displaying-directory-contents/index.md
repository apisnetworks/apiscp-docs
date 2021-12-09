---
title: "Displaying directory contents"
date: "2014-10-31"
---

If you would like for the Web server to generate a listing of all contents in a given directory, then create a file named .htaccess with the following line: `Options +Indexes`

You will also need to remove all directory index files (e.g. index.html, index.php, index.htm, index.\*) from the target directory. The directory index files will always take precedence over the `Indexes` directive.

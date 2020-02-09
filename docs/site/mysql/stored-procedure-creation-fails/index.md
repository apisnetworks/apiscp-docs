---
title: "Stored procedure creation fails"
date: "2015-05-20"
---

## Overview

During a database import, a stored procedure may be included in the backup. Although the backup is complete, restoring it within phpMyAdmin, the control panel, or mysql CLI fails with a similar error:

#1227 - Access denied; you need (at least one of) the SUPER privilege(s) for this operation

## Cause

Included in the procedure definition is a _DEFINER_ clause. DEFINER clauses require SUPER privileges, which also permit the user access to set critical database configuration parameters, terminate users, and change replication settings. Naturally, these cannot be accessed by users for security reasons.

## Solution

Remove _DEFINER_ subclause from _CREATE_ ... _PROCEDURE_, for example:

CREATE DEFINER=\`myuser\`@\`localhost\` PROCEDURE \`some\_proc\`(user INT, fingerprint VARCHAR(64))

becomes:

CREATE PROCEDURE \`some\_proc\`(user INT, fingerprint VARCHAR(64))

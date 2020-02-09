#!/usr/bin/env sh

# abort on errors
set -e

# build
yarn docs:build

# navigate into the build output directory
cd docs/.vuepress/dist

# if you are deploying to a custom domain
echo 'docs.apiscp.com' > CNAME

git config --global user.email "msaladna@apisnetworks.com"
git config --global user.name "circle-ci"

git init
git add -A
git commit -m 'deploy [skip ci]'

# if you are deploying to https://<USERNAME>.github.io/<REPO>
git push -f git@github.com:apisnetworks/apnscp-docs.git master:gh-pages

cd -

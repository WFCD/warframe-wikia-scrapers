#!/bin/bash

if [ "$TRAVIS_BRANCH" == "master" ]; then
  BRANCH="MASTER"
else
  BRANCH="travis-$TRAVIS_BUILD_NUMBER"
fi

setup_git() {
  git config --global user.email "travis@travis-ci.org"
  git config --global user.name "Travis CI"
  git clone https://github.com/WFCD/warframe-worldstate-data.git
  cd warframe-worldstate-data
  git checkout -b $BRANCH
}

prepare_json() {
  node index.js
}

commit_worldstate_data_files() {
  cp ../build/weapondatafinal.json data/weapons.json
  git add data/weapons.json
  git commit --message "Travis build: warframe-wikia-scrapers $TRAVIS_BUILD_NUMBER"
}
  
upload_files() {
  git remote add origin-update https://${GH_TOKEN}@github.com/WFCD/warframe-worldstate-data.git
  git push --quiet --set-upstream  origin-update $BRANCH
}

setup_git
prepare_json
commit_worldstate_data_files
upload_files
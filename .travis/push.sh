#!/bin/bash
if [ "$TRAVIS_BRANCH" == "reporting" ]; then
  setup_git() {
    git config --global user.email "travis@travis-ci.org"
    git config --global user.name "Travis CI"
    git clone git@github.com:WFCD/warframe-worldstate-data.git
    cd warframe-worldstate-data
    git checkout -b scraper-travis-test
  }
 
  prepare_json() {
    node index.js
  }

  commit_worldstate_data_files() {
    git clone https://github.com/WFCD/warframe-worldstate-data.git
    cd warframe-worldstate-data
    git checkout -b scraper-travis-test
    cp ../build/weapondatafinal.json data/weapons.json
    git add data/weapons.json
    git commit --message "Travis build: warframe-wikia-scrapers $TRAVIS_BUILD_NUMBER"
  }
    
  upload_files() {
    git remote add origin-update https://${GH_TOKEN}@github.com/WFCD/warframe-worldstate-data.git > /dev/null 2>&1
    git push --quiet --set-upstream  origin-update scraper-travis-test
  }
    
  setup_git
  prepare_json
  commit_worldstate_data_files
  upload_files
fi
#!/bin/bash
if [ "$TRAVIS_BRANCH" == "master" ] && [ "$TRAVIS_PULL_REQUEST" == "false"  ]; then
  BRANCH="master"
else
  BRANCH="travis-$TRAVIS_BUILD_NUMBER"
fi

setup_git() {
  git config --global user.email "travis@travis-ci.org"
  git config --global user.name "Travis CI"
  git clone https://github.com/WFCD/warframe-worldstate-data.git
  git clone https://github.com/WFCD/warframe-status.git
}

prepare_json() {
  node index.js
}

commit_worldstate_data_files() {
  cd warframe-worldstate-data
  git checkout -b $BRANCH
  cp ../build/weapondatafinal.json data/weapons.json
  git add data/weapons.json
  git commit --message "Travis build: warframe-wikia-scrapers $TRAVIS_BUILD_NUMBER"
}
  
upload_files() {
  git remote add origin-update https://${GH_TOKEN}@github.com/WFCD/warframe-worldstate-data.git
  git push --quiet --set-upstream  origin-update $BRANCH
}

publish_worldstate_data() {
  npm version patch -m "Travis build $TRAVIS_BUILD_NUMBER update from warframe-wikia-scrapers"
}

# Update wfcd/warframe-status to consume the new version of warframe-worldstate-data
update_warframe_status() {
  cd ../warframe-status
  git checkout -b $BRANCH
  npm update --save
  git add package.json
  git commit --message "Travis build: warframe-wikia-scrapers $TRAVIS_BUILD_NUMBER"
  git remote add origin-update https://${GH_TOKEN}@github.com/WFCD/warframe-status.git
  git push --quiet --set-upstream  origin-update $BRANCH
}

setup_git
prepare_json
commit_worldstate_data_files
upload_files

if [ "$BRANCH" == "master" ]; then
  publish_worldstate_data
  update_warframe_status
fi
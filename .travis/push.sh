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
  if [ "$BRANCH" == "master"]; then
    git checkout $BRANCH
  else
    git checkout -b $BRANCH
  fi

  cp ../build/weapondatafinal.json data/weapons.json
  git add data/weapons.json
  git commit --message "chore(automated): Travis build: warframe-wikia-scrapers $TRAVIS_BUILD_NUMBER"
}
  
upload_files() {
  git remote add origin-update https://${GH_TOKEN}@github.com/WFCD/warframe-worldstate-data.git
  git push --quiet --set-upstream  origin-update $BRANCH
}

publish_worldstate_data() {
  echo "Publishing Worldstate Data"
  npm version patch -m "chore(automated): Travis build $TRAVIS_BUILD_NUMBER update from warframe-wikia-scrapers"
  npm publish
}

# Update wfcd/warframe-status to consume the new version of warframe-worldstate-data
update_warframe_status() {
  echo "Updating Warframe-Status"
  cd ../warframe-status
  if [ "$BRANCH" == "master"]; then
    git checkout $BRANCH
  else
    git checkout -b $BRANCH
  fi
  npm update --save
  git add package.json package-lock.json
  git commit --message "chore(automated): Travis build: warframe-wikia-scrapers $TRAVIS_BUILD_NUMBER"
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

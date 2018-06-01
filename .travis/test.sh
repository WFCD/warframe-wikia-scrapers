#!/bin/bash
TEST_BRANCH=$(git rev-parse --symbolic-full-name --abbrev-ref HEAD)

if [ "$TEST_BRANCH" == "master" ]; then
  node index.js && nyc --report lcovonly mocha && cat ./coverage/lcov.info | codacy-coverage --username TobiTenno --projectName warframe-wikia-scrapers && rm -rf ./coverage
else
  node index.js && mocha
fi

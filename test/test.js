'use strict';

// requiring for test usage
require('../index.js');
// end required coverage files

const fs = require('fs-extra');

const { assert } = require('chai');

let weaponDataRaw;
let weaponData;
let warframedataRaw;
let WarframeData;

describe('Output file', () => {
  it('should contain a valid, nonempty JSON array of objectsfor weapons:', async () => {
    try {
      weaponDataRaw = await fs.readFile('build/weapondatafinal.json');
    } catch (err) {
      assert.fail(err);
    }

    try {
      weaponData = JSON.parse(weaponDataRaw);
      assert.typeOf(weaponData[0], 'object', 'json ');
    } catch (err) {
      assert.fail(err);
    }
  });

  after(() => {
    console.log();
    console.dir(weaponData[0]);
  });
});
describe('Output file', () => {
  it('should contain a valid, nonempty JSON array of objects for frames:', async () => {
    try {
      warframedataRaw = await fs.readFile('build/framedatafinal.json');
    } catch (err) {
      assert.fail(err);
    }

    try {
      WarframeData = JSON.parse(warframedataRaw);
      assert.typeOf(WarframeData[0], 'object', 'json ');
    } catch (err) {
      assert.fail(err);
    }
  });

  after(() => {
    console.log();
    console.dir(WarframeData[0]);
  });
});

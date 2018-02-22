'use strict';

const fs = require('fs-extra');

const { assert } = require('chai');

let weaponDataRaw;
let weaponData;

describe('Output file', () => {
  it('should contain a valid, nonempty JSON array of objects:', async () => {
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
});
console.log();
console.dir(weaponData[0]);

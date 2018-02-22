'use strict';

const fs = require('fs-extra');

const { assert } = require('chai');

describe('Output file', () => {
  it('should contain a valid, nonempty JSON array of objects', async () => {
    let weaponDataRaw;

    try {
      weaponDataRaw = await fs.readFile('build/weapondatafinal.json');
    } catch (err) {
      assert.fail(err);
    }

    try {
      const weaponData = JSON.parse(weaponDataRaw);
      assert.typeOf(weaponData[0], 'object', 'json ');
    } catch (err) {
      assert.fail(err);
    }
  });
});

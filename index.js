'use strict';

const axios = require('axios');
const cmd = require('node-cmd');
const fs = require('fs-extra');
const cheerio = require('cheerio');

const transformWeapon = require('./transformers/transformWeapon');
const transformWarframe = require('./transformers/transformWarframe');

let imageUrls;
let imageFUrls;

const getLuaFrameData = async () => {
  try {
    const { data } = await axios.get('http://warframe.wikia.com/wiki/Module:Warframes/data?action=edit');
    const $ = cheerio.load(data);
    return $('#wpTextbox1').text();
  } catch (err) {
    console.error('Failed to fetch latest warframe data:');
    console.error(err);
    return '';
  }
};

const convertFrameDataToJson = async (luaFramedata) => {
  const scriptlines = luaFramedata.split('\n');

  // Remove return statement
  const modifiedScript = scriptlines
    .slice(0, scriptlines.length - 2)
    .join('\n');

  // Add JSON conversion
  const luaToJsonScript = `
    JSON = (loadfile "JSON.lua")()\n
    ${modifiedScript}\n
    print(JSON:encode(WarframeData))
  `;

  // Run updated JSON lua script
  if (!await fs.exists('./tmp')) {
    await fs.mkdir('./tmp');
  }
  await fs.writeFile('./tmp/framedataToJson.lua', luaToJsonScript, {
    encoding: 'utf8',
    flag: 'w',
  });

  try {
    await new Promise((resolve, reject) => cmd.get('lua ./tmp/framedataToJson.lua > ./tmp/framedataraw.json', (err) => {
      if (!err) {
        resolve();
      } else {
        reject(err);
        throw (new Error(err));
      }
    }));
  } catch (err) {
    console.error('Failed to execute modified lua script:');
    console.error(err);
  }
  const warframedataRaw = await fs.readFile('./tmp/framedataraw.json', 'UTF-8');
  return warframedataRaw;
};

const getWarframeImageUrls = async (warframes) => {
  const titles = [];
  Object.keys(warframes).forEach((warframeName) => {
    titles.push(`File:${warframes[warframeName].Image}`);
  });
  // Split titles into batches of 50, the max allowed by the wikimedia API
  const titleBatches = [];
  while (titles.length > 0) {
    titleBatches.push(titles.splice(0, 50));
  }

  const urlRequests = titleBatches.map(titleBatch =>
    axios.get('http://warframe.wikia.com/api.php', {
      params: {
        action: 'query',
        titles: titleBatch.join('|'),
        prop: 'imageinfo',
        iiprop: 'url',
        format: 'json',
      },
    }));

  try {
    const fetchedImageUrls = await Promise.all(urlRequests).then((res) => {
      const urls = {};
      res.forEach(({ data }) => {
        Object.keys(data.query.pages).forEach((id) => {
          if (id > -1) {
            const title = data.query.pages[id].title.replace('File:', '');
            const { url } = data.query.pages[id].imageinfo[0];
            urls[title] = url;
          }
        });
      });
      return urls;
    });

    return fetchedImageUrls;
  } catch (err) {
    console.error('Failed to fetch image URLs:');
    console.error(err);
    return [];
  }
};

async function mainF() {
  const luaFramedata = await getLuaFrameData();
  const warframedata = JSON.parse(await convertFrameDataToJson(luaFramedata));
  imageFUrls = await getWarframeImageUrls(warframedata.Warframes);

  let warframes = [];

  try {
    warframes = Object.keys(warframedata.Warframes).map(warframeName =>
      transformWarframe(warframedata.Warframes[warframeName], imageUrls))
      .filter(warframe => typeof warframe !== 'undefined');
  } catch (e) {
    console.error(e);
  }

  if (!await fs.exists('./build')) {
    await fs.mkdir('./build');
  }

  fs.writeFile('./build/framedatafinal.json', JSON.stringify(warframes));
  fs.remove('./tmp');
}

const getLuaWeaponData = async () => {
  try {
    const { data } = await axios.get('http://warframe.wikia.com/wiki/Module:Weapons/data?action=edit');
    const $ = cheerio.load(data);
    return $('#wpTextbox1').text();
  } catch (err) {
    console.error('Failed to fetch latest weapon data:');
    console.error(err);
    return '';
  }
};

const convertWeaponDataToJson = async (luaWeapondata) => {
  const scriptlines = luaWeapondata.split('\n');

  // Remove return statement
  const modifiedScript = scriptlines
    .slice(0, scriptlines.length - 2)
    .join('\n');

  // Add JSON conversion
  const luaToJsonScript = `
    JSON = (loadfile "JSON.lua")()\n
    ${modifiedScript}\n
    print(JSON:encode(WeaponData))
  `;

  // Run updated JSON lua script
  if (!await fs.exists('./tmp')) {
    await fs.mkdir('./tmp');
  }
  await fs.writeFile('./tmp/weapondataToJson.lua', luaToJsonScript, {
    encoding: 'utf8',
    flag: 'w',
  });

  try {
    await new Promise((resolve, reject) => cmd.get('lua ./tmp/weapondataToJson.lua > ./tmp/weapondataraw.json', (err) => {
      if (!err) {
        resolve();
      } else {
        reject(err);
        throw (new Error(err));
      }
    }));
  } catch (err) {
    console.error('Failed to execute modified lua script:');
    console.error(err);
  }
  const weapondataRaw = await fs.readFile('./tmp/weapondataraw.json', 'UTF-8');
  return weapondataRaw;
};

const getWeaponImageUrls = async (weapons) => {
  const titles = [];
  Object.keys(weapons).forEach((weaponName) => {
    titles.push(`File:${weapons[weaponName].Image}`);
  });

  // Split titles into batches of 50, the max allowed by the wikimedia API
  const titleBatches = [];
  while (titles.length > 0) {
    titleBatches.push(titles.splice(0, 50));
  }

  const urlRequests = titleBatches.map(titleBatch =>
    axios.get('http://warframe.wikia.com/api.php', {
      params: {
        action: 'query',
        titles: titleBatch.join('|'),
        prop: 'imageinfo',
        iiprop: 'url',
        format: 'json',
      },
    }));

  try {
    const fetchedImageUrls = await Promise.all(urlRequests).then((res) => {
      const urls = {};
      res.forEach(({ data }) => {
        Object.keys(data.query.pages).forEach((id) => {
          if (id > -1) {
            const title = data.query.pages[id].title.replace('File:', '');
            const { url } = data.query.pages[id].imageinfo[0];
            urls[title] = url;
          }
        });
      });
      return urls;
    });

    return fetchedImageUrls;
  } catch (err) {
    console.error('Failed to fetch image URLs:');
    console.error(err);
    return [];
  }
};

async function main() {
  const luaWeapondata = await getLuaWeaponData();
  const weapondata = JSON.parse(await convertWeaponDataToJson(luaWeapondata));

  imageUrls = await getWeaponImageUrls(weapondata.Weapons);

  let weapons = [];
  try {
    weapons = Object.keys(weapondata.Weapons).map(weaponName =>
    transformWeapon(weapondata.Weapons[weaponName], imageUrls))
    .filter(weapon => typeof weapon !== 'undefined');
  } catch (e) {
    console.error(e);
  }


  if (!await fs.exists('./build')) {
    await fs.mkdir('./build');
  }
  fs.writeFile('./build/weapondatafinal.json', JSON.stringify(weapons));
  fs.remove('./tmp');
  mainF();
}

main();

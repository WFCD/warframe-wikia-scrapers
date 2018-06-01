'use strict';

const fs = require('fs-extra');

const WeaponScraper = require('./src/dataScrapers/WeaponScraper');
const WarframeScraper = require('./src/dataScrapers/WarframeScraper');


const run = async () => {
  let scraper = new WeaponScraper();
  if (!await fs.exists('./tmp')) {
    await fs.mkdir('./tmp');
  }
  try {
    await scraper.scrape();
  } catch (e) {
    console.error(`[ERROR] Error scraping Weapon data: ${e.stack}`);
  }

  scraper = new WarframeScraper();
  try {
    await scraper.scrape();
  } catch (e) {
    console.error(`[ERROR] Error scraping Warframe data: ${e.stack}`);
  }
  await fs.remove('./tmp');
};

run();


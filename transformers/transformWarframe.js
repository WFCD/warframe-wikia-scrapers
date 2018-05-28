'use strict';

const getColors = require('get-image-colors');
const imageDownloader = require('image-downloader');

const POLARITIES = {
  Bar: 'naramon',
  V: 'madurai',
  D: 'vazarin',
};

const transformPolarities = ({ Polarities, AuraPolarity }, targetWeapon) => {
  const outputFrame = { ...targetWeapon };
  if (AuraPolarity) {
    outputFrame.AuraPolarity = POLARITIES[AuraPolarity];
  }
  if (Polarities) {
    outputFrame.polarities = Polarities.map(polarity => POLARITIES[polarity]);
  } else {
    outputFrame.polarities = [];
  }
  return outputFrame;
};
const mapColors = async (oldFrame, imageUrl) => {
  if (!imageUrl) return 0;
  try {
    const options = {
      url: imageUrl,
      dest: `${__dirname}/temp-${encodeURIComponent(imageUrl)}.png`,
    };
    const { image } = await imageDownloader.image(options);
    const colors = await getColors(image, 'image/png');
    return typeof colors !== 'undefined' ? colors[0].hex().replace('#', '0x') : 0xff0000;
  } catch (e) {
    console.error(e);
    return 0;
  }
};

const transformWarframe = async (oldFrame, imageUrls) => {
  let newFrame;
  if (!oldFrame || !oldFrame.Name) {
    return undefined;
  }
  try {
    const {
      Armor,
      AuraPolarity,
      Conclave,
      Energy,
      Health,
      Image,
      Mastery,
      Polarities,
      Shield,
      Sprint,
      Introduced,
      Sex,
      Vaulted,
    } = oldFrame;
    const { Name } = oldFrame;

    newFrame = {
      regex: `^${Name.toLowerCase().replace(/\s/g, '\\s')}$`,
      name: Name,
      url: `http://warframe.wikia.com/wiki/${encodeURIComponent(Name.replace(/\s/g, '_'))}`,
      thumbnail: imageUrls[Image],
      armor: Armor,
      auraPolarity: AuraPolarity,
      conclave: Conclave,
      energy: Energy,
      health: Health,
      mr: Mastery || 0,
      polarities: Polarities,
      shield: Shield,
      sprint: Sprint,
      introduced: Introduced,
      sex: Sex,
      color: parseInt(await mapColors(oldFrame, imageUrls[Image]), 16),
      vaulted: Vaulted || undefined,
    };

    newFrame = transformPolarities(oldFrame, newFrame);
  } catch (error) {
    console.error(`Error parsing ${oldFrame.Name}`);
    console.error(error);
  }
  return newFrame;
};

module.exports = transformWarframe;

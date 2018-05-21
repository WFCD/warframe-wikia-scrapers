'use strict';

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

const transformWarframe = (oldFrame, imageUrls) => {
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
      // Vaulted,
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
      // Vaulted: Vaulted,
    };

    newFrame = transformPolarities(oldFrame, newFrame);
  } catch (error) {
    console.error(`Error parsing ${oldFrame.Name}`);
    console.error(error);
  }

  return newFrame;
};

module.exports = transformWarframe;

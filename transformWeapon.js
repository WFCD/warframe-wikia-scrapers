'use strict';

const ELEMENTS = {
  Electricity: 'electricity',
  Corrosive: 'corrosive',
  Toxin: 'toxin',
  Heat: 'heat',
  Blast: 'blast',
  Radiation: 'radiation',
};

const POLARITIES = {
  Bar: 'naramon',
  V: 'madurai',
  D: 'vazarin',
};

const transformPolarities = ({ Polarities, StancePolarity }, targetWeapon) => {
  const outputWeapon = { ...targetWeapon };
  if (StancePolarity) {
    outputWeapon.stancePolarity = POLARITIES[StancePolarity];
  }
  if (Polarities) {
    outputWeapon.polarities = Polarities.map(polarity => POLARITIES[polarity]);
  } else {
    outputWeapon.polarities = [];
  }
  return outputWeapon;
};

const transformWeapon = (oldWeapon, imageUrls) => {
  let newWeapon;
  if (!oldWeapon || !oldWeapon.Name) {
    return undefined;
  }
  try {
    const {
      Mastery,
      Type,
      Class,
      NormalAttack,
      NoiseLevel,
      Accuracy,
      Magazine,
      MaxAmmo,
      Reload,
      Disposition,
      SlideAttack,
      SlideElement,
      JumpAttack,
      JumpElement,
      WallAttack,
      WallElement,
      Polarities,
      ChannelMult,
      Image,
      Trigger,
      ChargeAttack,
    } = oldWeapon;
  
    const { Name } = oldWeapon;

    newWeapon = {
      regex: `^${Name.toLowerCase().replace(/\s/g, '\\s')}$`,
      name: Name,
      url: `http://warframe.wikia.com/wiki/${encodeURIComponent(Name.replace(/\s/g, '_'))}`,
      mr: Mastery || 0,
      type: Type,
      subtype: Class,
      ...NoiseLevel && { noise: NoiseLevel },
      riven_disposition: Disposition,
      crit_chance: NormalAttack && NormalAttack.CritChance
        && Number((Number(NormalAttack.CritChance) * 100).toFixed(2)),
      crit_mult: NormalAttack && NormalAttack.CritMultiplier
        && Number(Number(NormalAttack.CritMultiplier).toFixed(1)),
      status_chance: NormalAttack && NormalAttack.StatusChance
        && Number((Number(NormalAttack.StatusChance) * 100).toFixed(2)),
      ...(ChargeAttack && ChargeAttack.CritChance)
        && { crit_chance: Number((Number(ChargeAttack.CritChance) * 100).toFixed(2)) },
      ...(ChargeAttack && ChargeAttack.CritMultiplier)
        && { crit_mult: Number(Number(ChargeAttack.CritMultiplier).toFixed(2)) },
      ...(ChargeAttack && ChargeAttack.StatusChance)
        && { status_chance: Number((Number(ChargeAttack.StatusChance) * 100).toFixed(2)) },
      polarities: Polarities,
      thumbnail: imageUrls[Image],
      speed: NormalAttack && NormalAttack.FireRate,
      ...MaxAmmo && { ammo: MaxAmmo },
      ...Accuracy && { accuracy: Accuracy },
      ...Magazine && { magazine: Magazine },
      ...Reload && { reload: Reload },
      ...(NormalAttack && NormalAttack.ShotType)
        && { projectile: NormalAttack.ShotType.replace('Hit-scan', 'Hitscan') },
      ...(ChargeAttack && ChargeAttack.ShotType)
        && { projectile: ChargeAttack.ShotType.replace('Hit-scan', 'Hitscan') },
      ...(NormalAttack && NormalAttack.FireRate)
        && { rate: Number(NormalAttack.FireRate.toFixed(1)) },
    };
  
    if (NormalAttack) {
      newWeapon.damage = Object.keys(NormalAttack.Damage).reduce(
        (sum, damageType) => NormalAttack.Damage[damageType] + sum,
        0,
      ).toFixed(2).replace(/(\.[\d]+)0/, '$1');
    } else if (ChargeAttack) {
      newWeapon.damage = Number(Object.keys(ChargeAttack.Damage).reduce(
        (sum, damageType) => ChargeAttack.Damage[damageType] + sum,
        0,
      ).toFixed(2).replace(/(\.[\d]+)0/, '$1'));
    }
  
    if (Trigger) {
      if (NormalAttack && NormalAttack.BurstCount) {
        newWeapon.trigger = `${Trigger} (${NormalAttack.BurstCount})`;
      } else if (ChargeAttack && ChargeAttack.ChargeTime) {
        newWeapon.trigger = `${Trigger} (${ChargeAttack.ChargeTime}s)`;
      } else {
        newWeapon.trigger = Trigger;
      }
    }
  
    const damageTypes = [
      'Impact',
      'Slash',
      'Puncture',
    ];
    if (NormalAttack && NormalAttack.Damage) {
      damageTypes.forEach((damageType) => {
        newWeapon[damageType.toLowerCase()] = NormalAttack.Damage[damageType] ? Number(NormalAttack.Damage[damageType].toFixed(2).replace(/(\.[\d]+)0/, '$1')) : undefined;
      });
      Object.keys(ELEMENTS).forEach((element) => {
        if (NormalAttack.Damage[element]) {
          newWeapon.damage = `${NormalAttack.Damage[element].toFixed(2).replace(/(\.[\d]+)0/, '$1')} ${ELEMENTS[element]}`;
        }
      });
    } else if (ChargeAttack && ChargeAttack.Damage) {
      damageTypes.forEach((damageType) => {
        newWeapon[damageType.toLowerCase()] = ChargeAttack.Damage[damageType] ? Number(ChargeAttack.Damage[damageType].toFixed(2).replace(/(\.[\d]+)0/, '$1')) : undefined;
      });
    }
  
    if ((Type === 'Primary' || Type === 'Secondary') && NormalAttack) {
      newWeapon = {
        ...newWeapon,
        ...NormalAttack.ShotSpeed && {
          flight: Number(NormalAttack.ShotSpeed) || '???',
        },
      };
    } else if (Type === 'Melee') {
      newWeapon = {
        ...newWeapon,
        slide: `${SlideAttack}${SlideElement ? ELEMENTS[SlideElement] : ''}`,
        jump: `${JumpAttack}${JumpElement ? ELEMENTS[JumpElement] : ''}`,
        wall: `${WallAttack}${WallElement ? ELEMENTS[WallElement] : ''}`,
        channeling: ChannelMult || 1.5,
      };
    }
  
    newWeapon = transformPolarities(oldWeapon, newWeapon);
  } catch (error) {
    console.error(`Error parsing ${oldWeapon.Name}`);
    console.error(error);
  }

  return newWeapon;
};

module.exports = transformWeapon;

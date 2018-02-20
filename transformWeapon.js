'use strict';

const ELEMENTS = {
  Electricity: '<:electricity:321463957212626944>',
  Corrosive: '<:corrosive:321463957305032714>',
  Toxin: '<:toxin:321463957325873153>',
  Heat: '<:heat:321463957061763083>',
  Blast: '<:blast:321463957292318720>',
  Radiation: '<:radiation:321463957221277706>',
};

const POLARITIES = {
  Bar: '<:naramon:319586146478850048>',
  V: '<:madurai:319586146499690496>',
  D: '<:vazarin:319586146269003778>',
};

const transformPolarities = ({ Polarities, StancePolarity }, targetWeapon) => {
  const outputWeapon = { ...targetWeapon };
  if (StancePolarity) {
    outputWeapon.stancePolarity = POLARITIES[StancePolarity];
  }
  if (Polarities) {
    outputWeapon.polarities = Polarities.map(polarity => POLARITIES[polarity]).join('');
  } else {
    outputWeapon.polarities = 'None';
  }
  return outputWeapon;
};

const transformWeapon = (oldWeapon, imageUrls) => {
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

  let { Name } = oldWeapon;

  if (Name.indexOf('MK1') > -1) {
    Name = `${Name.replace('MK1-', '')}, Mk1`;
  }

  const VARIANTS = [
    'Telos',
    'Rakta',
    'Prisma',
    'Synoid',
    'Secura',
    'Sancti',
    'Dragon',
    'Vaykor',
  ];

  VARIANTS.forEach((variant) => {
    if (Name.indexOf(variant) > -1) {
      Name = `${Name.replace(`${variant} `, '')}, ${variant}`;
    }
  });

  let newWeapon = {
    regex: `^${Name.toLowerCase().replace(/\s/g, '\\s')}$`,
    name: Name,
    url: `http://warframe.wikia.com/wiki/${encodeURIComponent(Name.replace(/\s/g, '_'))}`,
    mr: Mastery || 0,
    type: Type,
    subtype: Class,
    ...NoiseLevel && { noise: NoiseLevel },
    riven_disposition: Disposition,
    crit_chance: NormalAttack && `${NormalAttack.CritChance * 100}%`,
    crit_mult: NormalAttack && NormalAttack.CritMultiplier && `${NormalAttack.CritMultiplier.toFixed(1)}x`,
    status_chance: NormalAttack && `${NormalAttack.StatusChance * 100}%`,
    ...(ChargeAttack && ChargeAttack.CritChance) && { crit_chance: `${ChargeAttack.CritChance * 100}%` },
    ...(ChargeAttack && ChargeAttack.CritMultiplier) && { crit_mult: `${ChargeAttack.CritMultiplier.toFixed(1)}x` },
    ...(ChargeAttack && ChargeAttack.StatusChance) && { status_chance: `${ChargeAttack.StatusChance * 100}%` },
    polarities: Polarities,
    thumbnail: imageUrls[Image],
    speed: NormalAttack && NormalAttack.FireRate,
    ...MaxAmmo && { ammo: String(MaxAmmo) },
    ...Accuracy && { accuracy: Accuracy },
    ...Magazine && { magazine: Magazine },
    ...Reload && { reload: `${Reload}s` },
    ...(NormalAttack && NormalAttack.ShotType) && { projectile: NormalAttack.ShotType.replace('Hit-scan', 'Hitscan') },
    ...(ChargeAttack && ChargeAttack.ShotType) && { projectile: ChargeAttack.ShotType.replace('Hit-scan', 'Hitscan') },
    ...(NormalAttack && NormalAttack.FireRate) && { rate: NormalAttack.FireRate.toFixed(1) },
  };

  if (NormalAttack) {
    newWeapon.damage = Object.keys(NormalAttack.Damage).reduce(
      (sum, damageType) => NormalAttack.Damage[damageType] + sum,
      0,
    ).toFixed(2).replace(/(\.[\d]+)0/, '$1');
  } else if (ChargeAttack) {
    newWeapon.damage = Object.keys(ChargeAttack.Damage).reduce(
      (sum, damageType) => ChargeAttack.Damage[damageType] + sum,
      0,
    ).toFixed(2).replace(/(\.[\d]+)0/, '$1');
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
      newWeapon[damageType.toLowerCase()] = NormalAttack.Damage[damageType] ? NormalAttack.Damage[damageType].toFixed(2).replace(/(\.[\d]+)0/, '$1') : '-';
    });
    Object.keys(ELEMENTS).forEach((element) => {
      if (NormalAttack.Damage[element]) {
        newWeapon.damage = `${NormalAttack.Damage[element].toFixed(2).replace(/(\.[\d]+)0/, '$1')}${ELEMENTS[element]}`;
      }
    });
  } else if (ChargeAttack && ChargeAttack.Damage) {
    damageTypes.forEach((damageType) => {
      newWeapon[damageType.toLowerCase()] = ChargeAttack.Damage[damageType] ? ChargeAttack.Damage[damageType].toFixed(2).replace(/(\.[\d]+)0/, '$1') : '-';
    });
  }

  if ((Type === 'Primary' || Type === 'Secondary') && NormalAttack) {
    newWeapon = {
      ...newWeapon,
      ...NormalAttack.ShotSpeed && {
        flight: `${NormalAttack.ShotSpeed} m/s`,
      },
    };
  } else if (Type === 'Melee') {
    newWeapon = {
      ...newWeapon,
      slide: `${SlideAttack}${SlideElement ? ELEMENTS[SlideElement] : ''}`,
      jump: `${JumpAttack}${JumpElement ? ELEMENTS[JumpElement] : ''}`,
      wall: `${WallAttack}${WallElement ? ELEMENTS[WallElement] : ''}`,
      channeling: ChannelMult ? `${ChannelMult}x` : '1.5x',
    };
  }

  newWeapon = transformPolarities(oldWeapon, newWeapon);

  return newWeapon;
};

module.exports = transformWeapon;

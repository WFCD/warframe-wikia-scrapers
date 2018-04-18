'use strict';

const ELEMENTS = {
  Electricity: 'electricity',
  Corrosive: 'corrosive',
  Toxin: 'toxin',
  Heat: 'heat',
  Blast: 'blast',
  Radiation: 'radiation',
  Cold: 'cold',
  Viral: 'viral',
  Magnetic: 'magnetic',
  Gas: 'gas',
  Void: 'void',
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
      SecondaryAttack,
      SecondaryAreaAttack,
    } = oldWeapon;
  
    const { Name } = oldWeapon;
    
    if (oldWeapon.Secondary) {
      console.log(oldWeapon.Secondary);
    }

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
      'Heat',
      'Cold',
      'Electricity',
      'Toxin',
      'Viral',
      'Corrosive',
      'Radiation',
      'Blast',
      'Magnetic',
      'Gas',
      'Void',
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
    
    if (SecondaryAreaAttack) {
      newWeapon.secondaryArea = {
        name: SecondaryAreaAttack.AttackName,
        status_chance: SecondaryAreaAttack && SecondaryAreaAttack.StatusChance
          && Number((Number(SecondaryAreaAttack.StatusChance) * 100).toFixed(2)),
        duration: SecondaryAreaAttack && SecondaryAreaAttack.Duration
          && Number((Number(SecondaryAreaAttack.Duration) * 100).toFixed(2)),
        radius: SecondaryAreaAttack && SecondaryAreaAttack.Radius
          && Number((Number(SecondaryAreaAttack.Radius) * 100).toFixed(2)),
        speed: SecondaryAreaAttack && SecondaryAreaAttack.FireRate,
      };
      
      if (SecondaryAreaAttack.PelletName) {
        newWeapon.secondaryArea.pellet = {
          name: SecondaryAreaAttack.PelletName,
          count: SecondaryAreaAttack.PelletCount,
        };
      }
      
      
      // Convert damage numbers and names
      if (SecondaryAreaAttack.Damage) {
        damageTypes.forEach((damageType) => {
          newWeapon.secondaryArea[damageType.toLowerCase()] = SecondaryAreaAttack.Damage[damageType] ? Number(SecondaryAreaAttack.Damage[damageType].toFixed(2).replace(/(\.[\d]+)0/, '$1')) : undefined;
        });
        Object.keys(ELEMENTS).forEach((element) => {
          if (SecondaryAreaAttack.Damage[element]) {
            newWeapon.secondaryArea.damage = `${SecondaryAreaAttack.Damage[element].toFixed(2).replace(/(\.[\d]+)0/, '$1')} ${ELEMENTS[element]}`;
          }
        });
      }
    }
    
    if (SecondaryAttack) {
      newWeapon.secondary = {
        name: SecondaryAttack.AttackName,
        speed: SecondaryAttack.FireRate,
        crit_chance: SecondaryAttack.CritChance
          && Number((Number(SecondaryAttack.CritChance) * 100).toFixed(2)),
        crit_mult: SecondaryAttack.CritMultiplier
          && Number(Number(SecondaryAttack.CritMultiplier).toFixed(1)),
        status_chance: SecondaryAttack && SecondaryAttack.StatusChance
          && Number(Number(SecondaryAttack.StatusChance).toFixed(1)),
        charge_time: SecondaryAttack.ChargeTime
          && Number(Number(SecondaryAttack.ChargeTime).toFixed(1)),
        shot_type: SecondaryAttack.ShotType,
        shot_speed: SecondaryAttack.ShotSpeed
          && Number(Number(SecondaryAttack.ShotSpeed).toFixed(1))
       };
       
       if (SecondaryAttack.PelletName) {
        newWeapon.secondary.pellet = {
          name: SecondaryAttack.PelletName,
          count: SecondaryAttack.PelletCount,
        };
      }
       
      // Convert damage numbers and names
      if (SecondaryAttack.Damage) {
        damageTypes.forEach((damageType) => {
          newWeapon.secondary[damageType.toLowerCase()] = SecondaryAttack.Damage[damageType] ? Number(SecondaryAttack.Damage[damageType].toFixed(2).replace(/(\.[\d]+)0/, '$1')) : undefined;
        });
        Object.keys(ELEMENTS).forEach((element) => {
          if (SecondaryAttack.Damage[element]) {
            newWeapon.secondary.damage = `${SecondaryAttack.Damage[element].toFixed(2).replace(/(\.[\d]+)0/, '$1')} ${ELEMENTS[element]}`;
          }
        });
      }
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

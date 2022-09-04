export const Weapon = Object.freeze({
  Hands: Symbol("hands"),
  Spear: Symbol("spear"),
  IceBreath: Symbol("ice_breath"),
  FireBreath: Symbol("fire_breath"),
  WaterBreath: Symbol("water_breath"),
  IceSword: Symbol("ice_sword"),
  FireSword: Symbol("fire_sword"),
  WaterSword: Symbol("water_sword"),
  IceCream: Symbol("ice_cream"),
  Heart: Symbol("heart"),
  MaxHeal: Symbol("max_heal"),
});

export const WeaponData = {
  [Weapon.Hands]: {
    name: "hands",
    damage: 2,
    speed: 1,
  },
  [Weapon.Spear]: {
    name: "spear",
    damage: 3,
    speed: 8,
    price: 1,
    desc: ["A light wooden", "spear with its", "end whittled to", "a point"],
  },
  [Weapon.IceBreath]: {
    name: "ice breath",
    damage: 1,
    speed: 20,
    special: "freeze",
    price: 1,
    desc: ["Spell:", "Freeze your", "enemies"],
  },
  [Weapon.FireBreath]: {
    name: "fire breath",
    damage: 1,
    speed: 20,
    special: "burn",
    price: 1,
  },
  [Weapon.WaterBreath]: {
    name: "water breath",
    damage: 2,
    speed: 20,
    special: "soak",
    price: 1,
  },
  [Weapon.IceSword]: {
    name: "ice sword",
    damage: 9,
    speed: 15,
    type: "ice",
    price: 1,
    desc: ["A sword made", "from vibrant", "blue ice"]
  },
  [Weapon.FireSword]: {
    name: "fire sword",
    damage: 9,
    speed: 9,
    type: "fire",
    price: 1,
  },
  [Weapon.WaterSword]: {
    name: "water sword",
    damage: 9,
    speed: 10,
    type: "water",
    price: 1,
  },
  [Weapon.IceCream]: {
    name: "ice cream",
    heal: true,
    damage: 10,
    speed: 5,
    price: 1,
    desc: ["I scream", "you scream", "Heal 10"],
  },
  [Weapon.Heart]: {
    name: "heart",
    heal: true,
    damage: 20,
    speed: 8,
    price: 1,
    desc: ["ew", "Heal 20"],
  },
  [Weapon.MaxHeal]: {
    name: "ice cream",
    heal: true,
    damage: 50,
    speed: 1,
    price: 1,
    desc: ["Heal 50"],
  },
}

export const weapons = [
  Weapon.Hands,
  Weapon.Spear,
];


export let WeaponToId = {};
export let IdToWeapon = {};

weapons.forEach((weapon, id) => {
  WeaponToId[weapon] = id;
  IdToWeapon[id] = weapon;
});
export const Weapon = Object.freeze({
  Hands: Symbol("hands"),
  Stick: Symbol("stick"),
});

export const WeaponData = {
  [Weapon.Hands]: {
    name: "hands",
    damage: 2,
    speed: 10,
  },
  [Weapon.Stick]: {
    name: "stick",
    damage: 3,
    speed: 8,
  },
}

export const weapons = [
  Weapon.Hands,
  Weapon.Stick,
];


export let WeaponToId = {};
export let IdToWeapon = {};

weapons.forEach((weapon, id) => {
  WeaponToId[weapon] = id;
  IdToWeapon[id] = weapon;
});
export const Enemy = Object.freeze({
  Dummy: Symbol("symbol"), 
  SandFlea: Symbol("sandflea"),
  Tumps: Symbol("tumps"),
});

export const EnemyData = {
  [Enemy.Dummy]: {
    name: "dummy",
    health: 5,
    attacks: [{
      flavour: ["The dummy stands", "menacingly"],
      damage: 0,
      speed: 0,
    }],
    gold: 0,
  },
  [Enemy.SandFlea]: {
    name: "sandflea",
    health: 4,
    gold: 2,
    attacks: [{
      flavour: ["The sandflea hits", "you for %", "dmg"],
      damage: 2,
      speed: 100,
    }]
  }
}


export const enemies = [
  Enemy.Dummy,
  Enemy.SandFlea,
];

export let enemyToId = {};
export let enemyNameToId = {};
export let idToEnemy = {};

enemies.forEach((enemy, id) => {
  enemyToId[enemy] = id;
  enemyNameToId[enemy.name] = id;
  idToEnemy[id] = enemy;
});
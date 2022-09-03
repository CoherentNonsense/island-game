export const Enemy = Object.freeze({
  Dummy: Symbol("symbol"), 
  SandFlea: Symbol("sandflea"),
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
    health: 8,
    speed: 50,
    damage: 2,
    gold: 2,
  }
}

export const enemies = [
  Enemy.Dummy,
  Enemy.SandFlea,
];

export let enemyToId = {};
export let idToEnemy = {};

enemies.forEach((enemy, id) => {
  enemyToId[enemy] = id;
  idToEnemy[id] = enemy;
});
export const Enemy = Object.freeze({
  Dummy: Symbol("symbol"), 
  SandFlea: Symbol("sandflea"),
  Grass: Symbol("grass"),
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
    damage: 1,
    gold: 2,
  },
  [Enemy.Grass]: {
    name: "grass",
    health: 15,
    speed: 10,
    damage: 4,
  }
}
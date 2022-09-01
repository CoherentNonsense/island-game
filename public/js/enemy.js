export const Enemy = Object.freeze({
  SandFlea: Symbol("sandflea"),
});

export const EnemyData = {
  [Enemy.SandFlea]: {
    health: 10,
    speed: 50,
    damage: 1,
  }
}
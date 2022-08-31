
const gameState = Object.freeze({
  Map:      Symbol("map"),
  Travel:   Symbol("travel"),
  Combat:   Symbol("combat"),
  Location: Symbol("location"),
});

let client = null;
let lastTime = 0;
export default function startGame(gameClient) {
  client = gameClient;

  requestAnimationFrame((t) => {
    lastTime = t;
    gameTick(t);
  });
}

function gameTick(time) {
  const deltaTime = time - lastTime;
  lastTime = time;
  
  client.pollIncomingPackets((packet) => {
    console.log(packet.readNumber());
  });

  context.drawImage(image, 0, 0, size, size)

  requestAnimationFrame((t) => {
    gameTick(t);
  });
}
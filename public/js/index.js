import Client from "./client.js";
import Renderer from "./renderer.js";
import { gameTick } from "./game.js";

const client = new Client();
const renderer = new Renderer("canvas");


function gameLoop(time = 0) {
  
  gameTick(time, client, renderer);

  requestAnimationFrame((t) => {
    gameLoop(t);
  });
}

async function main() {
  await Promise.all([
    client.start("ws://localhost:8080"),
    renderer.loadImages([
      "font",
      "spritesheet",
      "map",
      "console",
      "start",
      "dummies",
    ]),
    renderer.loadAnim("title", 2),
  ]);

  gameLoop();
}

main();
import Client from "./client.js";
import Renderer from "./renderer.js";
import { gameTick } from "./game.js";
import Input from "./input.js";

const client = new Client();
const renderer = new Renderer("canvas");
const input = new Input();


function gameLoop(time = 0) {
  
  gameTick(time, client, renderer, input);

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
      "sandflea",
    ]),
    renderer.loadAnim("title", 2),
  ]);

  gameLoop();
}

main();
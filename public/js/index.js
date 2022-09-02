import Client from "./client.js";
import Renderer from "./renderer.js";
import { gameTick } from "./game.js";
import Input from "./input.js";

const renderer = new Renderer("canvas");
const input = new Input();


function gameLoop(time = 0) {
  
  gameTick(time, renderer, input);

  requestAnimationFrame((t) => {
    gameLoop(t);
  });
}

async function main() {
  await Promise.all([
    renderer.loadImages([
      // System
      "font",
      "console",

      // Map
      "spritesheet",
      "map_mtnsnow",
      "map_snow",
      "map_ice",

      // Locations
      "start",
      "dummies",
      "tutport",
      "citylg",
      "crossroads",
      "statue",

      // Enemies
      "sandflea",
      "dummy",
    ]),
    renderer.loadAnim("intro", 45),
    renderer.loadAnim("title", 8),
    renderer.loadAnim("map_base", 3),
    renderer.loadAnim("map_deco", 3),
    renderer.loadAnim("map_river", 3),
    renderer.loadAnim("map_rain", 2),
  ]);

  gameLoop();
}

main();
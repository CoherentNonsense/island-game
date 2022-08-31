import Client from "./client.js";
import Packet from "./packet.js";
import Renderer from "./renderer.js";
import { Locations, Location, worldGraph } from "./world.js";


const client = new Client();
const renderer = new Renderer("canvas");


const IMAGE_FILES = ["map", "title", "spritesheet", "font"];
const images = [];
for (let i = 0; i < IMAGE_FILES.length; ++i) {
  images[i] = new Image();
  images[i].src = `assets/${IMAGE_FILES[i]}.png`;
}

const GameState = Object.freeze({
  Title:      Symbol("title"),
  Character:  Symbol("character"),
  Map:        Symbol("map"),
  Travel:     Symbol("travel"),
  Combat:     Symbol("combat"),
  Location:   Symbol("location"),
});

let gameState = GameState.Title;
let players = [];
let mapSelectIndex = 0;

let lastTime = 0;
function gameLoop(time = 0) {
  const deltaTime = time - lastTime;
  lastTime = time;
  
  client.pollIncomingPackets((packet) => {
    const packetId = packet.readNumber();

    switch (packetId) {
      case 2:

        break;
      default:
        break;
    }
  });

  switch (gameState) {
    case GameState.Title:
      renderer.context.drawImage(images[1], 0, 0, renderer.size, renderer.size);
      break;
    case GameState.Map: {
      renderer.context.drawImage(images[0], 0, 0, renderer.size, renderer.size);
      const moveableLocations = worldGraph.get(Location.Dummies);

      renderer.draw(images[2], 0, 9, 9, 9, Locations[Location.Dummies].position[0], Locations[Location.Dummies].position[1]);
      const selectedLocation = Locations[moveableLocations[mapSelectIndex % moveableLocations.length]];
      renderer.draw(images[2], 0, 0, 9, 9, selectedLocation.position[0], selectedLocation.position[1]);
      break;
    }
    default:
      break;
  }


  requestAnimationFrame((t) => {
    gameLoop(t);
  });
}

function addPlayer(username) {
  players.push({
    username,
    location: Location.Start,
    inventory: [],
  })
}

async function main() {
  await client.start("ws://localhost:8080");


  gameLoop();
}

document.getElementById("host-btn").onclick = () => {
  const packet = new Packet();
  packet.writeNumber(0);
  client.sendPacket(packet);
  gameState = GameState.Map;
}
document.getElementById("join-btn").onclick = () => {
  const packet = new Packet();
  packet.writeNumber(1);
  packet.writeNumber(0);
  client.sendPacket(packet);
}

addEventListener("keydown", (e) => {
  switch (e.key) {
    case "ArrowLeft":
      mapSelectIndex -= 1;
      break;
    case "ArrowRight":
      mapSelectIndex += 1;
      break;
    default:
      break;
  }
});

main();
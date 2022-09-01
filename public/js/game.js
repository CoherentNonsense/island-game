import Input from "./input.js";
import { locationToMenu, startMenu, titleMenu } from "./menus.js";
import Packet from "./packet.js";
import { LocationData, Location, worldGraph } from "./world.js";


export const GameState = Object.freeze({
  Title:      Symbol("title"),
  Map:        Symbol("map"),
  Travel:     Symbol("travel"),
  Combat:     Symbol("combat"),
  Location:   Symbol("location")
});

const input = new Input();

let party = [];

const gameData = {
  state: GameState.Title,
  currentMenu: titleMenu,
  currentLocation: Location.Start,
  locationSelected: 0,

  enemy: {},
};


function drawMenu(renderer, time, menu) {
  renderer.fillRect("#080808", 0, 80, 160, 80);

  menu.currentOptions().forEach((option, idx) => {
    const text = idx === menu.index ? ">" + option.name : " " + option.name;
    renderer.drawText(83, 2 + (13 * idx), text);
  });

  menu.messages.forEach((message, idx) => {
    renderer.drawText(3, 83 + (13 * idx), message);
  });

  menu.drawDisplay(renderer, time);

  if (!menu.inputMode) return;
  let flash = Math.floor(time * 0.002) % 2;
  if (menu.input.length === 17) flash = 0;
  renderer.drawText(3, 83 + (13 * menu.inputLine), menu.input + (flash === 1 ? String.fromCharCode(179) : ""));
}


// Main Game Tick
// --------------
export function gameTick(time, client, renderer) {  
  client.pollIncomingPackets((packet) => {
    const packetId = packet.readNumber();

  
    switch (packetId) {
      case 2:

        break;
      default:
        break;
    }
  });

  // Handle Menu Navigation
  if (input.keys.down) {
    if (gameData.state === GameState.Map) {
      gameData.locationSelected = (gameData.locationSelected + 1) % worldGraph[gameData.currentLocation].length;
    } else {
      gameData.currentMenu.moveDown();
    }
  }

  if (input.keys.up) {
    if (gameData.state === GameState.Map) {
      gameData.locationSelected = (gameData.locationSelected + 1) % worldGraph[gameData.currentLocation].length;
    } else {
      gameData.currentMenu.moveUp();
    }
  }

  if (input.keys.enter) {
    if (gameData.state === GameState.Map) {
      const moveableLocations = worldGraph[gameData.currentLocation];
      gameData.currentLocation = moveableLocations[gameData.locationSelected]
      gameData.currentMenu = locationToMenu[gameData.currentLocation];
      gameData.locationSelected = 0;
      if (Math.random() > 100) {
        gameData.state = GameState.Combat;
      } else {
        gameData.state = GameState.Title;
      }
    } else {
      gameData.currentMenu.select(gameData);
    }
  }


  // Rendering
  renderer.fill("#000");

  switch (gameData.state) {
    case GameState.Title:
      drawMenu(renderer, time, gameData.currentMenu);
      break;

    case GameState.Map: {
      renderer.draw("map", 0, 0, 160, 160, 0, 0);
      const moveableLocations = worldGraph[gameData.currentLocation];
      
      // Character
      renderer.draw(
        "spritesheet",
        0, 9, 9, 9,
        LocationData[gameData.currentLocation].position[0],
        LocationData[gameData.currentLocation].position[1]
      );

  
      // Red Circle
      const selectedLocation = LocationData[moveableLocations[gameData.locationSelected]];
      renderer.draw(
        "spritesheet",
        0, 0, 9, 9,
        selectedLocation.position[0],
        selectedLocation.position[1]
      );
      break;
    }

    case GameState.Combat: {
      
    }

    default:
      break;
  }

  input.flush();
}



// Handle typing
addEventListener("keydown", (e) => {
  if (gameData.currentMenu.inputMode) {
    if (e.key.length === 1 && gameData.currentMenu.input.length < 17) {
      gameData.currentMenu.input += e.key;
    }
    if (e.key === "Backspace") {
      gameData.currentMenu.input = gameData.currentMenu.input.slice(0, -1);
    }
  }
});
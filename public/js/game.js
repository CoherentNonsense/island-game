import Client from "./client.js";
import { Enemy, EnemyData, enemyToId, idToEnemy } from "./enemy.js";
import { combatMenuBuilder, locationToMenu, startMenu, titleMenu } from "./menus.js";
import Packet from "./packet.js";
import { LocationData, Location, worldGraph, LocationToId, IdToLocation, enterLocation, leaveLocation, locations, whereIs } from "./world.js";

export const GameState = Object.freeze({
  Intro:      Symbol("intro"),
  Map:        Symbol("map"),
  Travel:     Symbol("travel"),
  Combat:     Symbol("combat"),
  Location:   Symbol("location")
});

const gameData = {
  isOffline: false,
  isHost: false,
  id: -1,
  hostId: "",
  client: new Client(),
  time: 0,

  state: GameState.Location,
  currentMenu: titleMenu,
  
  username: "",
  maxHealth: 15,
  health: 15,
  gold: 0,

  party: [],
  isPartyLeader: false,
  partyLeader: -1,
  partyPassword: "",
  // (Bad design) used to store password until we get accepted to party
  waitingPartyPassword: "",

  talkTutorial: true,
  mapTutorial: true,

  weather: "Summer",
  changeRequest: false,  

  lastCity: Location.CityLg,
  inLocation: false,
  currentLocation: null,
  locationSelected: 0,
  
  items: [{name: "Hands", damage: 3, speed: 5}],
  
  screenAnimStart: 0,
  screenAnimType: "",

  enemy: {},
  attackSelection: [],
  inCombat: false,
  attackTimer: 0,
  combatMenu: null,

  // Functions to be used elsewhere (halp this is noodles)
  enterCombat: (enemy) => enterCombat(enemy, 0),
};


setInterval(() => {
  gameData.changeRequest = true;
}, 1000 * 60 * 5);


// Helper Functions
// ----------------
function drawMenu(renderer, time, menu) {
  renderer.fillRect("#080808", 0, 80, 160, 80);

  menu.currentOptions().forEach((option, idx) => {
    const text = option.name
    let prefix = (text === "Talk" && menu.notification) ? "!" : " ";
    prefix = (text === "Leave" && gameData.partyPassword.length > 0 && !gameData.isPartyLeader) ? String.fromCharCode(42) : prefix;
    prefix = (idx === menu.index) ? ">" : prefix;
    renderer.drawText(83, 2 + (13 * idx), prefix + text);
  });

  menu.currentMessages().forEach((message, idx) => {
    renderer.drawText(3, 83 + (13 * idx), message);
  });

  menu.drawDisplay(renderer, time);

  if (!menu.inputMode) return;
  let flash = Math.floor(time * 0.002) % 2;
  if (menu.input.length === 17) flash = 0;
  renderer.drawText(3, 83 + (13 * menu.inputLine), menu.input + (flash === 1 ? String.fromCharCode(179) : ""));
}

function aOrAn(word) {
  const vowels = ["a", "e", "i", "o", "u"];

  if (vowels.includes(word[0])) {
    return `An ${word}`;
  } else {
    return `A ${word}`;
  }
}

function enterCombat(enemy, time) {
  if (gameData.isPartyLeader) {
    const packet = new Packet().writeNumber(13).writeNumber(gameData.id).writeNumber(enemyToId[enemy]);
    gameData.client.sendPacket(packet);
  }
  gameData.enemy = {...EnemyData[enemy]};
  gameData.enemy.maxHealth = gameData.enemy.health;
  const flavour = gameData.state === GameState.Map ? [aOrAn(gameData.enemy.name), "attacks on your", "way!"] : ["You attack the", gameData.enemy.name];
  const combatMenu = combatMenuBuilder(gameData, flavour);
  gameData.combatMenu = combatMenu;
  gameData.state = GameState.Combat;
  gameData.screenAnimStart = time;
  gameData.screenAnimType = "enemy";
  gameData.inCombat = true;
}

function drawScreenAnim(renderer, time) {
  switch (gameData.screenAnimType) {
    case "enemy": {
      const progress = (time - 250 - gameData.screenAnimStart) / 750;
      if (progress > 1) return;
      const rect1 = Math.max(Math.min(progress, 0.25), 0) / 0.25 * 80.1;
      const rect2 = Math.max(Math.min(progress - 0.25, 0.25), 0) / 0.25 * 80.1;
      const rect3 = Math.max(Math.min(progress - 0.5, 0.25), 0) / 0.25 * 80.1;
      const rect4 = Math.max(Math.min(progress - 0.75, .25), 0) / 0.25 * 80.1;
      renderer.fillRect("#b43", 80, rect1, 80.1, 80.1 - rect1);
      renderer.fillRect("#b43", 80, 80, 80.1 - rect2, 80.1);
      renderer.fillRect("#b43", 0, 80, 80.1, 80.1 - rect3);
      renderer.fillRect("#b43", rect4, 0, 80.1 - rect4, 80.1);
      break;
    }

    case "weather": {
      const progress = (time - 2000 - gameData.screenAnimStart) / 1000;
      if (progress > 1) return;
      const fade = Math.max(Math.min(progress, 1), 0) / 1;
      renderer.fillRect(`rgba(1.0, 1.0, 1.0, ${1 - fade})`, 0, 0, 160, 160);
      renderer.drawText(80 - (gameData.weather.length / 2 * 9), 71, gameData.weather);
    }

    case "intro": {
      const progress = (time - (45 / 0.005) - 1000 - gameData.screenAnimStart) / 1500;
      if (progress > 1) return;
      const brightness = (1 - (Math.max(Math.min(progress, 1), 0) / 1)) * 255;
      const alpha = progress < -1 ? 0 : 1;
      renderer.fillRect(`rgba(${brightness}, ${brightness}, ${brightness}, ${alpha})`, 0, 0, 80, 80);
    }

    default:
      break;
  }
}


// Main Game Tick
// --------------
export function gameTick(time, renderer, input) {
  gameData.time = time;

  // Handle Multiplayer
  gameData.client.pollIncomingPackets((packet) => {
    const packetId = packet.readNumber();
    console.log(packetId);
    switch (packetId) {
      case 1: { // Join Game
        if (gameData.isHost) {
          const returnPacket = new Packet().writeNumber(100);
          locations.forEach((location, id) => {
            LocationData[location].players.forEach((player) => {
              returnPacket.writeNumber(id).writeNumber(player);
            });
          });
          returnPacket.writeNumber(-1);
          gameData.client.sendPacket(returnPacket);
        }
        break;
      }

      // User entered location
      case 3: {
        const userId = packet.readNumber();
        const locationId = packet.readNumber();
        const location = IdToLocation[locationId];
        if (userId === gameData.partyLeader) {
          gameData.state = GameState.Location;
          gameData.currentLocation = location;
          gameData.currentMenu = locationToMenu[location];
        }
        enterLocation(userId, location);
        break;
      }

      // User left location
      case 4: {
        const userId = packet.readNumber();
        if (userId === gameData.partyLeader) {
          gameData.state = GameState.Map;
        }
        leaveLocation(userId);
        break;
      }

      // Talk
      case 5: {
        const userId = packet.readNumber();
        if (whereIs(userId) === gameData.currentLocation) {
          const text = packet.readString();
          gameData.currentMenu.talk(text);
        }
        break;
      }

      // Join party
      case 6: {
        const partyPassword = packet.readString();
        
        if (gameData.partyPassword === partyPassword) {
          const userId = packet.readNumber();
          if (whereIs(userId) !== gameData.currentLocation) break;
          if (userId > -1 && !gameData.party.includes(userId)) {
            if (gameData.isPartyLeader) {
              const returnPacket = new Packet().writeNumber(8).writeNumber(userId);
              gameData.party.forEach(member => returnPacket.writeNumber(member));
              returnPacket.writeNumber(-1);
              gameData.client.sendPacket(returnPacket);
            }
            gameData.party.push(userId);
          }
        }

        break;
      }

      // Make party
      case 7: {
        const partyPassword = packet.readString();

        if (gameData.partyPassword === partyPassword) {
          const partyExistsPacket = new Packet().writeNumber(11).writeString(partyPassword);
          gameData.client.sendPacket(partyExistsPacket);
        }
        break;
      }
      
      // Join party accepted
      case 8: {
        const userId = packet.readNumber();

        if (gameData.id === userId) {
          gameData.partyPassword = gameData.waitingPartyPassword;
          const leader = packet.readNumber();
          gameData.partyLeader = leader;
          gameData.party.push(leader);
          while (true) {
            const memberId = packet.readNumber();
            if (memberId === -1) break;
            gameData.party.push(memberId);
          }
          gameData.currentMenu.talk("Joined Party");
        }
        break;
      }
      
      // Leave party
      case 9: {
        const userId = packet.readNumber();
        gameData.party = gameData.party.filter(member => userId !== member);
        break;
      }
      

      // Assign party leader (when party leader leaves)
      case 10: {
        const partyPassword = packet.readString();
        if (partyPassword === gameData.partyPassword) {
          const userId = packet.readNumber();
          gameData.partyLeader = userId;
          if (userId === gameData.id) {
            gameData.isHost = true;
          }
        }
        break;
      }

      // Party password in use
      case 11: {
        const partyPassword = packet.readString();
        if (partyPassword === gameData.partyPassword) {
          gameData.currentMenu.talk("Password in use");
          gameData.currentMenu.talk("Try /join or make");
          gameData.currentMenu.talk("another");
          gameData.partyPassword = "";
          gameData.isPartyLeader = false;
          gameData.partyLeader = -1;
        }
        break;
      }

      // Party leader location selected
      case 12: {
        const leaderId = packet.readNumber();
        if (leaderId === gameData.partyLeader) {
          const selection = packet.readNumber();
          if (gameData.currentMenu.current === "talk") {
            gameData.currentMenu.select(gameData, gameData.currentMenu.root);
          }
          gameData.currentMenu.index = selection;
          gameData.currentMenu.select(gameData);
        }
        break;
      }

      // party enter combat
      case 13: {
        const leaderId = packet.readNumber();
        if (leaderId === gameData.partyLeader && !gameData.isPartyLeader) {
          const enemyId = packet.readNumber();
          const enemy = idToEnemy[enemyId];
          enterCombat(enemy, time);
        }
        break;
      }


      // Receive game data
      case 100: {
        while (true) {
          const locationId = packet.readNumber();
          if (locationId === -1) break;
          const userId = packet.readNumber();
          enterLocation(userId, IdToLocation[locationId]);
        }
        break;
      }

      // Game Ended
      case 200:
        gameData.currentLocation = null;
        gameData.currentMenu = titleMenu;
        break;

      // Host Id doesn't exist
      case 201:
        gameData.state = GameState.Location;
        gameData.currentMenu.select(gameData, "title");
        gameData.currentMenu.messages = ["That host ID", "doesn't exist"];
        break;

      // Player left
      case 202:
        console.log("player left");
        const userId = packet.readNumber();
        gameData.party = gameData.party.filter(member => userId !== member);
        leaveLocation(userId);
        break;

      // Receive userId
      case 203:
        gameData.id = packet.readNumber();
        gameData.party.unshift(gameData.id);
        console.log("Received User ID: " + gameData.id);
        break;
    
      // Host Id exists
      case 204:
        gameData.state = GameState.Location;
        gameData.currentMenu.select(gameData, "title");
        gameData.currentMenu.messages = ["That host ID", "already exists"];
        console.log("Received User ID: " + gameData.id);
        break;

      // Test
      case 50:
        console.log("AYY");
        break;

      default:
        break;
    }
  });

  // Intro
  if (gameData.state === GameState.Intro) {
    gameData.screenAnimType = "intro";
    renderer.fillRect("#000", 0, 0, 160, 160);
    renderer.drawAnim("intro", 0, 0, 80, 80, 0, 0, time - gameData.screenAnimStart, 0.005);
    drawScreenAnim(renderer, time);
    renderer.drawText(30, 106, "You have to");
    renderer.drawText(39, 119, "stop  him");  
    if (time - gameData.screenAnimStart > (45 / 0.005) + 2400) {
      gameData.state = GameState.Location;
      gameData.currentMenu = startMenu;
      gameData.currentMenu.messages = ["You snap awake", "unaware of your", "surroundings. Was", "that a dream?"];
    }
    return;
  }

  // Handle Input
  if (input.keys.down) {
    if (gameData.state === GameState.Map) {
      gameData.locationSelected = (gameData.locationSelected + 1) % worldGraph[gameData.currentLocation].length;
    } else if (gameData.state === GameState.Combat) {
      gameData.combatMenu.moveDown();
    } else {
      gameData.currentMenu.moveDown();
    }
  }

  if (input.keys.up) {
    if (gameData.state === GameState.Map) {
      gameData.locationSelected = (gameData.locationSelected - 1) % worldGraph[gameData.currentLocation].length;
      if (gameData.locationSelected < 0) {
        gameData.locationSelected += worldGraph[gameData.currentLocation].length;
      }
    } else if (gameData.state === GameState.Combat) {
      gameData.combatMenu.moveUp();
    } else {
      gameData.currentMenu.moveUp();
    }
  }

  if (input.keys.enter) {
    if (gameData.state === GameState.Map && (gameData.partyPassword.length === 0 || gameData.isPartyLeader)) {
      const moveableLocations = worldGraph[gameData.currentLocation];
      if (gameData.currentLocation === moveableLocations[gameData.locationSelected]) {
        gameData.locationSelected = 0;
        gameData.state = GameState.Location;
      } else {
        gameData.currentMenu.talking = [];
        gameData.currentLocation = moveableLocations[gameData.locationSelected]
        gameData.currentMenu = locationToMenu[gameData.currentLocation];
        gameData.locationSelected = 0;
        if (
          Math.random() < 0.5 &&
          gameData.currentLocation !== Location.Start &&
          gameData.currentLocation !== Location.Dummies &&
          gameData.currentLocation !== Location.TutPort
        ) {
          switch (gameData.currentLocation) {
            case Location.CrossRoad:
              enterCombat(Enemy.SandFlea, time);
              break;
            case Location.Statue:
              enterCombat(Enemy.SandFlea, time);
              break;
            default:
              enterCombat(Enemy.SandFlea, time);
          }
        } else {
          gameData.state = GameState.Location;
        }
      }
    } else if (gameData.state === GameState.Combat) {
      gameData.combatMenu.select(gameData);
    } else {
      if (gameData.isOffline || gameData.currentMenu.freeRoam || gameData.currentMenu.current === "talk" || gameData.currentMenu.currentOptions()[gameData.currentMenu.index].to === "talk") {
        gameData.currentMenu.select(gameData);
      } else if (gameData.isPartyLeader) {
        const selection = gameData.currentMenu.index;
        const packet = new Packet().writeNumber(12).writeNumber(gameData.id).writeNumber(selection);
        gameData.client.sendPacket(packet);
        gameData.currentMenu.select(gameData);
      }
    }
  }

  
  // Broadcast data
  if (!gameData.isOffline) {
    if (gameData.state === GameState.Map && gameData.inLocation) {
      gameData.inLocation = false;
      gameData.client.sendPacket(new Packet().writeNumber(4).writeNumber(gameData.id));
      leaveLocation(gameData.id);
    } else if (gameData.state === GameState.Location && gameData.inLocation === false && gameData.currentLocation !== null) {
      gameData.inLocation = true;
      gameData.client.sendPacket(new Packet().writeNumber(3).writeNumber(gameData.id).writeNumber(LocationToId[gameData.currentLocation]));
      enterLocation(gameData.id, gameData.currentLocation);
      gameData.currentMenu.reset();
    }
  }


  // Weather
  if (gameData.changeRequest) {
    gameData.changeRequest = false;
    if (gameData.state === GameState.Map) {
      gameData.screenAnimStart = time;
      gameData.screenAnimType = "weather";

      if (gameData.weather === "Summer") {
        gameData.weather = "Rainy";
      } else if (gameData.weather === "Rainy") {
        gameData.weather = "Winter";
      } else if (gameData.weather === "Winter") {
        gameData.weather = "Summer";
      }
    }
  }

  
  // Combat
  if (gameData.inCombat) {

    // Handle attacks when ready
    // -------------------------
    // attacks are filled in an array to handle parties
    if (gameData.attackSelection.length >= gameData.party.length) {
      // Add enemy attack to the list
      gameData.attackSelection.push({
        ...gameData.enemy,
        type: "enemy",
      });

      gameData.attackSelection.sort((a, b) => b.speed - a.speed);

      gameData.attackSelection.forEach((selection) => {
        if (gameData.enemy.health <= 0 || gameData.health <= 0) return;

        switch (selection.type) {
          case "enemy": {
            if (selection.attacks !== undefined) {
              const attack = selection.attacks[0];
              const damage = (attack.damage === 0) ? 0 : attack.damage + (Math.floor(Math.random() * 3) - 1);
              gameData.health -= damage;
              if (attack.flavour !== undefined) {
                attack.flavour.forEach(text => gameData.combatMenu.talk(text));
              } else {
                gameData.combatMenu.talk(`You took ${damage} dmg`);
              }
            } else {
              const damage = (selection.damage === 0) ? 0 : selection.damage + (Math.floor(Math.random() * 3) - 1);
              gameData.health -= damage;
              gameData.combatMenu.talk(`You took ${damage} dmg`);
            }
            break;
          }

          case "attack": {
            const damage = selection.damage + (Math.floor(Math.random() * 3) - 1);
      
            gameData.enemy.health -= damage;
            
            // Formatting
            const username = gameData.username === selection.username ? "You" : selection.username;
            if (username.length < 6) {
              gameData.combatMenu.talk(`${username} did ${damage} dmg`);
            } else {
              gameData.combatMenu.talk(selection.username);
              gameData.combatMenu.talk(`did ${damage} dmg`);
            }
            break;
          }

          default:
            break;
        }
      });

      gameData.combatMenu.select(gameData, "combat");

      gameData.attackSelection = [];
    }

    // When Enemy is xp
    if (gameData.enemy.health <= 0) {
      gameData.enemy.health = 0;
      gameData.inCombat = false;
      gameData.gold += gameData.enemy.gold;
      gameData.combatMenu.select(gameData, "win");
    } else if (gameData.health <= 0) {
      gameData.health = 0;
      gameData.inCombat = false;
      gameData.gold = 0;
      gameData.combatMenu.select(gameData, "lose");
    }
  }


  // Rendering
  renderer.fill("#000");

  switch (gameData.state) {
    case GameState.Location:
      drawMenu(renderer, time, gameData.currentMenu);
      break;
      
      case GameState.Combat:
        drawMenu(renderer, time, gameData.combatMenu);
        renderer.fillRect("#111", 0, 0, 80, 10);
        renderer.fillRect("#f00", 1, 1, (gameData.enemy.health / gameData.enemy.maxHealth) * 78, 8);
        renderer.drawText(1, 0, `${gameData.enemy.health}/${gameData.enemy.maxHealth}`);
        
        renderer.fillRect("#111", 0, 70, 80, 10);
        renderer.fillRect("#16C604", 1, 71, (gameData.health / gameData.maxHealth) * 78, 8);
        renderer.drawText(1, 70, `${gameData.health}/${gameData.maxHealth}`);
        drawScreenAnim(renderer, time);
      break;

    case GameState.Map: {
      // Tutorial
      if (gameData.mapTutorial) {
        gameData.mapTutorial = false;
        // Wait for map to render :\
        setTimeout(() => {
          alert("-- Epic Tutorial Below --\nThat impossible to see guy at the bottom left is you.\nThe red circle is where you want to go. Use Up/Down arrows to move it around and push enter when you are ready.\n\nP.S. Bunch of information added to the itch.io page that I couldn't tutorialise");
        }, 50);
      }

      renderer.drawAnim("map_base", 0, 0, 160, 160, 0, 0, time, 0.0005);
      renderer.drawAnim("map_deco", 0, 0, 160, 160, 0, 0, time, 0.005);

      if (gameData.weather === "Summer") {
        renderer.drawAnim("map_river", 0, 0, 160, 160, 0, 0, time, 0.004);
      } else if (gameData.weather === "Rainy") {
        renderer.draw("map_snow", 0, 0, 160, 160, 0, 0);
        renderer.drawAnim("map_river", 0, 0, 160, 160, 0, 0, time, 0.004);
        renderer.drawAnim("map_rain", 0, 0, 160, 160, 0, 0, time, 0.0005);
      } else if (gameData.weather === "Winter") {
        renderer.draw("map_mtnsnow", 0, 0, 160, 160, 0, 0);
        renderer.draw("map_snow", 0, 0, 160, 160, 0, 0);
        renderer.draw("map_ice", 0, 0, 160, 160, 0, 0);
      }
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

      // Anim
      drawScreenAnim(renderer, time);
      break;
    }

    default:
      break;
  }

  input.flush();
}


// Handle typing
addEventListener("keydown", (e) => {
  let menu = gameData.state === GameState.Combat ? gameData.combatMenu : gameData.currentMenu;

  if (menu.inputMode) {
    if (e.key.length === 1 && menu.input.length < 17) {
      menu.input += e.key;
    }
    if (e.key === "Backspace") {
      menu.input = menu.input.slice(0, -1);
    }
  }
});
/**
 * The main content of the game
 */

import { GameState } from "./game.js";
import { Location } from "./world.js";
import { Option, SubMenu, Menu } from "./menu.js";
import { Enemy } from "./enemy.js";
import Packet from "./packet.js";

export const titleMenu = new Menu({
  
  title: new SubMenu([
    new Option("Offline", "username", game => game.isOffline = true),
    new Option("Host", "host"),
    new Option("Join", "join"),
    new Option("Credits", "credits")
  ], {
    message: ["Controls", "Up/Down Arrows", "Enter"],
  }),

  host: new SubMenu([
    new Option("Create", "username", game => {
      const hostId = game.currentMenu.input.trim();
      if (hostId.length === 0) {
        game.currentMenu.pushMessage("Please enter a");
        game.currentMenu.pushMessage("host ID");
        return false;
      }
      game.isHost = true;
      game.hostId = hostId;
    }),
    new Option("Back", "title")
  ], {
    message: ["Create Host ID", "for others to", "join"],
    inputMode: true
  }),

  join: new SubMenu([
    new Option("Join", "username", game => {
      const hostId = game.currentMenu.input.trim();
      if (hostId.length === 0) {
        game.currentMenu.pushMessage("Please enter a");
        game.currentMenu.pushMessage("host ID");
        return false;
      }
      game.isHost = false;
      game.hostId = hostId;
    }),
    new Option("Back", "title"),
  ], {
    message: ["Join Host ID", "Main Server: \"0\""],
    inputMode: true
  }),

  username: new SubMenu([
    new Option("Enter", "", async game => {
      const username = game.currentMenu.input.trim();
      if (username.length === 0) {
        game.currentMenu.pushMessage("Please enter a");
        game.currentMenu.pushMessage("username");
        return;
      }
      game.username = username;

      // Connect
      if (!game.isOffline) {
        await game.client.start("ws://localhost:8080");
        let packet = new Packet();
        if (game.isHost) {
          packet.writeNumber(0).writeString(game.hostId);
        } else {
          packet.writeNumber(1).writeString(game.hostId);
        }
        game.client.sendPacket(packet);
      } else {
        game.party = [0];
      }
      
      // Start Intro
      game.state = GameState.Intro;
      game.currentLocation = Location.Start;
      game.screenAnimStart = game.time;
    }),
    new Option("Back", "title")
  ], {
    message: ["Enter username"],
    inputMode: true
  }),

  credits: new SubMenu([
    new Option("Back", "title"),
  ], {
    message: ["Made by:", "CoherentNonsense", "", "", "Font:", "Taffer"]
  })

}, { anim: "title", disableTalk: true } );


// Combat
// ------
// A unique menu is built for each encounter
export const combatMenuBuilder = (game, flavourText) => {
  const itemOptions = [];

  game.items.forEach(item => {
    itemOptions.push(new Option(item.name, "wait", () => {
      game.attackSelection.push({
        ...item,
        username: game.username,
        type: "attack",
      });
    }));
  });

  itemOptions.push(new Option("Back", "combat"));
  
  const menu = new Menu({
    
    combat: new SubMenu([
      new Option("Attack", "attack")
    ]),

    attack: new SubMenu(itemOptions, { dontClearMessages: true }),

    wait: new SubMenu([], { message: ["Waiting..."] }),
    
    win: new SubMenu([
      new Option("Cont.", "", game => game.state = GameState.Location)
    ], {
      message: ["", "You Win!", `You gained ${game.enemy.gold}g`]
    })

  }, {
    img: game.enemy.name.replace(" ", "_"),
    talkingMode: true
  });

  flavourText.forEach(text => {menu.talk(text)});

  return menu;
};


// Location Menus
// --------------
// Start
export const startMenu = new Menu({
  
  start: new SubMenu([
    new Option("Look", "look"),
    new Option("Leave", "leave"),
  ], {
    message: ["You stand at the", "tip of an island"]
  }),

  look: new SubMenu([
    new Option("Next", "start")
  ], {
    message: ["temporary words"]
  })

}, { location: Location.Start });

// Dummies
export const dummiesMenu = new Menu({
  
  dummies: new SubMenu([
    new Option("Fight", "", game => game.enterCombat(Enemy.Dummy)),
    new Option("Leave", "leave"),
  ], {
    message: ["A pair of", "fighting dummies", "are loosely held", "in the sand"]
  }),

}, { location: Location.Dummies });

// TutPort
export const tutPortMenu = new Menu({
  
  tutPort: new SubMenu([
    new Option("Boat", "boat"),
    new Option("Leave", "leave"),
  ], {
    message: ["A port with some", "boats docked.", "How convenient", "You can see a", "city across the", "water"]
  }),

  boat: new SubMenu([
    new Option("Go", "", game => { game.currentMenu = cityLgMenu; game.currentLocation = Location.CityLg; }),
    new Option("Stay", "tutPort")
  ], {
    message: ["Are you sure?", "You wont be able", "to return here"]
  })

}, { location: Location.TutPort, freeRoam: false });

// CityLg
export const cityLgMenu = new Menu({
  
  cityLg: new SubMenu([
    new Option("Items", "items"),
    new Option("Leave", "leave"),
  ], {
    message: ["A bussling city", "with many stores"]
  }),

  items: new SubMenu([
    new Option("Apple", "apple"),
    new Option("Back", "cityLg")
  ]),

  apple: new SubMenu([
    new Option("Buy 2g", "", game => { game.currentMenu.pushMessage("Can't afford"), game.currentMenu.pushMessage(`You have ${game.gold}g`)}),
    new Option("Back", "items")
  ], {
    message: ["A shiny red", "apple.", "Restores 3 health"]
  })

}, { location: Location.CityLg });


// Crossroad
export const crossRoadMenu = new Menu({
  
  crossroads: new SubMenu([
    new Option("Leave", "leave"),
  ], {
    message: ["A fork in the", "road"]
  }),

}, { location: Location.CrossRoad });


// Statue
export const statueMenu = new Menu({
  
  statue: new SubMenu([
    new Option("Leave", "leave"),
  ], {
    message: ["a statue"]
  }),

}, { location: Location.Statue });


export const locationToMenu = {
  [Location.Start]: startMenu,
  [Location.Dummies]: dummiesMenu,
  [Location.TutPort]: tutPortMenu,
  [Location.CityLg]: cityLgMenu,
  [Location.CrossRoad]: crossRoadMenu,
  [Location.Trees]: crossRoadMenu,
  [Location.Statue]: statueMenu,
  [Location.CityMd]: crossRoadMenu,
};

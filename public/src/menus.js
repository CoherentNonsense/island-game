/**
 * The main content of the game
 */

import { GameState } from "./game.js";
import { enterLocation, leaveLocation, Location, LocationToId } from "./world.js";
import { Option, SubMenu, Menu } from "./menu.js";
import { Enemy } from "./enemy.js";
import Packet from "./packet.js";
import { Weapon, WeaponData, WeaponToId } from "./weapon.js";

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

  const items = [...game.items];
  if (items.length === 0) {
    items.push(Weapon.Hands);
  }
  items.forEach(item => {
    const weapon = WeaponData[item];
    itemOptions.push(new Option(weapon.name, "wait", () => {
      let damage = weapon.damage + (Math.floor(Math.random() * 3) - 1);
      game.attackSelection.push({
        ...weapon,
        damage,
        username: game.username,
        type: "attack",
      });
      const packet = new Packet().writeNumber(14).writeNumber(game.partyLeader).writeString(game.username).writeNumber(WeaponToId[item]).writeNumber(damage);
      game.client.sendPacket(packet);
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
    }),

    lose: new SubMenu([
      new Option("Cont.", "", game => {
        game.state = GameState.Location;
        game.currentLocation = game.lastCity;
        game.currentMenu = locationToMenu[game.currentLocation];
        if (game.deathTutorial) {
          alert("-- Epic Tutorial Below --\When you die, you will respawn at the last town you visited. You keep everything but your gold.\n\nP.S. Bunch of information added to the itch.io page that I couldn't tutorialise");
          game.deathTutorial = false;
        }
        game.gold = 0;
      })
    ], {
      message: ["", "You Died ):", `Lost ${game.gold}g`]
    })

  }, {
    img: game.enemy.name.replace(" ", "_"),
    talkingMode: true
  });

  flavourText.forEach(text => {menu.talk(text)});

  return menu;
};


// Buy Item
function buyItem(game, item) {
  const weapon = WeaponData[item];
  if (weapon.price > game.gold) {
    game.currentMenu.messages = ["Can't afford"];
    game.currentMenu.pushMessage(`You have ${game.gold}g`);
  } else if (game.items.length > 4) {
    game.currentMenu.messages = ["Too many items"];
    game.currentMenu.pushMessage("Remove one first");
    game.currentMenu.pushMessage("(Go to stats)");
  } else {
    game.currentMenu.messages = ["Bought"];
    game.gold -= weapon.price;
    game.items.push(item);
  }
}

// Location Menus
// --------------
// Start
export const startMenu = new Menu({
  
  start: new SubMenu([
    new Option("Leave", "leave"),
  ], {
    message: ["You stand at the", "tip of an island"]
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
    new Option("Go", "", game => {
      
      game.currentMenu = cityLgMenu;
      game.currentLocation = Location.CityLg;
      game.client.sendPacket(new Packet().writeNumber(4).writeNumber(game.id));
      leaveLocation(game.id);
      game.client.sendPacket(new Packet().writeNumber(3).writeNumber(game.id).writeNumber(LocationToId[game.currentLocation]));
      enterLocation(game.id, game.currentLocation);
      game.currentMenu.reset();

    }),
    new Option("Stay", "tutPort")
  ], {
    message: ["Are you sure?", "You wont be able", "to return here"]
  })

}, { location: Location.TutPort, freeRoam: false });

// CityLg
export const cityLgMenu = new Menu({
  
  cityLg: new SubMenu([
    new Option("Alley", "alley"),
    new Option("Leave", "leave"),
  ], {
    message: ["Massive buildings", "tower over you.", "This seems like", "a large city", "yet the streets", "are empty"]
  }),

  alley: new SubMenu([
    new Option("Weapons", "weapons"),
    new Option("Food", "food"),
    new Option("Back", "cityLg")
  ], {
    message: ["Many vendors fill", "the cracks within", "the buildings", "passing out goods", "from the shadows"]
  }),

  weapons: new SubMenu([
    new Option("Spear", "spear"),
    new Option("I.Sword", "ice_sword"),
    new Option("I.Breth", "ice_breath"),
    new Option("Back", "alley"),
  ]),

  food: new SubMenu([
    new Option("I.Cream", "ice_cream"),
    new Option("Heart", "heart"),
    new Option("Mx.Heal", "max_heal"),
  ]),

  spear: new SubMenu([
    new Option(`Buy ${WeaponData[Weapon.Spear].price}g`, "weapons", game => buyItem(game, Weapon.Spear)),
    new Option(`Back`, "weapons")
  ], {
    message: WeaponData[Weapon.Spear].desc
  }),

  ice_sword: new SubMenu([
    new Option(`Buy ${WeaponData[Weapon.IceSword].price}g`, "weapons", game => buyItem(game, Weapon.IceSword)),
    new Option(`Back`, "weapons")
  ], {
    message: WeaponData[Weapon.IceSword].desc
  }),

  ice_breath: new SubMenu([
    new Option(`Buy ${WeaponData[Weapon.IceBreath].price}g`, "weapons", game => buyItem(game, Weapon.IceBreath)),
    new Option(`Back`, "weapons")
  ], {
    message: WeaponData[Weapon.IceBreath].desc
  }),

  ice_cream: new SubMenu([
    new Option(`Buy ${WeaponData[Weapon.IceCream].price}g`, "food", game => buyItem(game, Weapon.IceCream)),
    new Option(`Back`, "food")
  ], {
    message: WeaponData[Weapon.IceCream].desc
  }),

  heart: new SubMenu([
    new Option(`Buy ${WeaponData[Weapon.Heart].price}g`, "food", game => buyItem(game, Weapon.Heart)),
    new Option(`Back`, "food")
  ], {
    message: WeaponData[Weapon.Heart].desc
  }),

  max_heal: new SubMenu([
    new Option(`Buy ${WeaponData[Weapon.MaxHeal].price}g`, "food", game => buyItem(game, Weapon.MaxHeal)),
    new Option(`Back`, "food")
  ], {
    message: WeaponData[Weapon.MaxHeal].desc
  }),

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
    message: ["A statue stands", "proudly on its", "marble slab"]
  }),

}, { location: Location.Statue });

// Trees
export const treesMenu = new Menu({
  
  trees: new SubMenu([
    new Option("Leave", "leave"),
  ], {
    message: ["A patch of trees", "scattered in", "the grass"]
  }),

}, { location: Location.Trees });

// CityMd
export const cityMdMenu = new Menu({
  
  cityMd: new SubMenu([
    new Option("Leave", "leave"),
  ], {
    message: ["A statue stands", "proudly on its", "marble slab"]
  }),

}, { location: Location.CityMd });


// CitySm
export const citySmMenu = new Menu({
  
  citySm: new SubMenu([
    new Option("Leave", "leave"),
  ], {
    message: ["Sorry:", "Closed for time"]
  }),

}, { location: Location.CitySm });

// Grasslands
export const grasslandsMenu = new Menu({
  
  grasslands: new SubMenu([
    new Option("Leave", "leave"),
  ], {
    message: ["Hills of grass", "as far as one can", "see"]
  }),

}, { location: Location.Grasslands });

// Campfire
export const campfireMenu = new Menu({
  
  campfire: new SubMenu([
    new Option("Leave", "leave"),
  ], {
    message: ["Some logs sit", "around a burning", "campfire"]
  }),

}, { location: Location.Campfire });

// Cave
export const caveMenu = new Menu({
  
  cave: new SubMenu([
    new Option("Leave", "leave"),
  ], {
    message: ["Sorry:", "Closed for time"]
  }),

}, { location: Location.Cave });

// ForestS
export const forestSMenu = new Menu({
  
  forestS: new SubMenu([
    new Option("Leave", "leave"),
  ], {
    message: ["Sorry:", "Closed for time"]
  }),

}, { location: Location.ForestS });

// ForestN
export const forestNMenu = new Menu({
  
  forestN: new SubMenu([
    new Option("Leave", "leave"),
  ], {
    message: ["Sorry:", "Closed for time"]
  }),

}, { location: Location.ForestN });

// dungeon
export const dungeonMenu = new Menu({
  
  dungeon: new SubMenu([
    new Option("Leave", "leave"),
  ], {
    message: ["Sorry:", "Closed for time"]
  }),

}, { location: Location.Dungeon });

// TundraS
export const tundraSMenu = new Menu({
  
  tundras: new SubMenu([
    new Option("Leave", "leave"),
  ], {
    message: ["Sorry:", "Closed for time"]
  }),

}, { location: Location.TundraS });

// TundraN
export const tundraNMenu = new Menu({
  
  tundran: new SubMenu([
    new Option("Leave", "leave"),
  ], {
    message: ["Sorry:", "Closed for time"]
  }),

}, { location: Location.TundraN });

// Ice
export const iceMenu = new Menu({
  
  ice: new SubMenu([
    new Option("Leave", "leave"),
  ], {
    message: ["Sorry:", "Closed for time"]
  }),

}, { location: Location.Ice });

// Tower
export const towerMenu = new Menu({
  
  tower: new SubMenu([
    new Option("Leave", "leave"),
  ], {
    message: ["Sorry:", "Closed for time"]
  }),

}, { location: Location.Tower });




export const locationToMenu = {
  [Location.Start]: startMenu,
  [Location.Dummies]: dummiesMenu,
  [Location.TutPort]: tutPortMenu,
  [Location.CityLg]: cityLgMenu,
  [Location.CrossRoad]: crossRoadMenu,
  [Location.Trees]: crossRoadMenu,
  [Location.Statue]: statueMenu,
  [Location.CityMd]: cityMdMenu,
  [Location.CitySm]: citySmMenu,
  [Location.ForestN]: forestNMenu,
  [Location.ForestS]: forestSMenu,
  [Location.Grasslands]: grasslandsMenu,
  [Location.TundraN]: tundraNMenu,
  [Location.TundraS]: tundraSMenu,
  [Location.Campfire]: campfireMenu,
  [Location.Cave]: caveMenu,
  [Location.Dungeon]: dungeonMenu,
  [Location.Ice]: iceMenu,
  [Location.Tower]: towerMenu,
};

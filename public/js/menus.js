/**
 * The main content of the game excluding combat
 */

import { GameState } from "./game.js";
import { Location } from "./world.js";
import { Option, SubMenu, Menu } from "./menu.js";

export const titleMenu = new Menu({
  
  title: new SubMenu([
    new Option("Host", "host"),
    new Option("Join", "join"),
    new Option("Credits", "credits")
  ], {
    message: ["Controls", "Up/Down Arrows", "Enter"],
  }),

  host: new SubMenu([
    new Option("Create", "username", game => game.isHost = true),
    new Option("Back", "title")
  ], {
    message: ["Create Host ID", "", "", "Keep private for", "singleplayer"],
    inputMode: true,
    inputLine: 1
  }),

  join: new SubMenu([
    new Option("Join", "username", game => game.isHost = false),
    new Option("Back", "title"),
  ], {
    message: ["Join Host ID", "Main Server: \"0\""],
    inputMode: true
  }),

  username: new SubMenu([
    new Option("Enter", "", game => { game.username = game.currentMenu.input; game.currentMenu = startMenu })
  ], { inputMode: true }),

  credits: new SubMenu([
    new Option("Back", "title"),
  ], {
    message: ["Made by:", "CoherentNonsense", "", "", "Font:", "Taffer"]
  })

}, { anim: "title", disableTalk: true } );


export const combatMenuBuilder = (game, flavourText) => {
  const combatData = { gold: 5 };

  const itemOptions = [];

  game.items.forEach(item => {
    itemOptions.push(new Option(item.name, "combat", () => {
      game.enemy.health -= item.damage;
      game.combatMenu.talk(`You did ${item.damage} dmg`); 

      if (game.enemy.health <= 0) {
        return "win";
      }
    }));
  });
  
  const menu = new Menu({
    
    combat: new SubMenu([
      new Option("Item", "item")
    ]),

    item: new SubMenu(itemOptions, { dontClearMessages: true }),
    
    win: new SubMenu([
      new Option("Cont.", "", game => game.state = GameState.Location)
    ], {
      message: [`You gained ${combatData.gold}g`]
    })

  }, { talkingMode: true });

  menu.talk(flavourText);

  return menu;
};


// Location Menus
// --------------
export const startMenu = new Menu({
  
  start: new SubMenu([
    new Option("Look", "look"),
    new Option("Leave", "", game => game.state = GameState.Map),
  ], {
    message: ["You stand at the", "tip of an island"]
  }),

  look: new SubMenu([
    new Option("Next", "start")
  ], {
    message: ["temporary words"]
  })

}, { img: "start" });

export const dummiesMenu = new Menu({
  
  dummies: new SubMenu([
    new Option("Fight", "dummies"),
    new Option("Leave", "", game => game.state = GameState.Map),
  ], {
    message: ["A pair of", "fighting dummies", "are loosely held", "in the sand"]
  }),

}, { img: "dummies" });

export const tutPortMenu = new Menu({
  
  tutPort: new SubMenu([
    new Option("Leave", "", game => game.state = GameState.Map),
  ], {
    message: ["A port with some", "boats docked.", "How convenient"]
  }),

}, { img: "dummies" });

export const cityLgMenu = new Menu({
  
  cityLg: new SubMenu([
    new Option("Items", "items"),
    new Option("Leave", "", game => game.state = GameState.Map),
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

}, { img: "dummies" });

export const crossRoadMenu = new Menu({
  
  tutPort: new SubMenu([
    new Option("Leave", "", game => game.state = GameState.Map),
  ], {
    message: ["A fork in the", "road"]
  }),

}, { img: "dummies" });


export const locationToMenu = {
  [Location.Start]: startMenu,
  [Location.Dummies]: dummiesMenu,
  [Location.TutPort]: tutPortMenu,
  [Location.CityLg]: cityLgMenu,
  [Location.CrossRoad]: crossRoadMenu,
  [Location.Trees]: crossRoadMenu,
  [Location.Statue]: crossRoadMenu,
  [Location.CityMd]: crossRoadMenu,
};

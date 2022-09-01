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
    new Option("Create", "title", game => game.currentMenu = startMenu),
    new Option("Back", "title")
  ], {
    message: ["Create Host ID", "", "", "Keep private for", "singleplayer"],
    inputMode: true,
    inputLine: 1
  }),

  join: new SubMenu([
    new Option("Join", "title"),
    new Option("Back", "title"),
  ], {
    message: ["Join Host ID", "Main Server: \"0\""],
    inputMode: true
  }),

  credits: new SubMenu([
    new Option("Back", "title"),
  ], {
    message: ["Made by:", "CoherentNonsense", "", "", "Font:", "Taffer"]
  })

}, { anim: "title"} );


// Location Menus
// --------------
export const startMenu = new Menu({
  
  start: new SubMenu([
    new Option("Look", "look"),
    new Option("Leave", "start", game => game.state = GameState.Map),
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
    new Option("Leave", "dummies", game => game.state = GameState.Map),
  ], {
    message: ["A pair of", "fighting dummies", "are loosely held", "in the sand"]
  }),

}, { img: "dummies" });

export const tutPortMenu = new Menu({
  
  tutPort: new SubMenu([
    new Option("Leave", "tutPort", game => game.state = GameState.Map),
  ], {
    message: ["A port with some", "boats docked.", "How convenient"]
  }),

}, { img: "dummies" });

export const locationToMenu = {
  [Location.Start]: startMenu,
  [Location.Dummies]: dummiesMenu,
  [Location.TutPort]: tutPortMenu,
};

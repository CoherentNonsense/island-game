import { GameState } from "./game.js";
import Packet from "./packet.js";
import { IdToWeapon, WeaponData } from "./weapon.js";
import { LocationData } from "./world.js";

export class Option {
  constructor(name, to, onclick = () => {}) {
    this.name = name;
    this.to = to;
    this.onclick = onclick;
  }
}

export class SubMenu {
  constructor(options, config = {}) {
    this.options = options;
    this.message = config.message || [];
    this.inputMode = config.inputMode || false;
    this.inputLine = config.inputLine || 5;
    this.dontClearMessages = config.dontClearMessages || false;
  }
}

export class Menu {
  constructor(submenus, config = {}) {
    this.submenus = submenus;
    this.index = 0;
    this.root = Object.keys(this.submenus)[0];
    this.current = this.root;
    this.messages = [...this.submenus[this.current].message];
    this.inputMode = false;
    this.inputLine = 0;
    this.input = "";
    this.notification = false;
    this.talking = [];
    this.defaultImg = config.img || this.current.toLowerCase();
    this.defaultAnim = config.anim;
    this.defaultAnimSpeed = config.animSpeed || 0.003;
    this.talkingMode = config.talkingMode || false;
    this.location = config.location;
    this.freeRoam = config.freeRoam === undefined ? true : config.freeRoam;

    this.currentCommand = "";

    // Add stats option
    const statOption = new Option("Stats", "stats");
    this.submenus["stats"] = new SubMenu([
      new Option("Player", "", game => {
        this.messages = [`Hp: ${game.health}/${game.maxHealth}`];
        this.pushMessage(`Gold: ${game.gold}`);
      }),
      new Option("Equip", "equip", game => {
        this.messages = ["Weapons:"];
        game.items.forEach((weapon) => {
          this.pushMessage(WeaponData[weapon].name);
        });
      }),
      new Option("Back", this.root)
    ]);
    this.submenus["equip"] = new SubMenu([
      new Option("Use", "use"),
      new Option("Delete", "delete"),
      new Option("Back", "stats")
    ], { dontClearMessages: true });
    this.submenus["use"] = new SubMenu([
      new Option("Use 1", "stats", game => game.items[0].use(game)),
      new Option("Use 2", "stats", game => game.items[1].use(game)),
      new Option("Use 3", "stats", game => game.items[2].use(game)),
      new Option("Use 4", "stats", game => game.items[3].use(game)),
      new Option("Back", "equip"),
    ], { dontClearMessages: true });
    this.submenus["delete"] = new SubMenu([
      new Option("Del 1", "stats", game => game.items.splice(0, 1)),
      new Option("Del 2", "stats", game => game.items.splice(1, 1)),
      new Option("Del 3", "stats", game => game.items.splice(2, 1)),
      new Option("Del 4", "stats", game => game.items.splice(3, 1)),
      new Option("Back", "equip"),
    ], { dontClearMessages: true });

    if (this.current !== "combat" && this.current !== "title") {
      this.submenus[this.current].options.splice(this.submenus[this.current].options.length - 1, 0, statOption);
    }

    // Add talk option
    if (!config.disableTalk) {
      const option = new Option("Talk", "talk", game => {
        if (game.talkTutorial) {
          game.talkTutorial = false;
          this.talk("/help for info");
        }
        this.notification = false;
      });
      if (this.current === "combat") {
        this.submenus[this.current].options.push(option);
      } else {
        this.submenus[this.current].options.splice(this.submenus[this.current].options.length - 1, 0, option);
      }
      this.submenus["talk"] = new SubMenu([
        new Option("Speak", "", game => {
          const message = this.input.trimEnd();
          if (message.startsWith("/")) {
            const commands = message.split(" ");
            this.currentCommand = commands[0];
            this.talk("");
            // Handle Commands
            switch (commands[0]) {
              case "/help":
                if (!commands[1]) {
                  this.talk(String.fromCharCode(218) + "Commands" + String.fromCharCode(191))
                  this.talk("/what (is this?)");
                  this.talk("/help party");
                  this.talk("/help talk");
                } else if (commands[1] === "party") {
                  this.talk(String.fromCharCode(218) + "Make a party" + String.fromCharCode(191));
                  this.talk("/make [password]");
                  this.talk(String.fromCharCode(218) + "Join a party" + String.fromCharCode(191));
                  this.talk("/join [password]");
                  this.talk("/next (next page)");
                } else if (commands[1] === "talk") {
                  this.talk(String.fromCharCode(218) + "Global Chat" + String.fromCharCode(191));
                  this.talk("unimplemented");
                }
                break;

              case "/what":
                this.talk("This screen lets");
                this.talk("you to talk to");
                this.talk("people nearby or");
                this.talk("enter commands");
                break;
                              
              case "/next":
                this.talk(String.fromCharCode(218) + "Leave party" + String.fromCharCode(191));
                this.talk("/leave");
                this.talk(String.fromCharCode(218) + "List members" + String.fromCharCode(191));
                this.talk("/list");
                break;

              case "/make": {
                if (game.partyPassword.length > 0) { this.talk("/leave current"); this.talk("party first"); break; }
                if (!commands[1]) { this.talk("Enter a password"); break; }
                game.partyPassword = commands[1];
                game.isPartyLeader = true;
                game.partyLeader = game.id;
                game.individualMaxHealth = game.maxHealth;
                game.individualHealth = game.health;
                this.talk("Party Password:");
                this.talk(game.partyPassword);
                const packet = new Packet().writeNumber(7).writeString(game.partyPassword);
                game.client.sendPacket(packet);
                break;
              }

              case "/join": {
                if (game.partyPassword.length > 0) { this.talk("/leave current"); this.talk("party first"); break; }
                if (!commands[1]) { this.talk("Enter a password"); break; }
                const packet = new Packet().writeNumber(6).writeString(commands[1]).writeNumber(game.id).writeNumber(game.maxHealth).writeNumber(game.health);
                game.client.sendPacket(packet);
                game.waitingPartyPassword = commands[1];
                this.talk("Joining...");
                break;
              }
              
              case "/leave": {
                if (game.partyPassword.length === 0) { this.talk("You are not in a"); this.talk("party"); break; }
                if (game.isPartyLeader && game.party.length > 1) {
                  game.isPartyLeader = false;
                  const assignLeaderPacket = new Packet().writeNumber(10).writeNumber(game.id).writeNumber(game.party[1]);
                  game.client.sendPacket(assignLeaderPacket);
                }
                const packet = new Packet().writeNumber(9).writeNumber(game.id).writeNumber(game.individualMaxHealth).writeNumber(game.individualHealth);
                game.client.sendPacket(packet);
                game.partyPassword = "";
                game.waitingPartyPassword = "";
                game.party = [game.id];
                const healthFrac = game.health / game.maxHealth;
                const lostHealth = Math.ceil(healthFrac * game.individualMaxHealth);      
                game.maxHealth = game.individualMaxHealth;
                game.health = lostHealth;
                this.talk("Left party");
                break;
              }

              case "/list":
                this.talk(String.fromCharCode(218) + "Members (IDS)" + String.fromCharCode(191));
                const membersToList = Math.min(4, game.party.length);
                for (let i = 0; i < membersToList; ++i) {
                  this.talk("" + game.party[i]);
                }
                break;
              
              default:
                this.talk("Invalid command");
            }
          } else if (message.length > 0) {
            if (!game.isOffline) {
              game.client.sendPacket(new Packet().writeNumber(5).writeNumber(game.id).writeString(message));
            }
            this.talk(message);
          }
          this.input = "";
        }),
        new Option("Back", this.current)
      ], { inputMode: true });
    }
  }

  currentOptions() {
    return this.submenus[this.current].options;
  }

  currentMessages() {
    if (this.talkingMode || this.current === "talk") {
      return this.talking;
    }

    return this.messages;
  }

  reset() {
    this.current = this.root;
    this.messages = [...this.submenus[this.current].message];
  }

  moveUp() {
    if (this.index > 0) {
      this.index -= 1;
    }
  }

  moveDown() {
    if (this.index < this.currentOptions().length - 1) {
      this.index += 1;
    }
  }

  talk(message) {
    if (this.current !== "talk" && this.root !== "combat") this.notification = true;
    this.talking.push(message);
    if (this.talking.length > 5) {
      this.talking.splice(0, 1);
    }
  }

  pushMessage(message) {
    this.messages.push(message);
    if (this.messages.length > 5) {
      this.messages.splice(0, 1);
    }
  }

  select(gameData, submenuId = undefined) {

    
    if (!submenuId) {
      const option = this.currentOptions()[this.index];
      if (option.onclick(gameData) === false) return;
      if (option.to === "") return;
      if (option.to === "leave") {
        if (gameData.partyPassword.length > 0 && !gameData.isPartyLeader) {
          // Can't leave if not party leader
          this.pushMessage("Wait for party");
          this.pushMessage("leader");
        } else {
          gameData.state = GameState.Map;
        }
        return;
      }
      this.current = option.to;
    } else {
      this.current = submenuId;
    }

    // reset data
    this.index = 0;
    this.input = "";
        
    // submenu data
    const submenu = this.submenus[this.current];
    if (!submenu.dontClearMessages) {
      this.messages = [...submenu.message];
    }

    if (this.talkingMode) {
      submenu.message.forEach(text => this.talk(text));
    }

    this.inputMode = submenu.inputMode;
    this.inputLine = submenu.inputLine;
  }

  drawDisplay(renderer, time) {
    if (this.defaultAnim) {
      renderer.drawAnim(this.defaultAnim, 0, 0, 80, 80, 0, 0, time, this.defaultAnimSpeed);
    } else if (this.defaultImg) {
      renderer.draw(this.defaultImg, 0, 0, 80, 80, 0, 0);
    }

    if (this.location) {
      if (LocationData[this.location].players.length > 1 && !this.submenus[this.current].img) {
        renderer.draw("other", 0, 0, 80, 80, 0, 0);
      }
    }
  }
}
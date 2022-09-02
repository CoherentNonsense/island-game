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
    this.talking = [];
    this.defaultImg = config.img || this.current.toLowerCase();
    this.defaultAnim = config.anim;
    this.defaultAnimSpeed = config.animSpeed || 0.003;
    this.talkingMode = config.talkingMode || false;
    this.location = config.location;

    if (!config.disableTalk) {
      const option = new Option("Talk", "talk", game => {
        if (game.talkTutorial) {
          game.talkTutorial = false;
          this.talk("You can talk with");
          this.talk("people nearby");
          this.talk("or type /help");
          this.talk("for commands");
        }
      });
      if (this.current === "combat") {
        this.submenus[this.current].options.push(option);
      } else {
        this.submenus[this.current].options.splice(this.submenus[this.current].options.length - 1, 0, option);
      }
      this.submenus["talk"] = new SubMenu([
        new Option("Speak", "", () => {
          const message = this.input.trimEnd();
          if (message.length > 0) {
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
      if (LocationData[this.location].players.length < 1 && !this.submenus[this.current].img) {
        renderer.draw("other", 0, 0, 80, 80, 0, 0);
      }
    }
  }
}
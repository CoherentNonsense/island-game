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
    this.inputLine = config.inputLine || this.message.length;
    this.dontClearMessages = config.dontClearMessages || false;
  }
}

export class Menu {
  constructor(submenus, config = {}) {
    this.submenus = submenus;
    this.index = 0;
    this.current = Object.keys(this.submenus)[0];
    this.messages = this.submenus[this.current].message;
    this.inputMode = false;
    this.inputLine = 0;
    this.input = "";
    this.talking = [];
    this.defaultImg = config.img;
    this.defaultAnim = config.anim;
    this.talkingMode = config.talkingMode || false;

    if (!config.disableTalk) {
      this.submenus[this.current].options.splice(this.submenus[this.current].options.length - 1, 0, new Option("Talk", "talk"));
      this.submenus["talk"] = new SubMenu([
        new Option("Speak", "", () => {
          this.talk(this.input);
        }),
        new Option("Back", this.current)
      ], { inputMode: true, inputLine: 5 });
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
    if (this.messages.length > 5) {
      this.messages.splice(0, 1);
    }
  }

  pushMessage(message) {
    this.messages.push(message);
    if (this.messages.length > 6) {
      this.messages.splice(0, 1);
    }
  }

  select(gameData) {
    const option = this.currentOptions()[this.index];
    let submenuId = option.to;
    const onclickId = option.onclick(gameData);
    if (typeof onclickId === "string") submenuId = onclickId;

    // reset data
    this.index = 0;
    this.input = "";

    if (submenuId === "") return;
    
    this.current = submenuId;
    
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
      renderer.drawAnim(this.defaultAnim, 0, 0, 80, 80, 0, 0, time, 0.002);
    } else if (this.defaultImg) {
      renderer.draw(this.defaultImg, 0, 0, 80, 80, 0, 0);
    }
  }
}

class MenuStack {
  constructor() {
    this.stack = [];
  }

  select() {

  }

  back() {

  }
}
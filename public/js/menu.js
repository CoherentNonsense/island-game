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
    this.message = config.message || "";
    this.inputMode = config.inputMode || false;
    this.inputLine = config.inputLine || config.message.length || 0;
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
    this.defaultImg = config.img;
    this.defaultAnim = config.anim;
  }

  currentOptions() {
    return this.submenus[this.current].options;
  }

  pushMessage(message) {
    this.messages.push(message);
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

  select(gameData) {
    const option = this.currentOptions()[this.index];
    option.onclick(gameData);
    this.current = option.to;
    
    // submenu data
    const submenu = this.submenus[this.current];
    this.messages = submenu.message;
    this.inputMode = submenu.inputMode;
    this.inputLine = submenu.inputLine;

    // reset data
    this.index = 0;
    this.input = "";
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
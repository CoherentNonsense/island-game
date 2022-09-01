export default class Input {
  constructor() {
    this.keys = {
      up: false,
      down: false,
      enter: false
    };

    addEventListener("keydown", e => this.handleEvent(e));
  }

  flush() {
    this.keys.up = false;
    this.keys.down = false;
    this.keys.enter = false;
  }

  handleEvent(e) {
    switch (e.key) {
      case "ArrowUp":
        this.keys.up = e.type === "keydown";
        break;
      case "ArrowDown":
        this.keys.down = e.type === "keydown";
        break;
      case "Enter":
        this.keys.enter = e.type === "keydown";
        break;
    }
  }
}
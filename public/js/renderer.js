export default class Renderer {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.context = canvas.getContext("2d");
    this.size = 0;
    this.scale = 0;

    this.images = new Map();
    this.anims = new Map();

    addEventListener("resize", () => this.resize());
    this.resize();
  }

  async loadImages(imageNames) {
    const promises = [];
    for (let i = 0; i < imageNames.length; ++i) {
      promises.push(new Promise(resolve => {
        this.images.set(imageNames[i], new Image());
        this.images.get(imageNames[i]).src = `assets/${imageNames[i]}.png`;
        this.images.get(imageNames[i]).onload = () => {
          resolve();
        };
      }));
    }

    return Promise.all(promises);
  }

  async loadAnim(name, duration) {
    const images = [];
    for (let i = 0; i < duration; ++i) {
      images.push(name + (i + 1));
    }
    this.anims.set(name, duration);
    return this.loadImages(images);
  }

  fill(color) {
    this.context.fillStyle = color;
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  fillRect(color, x, y, width, height) {
    this.context.fillStyle = color;
    this.context.fillRect(x * this.scale, y * this.scale, width * this.scale, height * this.scale);
  }

  draw(imageName, u, v, width, height, x, y) {
    this.context.drawImage(
      this.images.get(imageName),
      u,
      v,
      width,
      height,
      x * this.scale,
      y * this.scale,
      width * this.scale,
      height * this.scale
    );
  }

  drawAnim(animName, u, v, width, height, x, y, time, speed) {
    const frame = Math.floor((time * speed) % this.anims.get(animName)) + 1;
    this.draw(animName + frame, u, v, width, height, x, y);
  }

  drawText(x, y, text) {
    if (this.images.get("font") === undefined) return new Error("Must load font.png to draw text");
    for (let i = 0; i < text.length; ++i) {
      const charCode = text.charCodeAt(i);
      const uv = {
        x: charCode % 16,
        y: Math.floor(charCode / 16)
      }
      this.context.drawImage(
        this.images.get("font"),
        uv.x * 9,
        uv.y * 9,
        9,
        9,
        (x + (9 * i)) * this.scale,
        y * this.scale,
        9 * this.scale,
        9 * this.scale
      );
    }
  }

  resize() {
    this.size = innerWidth < innerHeight ? innerWidth : innerHeight;
    this.scale = this.size / 160;
  
    this.canvas.width = this.size;
    this.canvas.height = this.size;
    this.context.imageSmoothingEnabled = false;
  }
 
  

}
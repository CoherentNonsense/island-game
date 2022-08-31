export default class Renderer {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.context = canvas.getContext("2d");
    this.size = 0;
    this.scale = 0;

    addEventListener("resize", () => this.resize());
    this.resize();
  }

  draw(image, u, v, width, height, x, y) {
    this.context.drawImage(
      image,
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

  drawText(font, x, y, text) {
    for (let i = 0; i < text.length; ++i) {
      const charCode = text.charCodeAt(i);
      const uv = {
        x: charCode % 16,
        y: Math.floor(charCode / 16)
      }
      this.context.drawImage(
        font,
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
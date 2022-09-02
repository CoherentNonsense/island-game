
// Add padded bytes e.g. length 1 -> length 4 (padding of 3)
// fn(x) 3 - (x - 1)%4                                    |
// x = 0%4 = 0 => 0                                       |
// x = 1%4 = 1 => 3   <------------------------------------
// x = 2%4 = 2 => 2
// x = 3%4 = 3 => 1
function padBytes(currentLength) {
  const remainder = (currentLength - 1) % 4;
  return 3 - (remainder < 0 ? remainder + 4 : remainder);
}


export default class Packet {
  constructor(data = null) {
    this._serverPacket = !!data;
    this._data = this._serverPacket ? data : new ArrayBuffer(4 * 100);
    this._length = 0;
  }

  data() {
    this._length += padBytes(this._length);

    return this._data.slice(0, this._length);
  }

  writeNumber(number) {
    if (this._serverPacket) return new Error("Cannot write to a server packet");
    const view = new Int32Array(this._data);

    this._length += padBytes(this._length);

    view[this._length / 4] = number;
    this._length += 4;

    return this;
  }

  writeString(string) {
    if (this._serverPacket) return new Error("Cannot write to a server packet");
    if (string.length > 255) return new Error("Cannot write a string larger than 255 characters");
    const view = new Uint8Array(this._data);
    view[this._length] = string.length;
    this._length += 1;

    for (let i = 0; i < string.length; ++i) {
      view[this._length] = string.charCodeAt(i);
      this._length += 1;
    }

    return this;
  }

  readNumber() {
    if (!this._serverPacket) return new Error("Cannot read from a client packet.");
    const view = new Int32Array(this._data);

    this._length += padBytes(this._length);

    const number = view[this._length / 4];
    this._length += 4;
    
    return number;
  }

  readString() {
    if (!this._serverPacket) return new Error("Cannot read from a client packet");
    const view = new Uint8Array(this._data);
    let string = "";
    const length = view[this._length];
    this._length += 1;
    for (let i = 0; i < length; ++i) {
      string += String.fromCharCode(view[this._length]);
      this._length += 1;
    }

    return string;
  }
}
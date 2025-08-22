
let black = {
    r: 0,
    g: 0,
    b: 0
}
class Layer {

    constructor(canvas, scale = 1) {
        this.canvas = canvas;
        this.context = canvas.getContext('2d');
        this.imgdata = this.context.getImageData(0, 0, canvas.width, canvas.height);
        this.data = this.imgdata.data;
        this.length = this.imgdata.width * this.imgdata.height;
        this.width = this.imgdata.width;
        this.height = this.imgdata.height;

        if (scale > 1) {
            this.canvas.style.transform = "scale(" + scale + ")";
            this.canvas.style.position = "absolute";
            this.canvas.style.left = (((scale * this.width) - this.width) / 2) | 0;
            this.canvas.style.top = (((scale * this.height) - this.height) / 2) | 0;
        }

    }
    get(x, y, i = x + y * this.width, n = i * 4, valid = (i < this.length)) {
        return {
            red:this.data[n + 0],
            green:this.data[n + 1],
            blue: this.data[n + 2],
            alpha: this.data[n + 3]
        }
    }
    set(x, y, {
        red = 0,
        green = 0,
        blue = 0,
        alpha = 255
    },
        i = x + y * this.width, n = i * 4, valid = (i < this.length)) {
        this.data[n + 0] = red;
        this.data[n + 1] = green;
        this.data[n + 2] = blue;
        this.data[n + 3] = alpha;

        return this;
    }
    each(f,lim = this.length) {
        let n;
        for (let i = 0; i < lim; i++) {
            n = i * 4;
            this.set(i % this.width, (i / this.width) | 0,
                     f(i % this.width, (i / this.width) | 0, [n + 0, n + 1, n + 2, n + 3], i, this.data));
        }
        return this;
    }
    clear(color = black,lim = this.length) {

        this.each((x, y, {red, green, blue, alpha}) => black,lim);
    }
    update() {
        this.context.putImageData(this.imgdata, 0, 0);
        return this;
    }
}

module.exports.Layer = Layer



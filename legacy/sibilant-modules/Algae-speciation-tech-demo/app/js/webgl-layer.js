const vshadersrc = `
attribute vec3 aPosition;
attribute vec4 aColor;

varying highp vec4 vColor;

uniform vec2  uResolution;
uniform float uScale;

void main(void)
{
    gl_Position = vec4(((((aPosition+vec3(1.0,1.0,0.0))*uScale/vec3(uResolution-uScale*2.0,1.0))*vec3(2.0,-2.0,-0.01))-vec3(1.0,-1.0,0.0)), 1.0);
    gl_PointSize = uScale;
    vColor = aColor/255.0;
}`;
const fshadersrc = `
precision mediump float;
varying vec4 vColor;
void main(void)
{
    gl_FragColor = vColor;
}`;

let choose = ((tlayer) => (clayer) => {
    if (clayer.zindex > tlayer.zindex) clayer.zindex--;
    return tlayer != clayer;
})

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

class Layers {
    constructor(p, id, srcSize, scale, gl) {

        this._parent = p;
        var canvas = document.getElementById(id);

        if(!canvas) {
            this._canvas = document.createElement('canvas');
            this._canvas.id = id;
        } else {
            this._canvas = canvas;
        }

        this._gl = gl = this._canvas.getContext("webgl");
        this.layers = new Array();
        this.buffer = new GlBuffer(this._gl);
        this.data = null;
        this.count = 0;
        this.dirty = true;
        this.resolution = new Float32Array([0.0, 0.0]);
        this.scale = scale;

        p.appendChild(this.canvas);
        p.addEventListener("resize", () => (this.resize(this._parent.width, this._parent.height)));
        srcSize += 4;
        this.resize((srcSize * scale) | 0, (srcSize * scale) | 0);

        //gl.disable(gl.DEPTH_TEST);
        //gl.depthMask(false);


        gl.enable(gl.BLEND);
        gl.blendEquation(gl.FUNC_ADD);
        //gl.blendEquationSeparate( gl.FUNC_ADD, gl.FUNC_REVERSE_SUBTRACT );
        //gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

        //gl.blendFuncSeparate( gl.ONE, gl.ONE_MINUS_SRC_ALPHA, gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA );

        this.shader = new Program(
            this._gl,
            new Shader(gl, gl.VERTEX_SHADER, vshadersrc),
            new Shader(gl, gl.FRAGMENT_SHADER, fshadersrc)
        );

        this.shader.uniform.resolution.value = this.resolution;
        this.shader.uniform.scale.value = this.scale;

    }
    setScale (amount) {
        this.scale = amount
        this.shader.uniform.scale.value = this.scale;
    }
    get id() {
        return this._canvas.id;
    }
    get element() {
        return this._canvas;
    }
    get canvas() {
        return this._canvas;
    }
    get context() {
        return this._context;
    }
    get width() {
        return this._canvas.offsetWidth;
    }
    get height() {
        return this._canvas.offsetHeight;
    }
    get size() {
        return [this.width, this.height];
    }

    set id(v) {
        this._canvas.id = v;
    }
    set width(v) {
        this.resolution[0] = this._canvas.width = v;
        this._gl.viewport(0, 0, v, this.height);
    }
    set height(v) {
        this._canvas.height = v;
        this._gl.viewport(0, 0, this.width, v);
    }
    set size(v) {
        this.resize(...v);
    }

    resize(width, height, gl = this._gl) {
        [this.resolution[0], this.resolution[1]] = [this._canvas.width, this._canvas.height] = [width, height];
        gl.viewport(0, 0, width, height);
        return this;
    }
    remove(layer) {
        this.layers = this.layers.filter(choose(layer));
    }
    incEntityCount() {
        this.dirty = true;
        this.count++;
        return this;
    }
    decEntityCount() {
        this.dirty = true;
        this.count--;
        return this;
    }
    clearEntityCount(n) {
        this.dirty = true;
        this.count = n ? (this.count - n) : 0;
        return this;
    }
    clear () {
        this.layers.each ((layer) => layer.clear());
    }

    get(z = this.layers.length) {
        if (!this.layers[z]) this.layers[z] = new Layer(this, z)
        return this.layers[z];
    }

    setBGColor(c = [0, 0, 0, 1], r = c[0], g = c[1], b = c[2], a = c[3]) {
        this._gl.clearColor(r, g, b, a);
        return this;
    }

    update() {
        // if number of entities has changed then resize data
        if (this.dirty) {
            this.data = new Float32Array(this.count * 7);
            this.dirty = false;
        }

        let offset = 0;
        this.layers.forEach((layer) => {
            layer.update(offset, this.data);
            offset += layer.size;
        });

        this.buffer.bind().data(this.data).unbind();

        return this;
    }

    render(gl = this._gl) {
        gl.clear(gl.COLOR_BUFFER_BIT);

        this.buffer.bind();
        this.shader.enable();

        gl.drawArrays(gl.POINTS, 0, this.count);

        this.shader.disable();
        this.buffer.unbind();
        return this;
    }

}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
class Layer extends Set {
    constructor(l, z, i) {
        super();
        this.lset = l;
        this.zindex = z;
    }
    add(value) {
        this.lset.incEntityCount();
        return super.add(value);
    }
    delete(value) {
        this.lset.decEntityCount()
        return super.delete(value);
    }
    clear() {
        this.lset.clearEntityCount(this.size);
        super.clear();
        return this;
    }

    moveUp(z = this.zindex, layers = this.lset.layers) {
        if (this.zindex > 0) {
            [layers[z], layers[z - 1]] = [layers[z - 1], layers[z]];
            [layers[z].zindex, layers[z - 1].zindex] = [z - 1, z];
        }
    }
    moveDown(z = this.zindex, layers = this.lset.layers) {
        if (this.zindex < layers.length - 1) {
            [layers[z], layers[z + 1]] = [layers[z + 1], layers[z]];
            [layers[z].zindex, layers[z + 1].zindex] = [z + 1, z];
        }
    }

    // changes needed here;
    update(offset, data, set = this, buffer = this.buffer, z = this.zindex) {
        // write data for entities into Float32Array data starting at offset
        let i = 0;
        let n = 0;
        set.forEach((entity) => {
            n = offset * 7 + i * 7;

            // coordinate component
            data[n + 0] = entity.x; // needs trasnfrom from pixel space
            data[n + 1] = entity.y; // needs trasnfrom from pixel space
            data[n + 2] = z; // z set by layer not entity

            // color component
            data[n + 3] = entity.r;
            data[n + 4] = entity.g;
            data[n + 5] = entity.b;
            data[n + 6] = entity.a;

            i++;
        });

        return this;
    }
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
class GlBuffer {
    constructor(gl, target, type, usage) {
        this._gl = gl;
        this._target = target || gl.ARRAY_BUFFER;
        this._type = type || gl.ARRAY_BUFFER;
        this._usage = usage || gl.STATIC_DRAW;
        this._ref = gl.createBuffer();
        this.size = 0;
        this.dound = false;
    }
    get gl() {
        return this._gl;
    }
    get target() {
        return this._target;
    }
    get type() {
        return this._type;
    }
    get usage() {
        return this._usage;
    }

    bind(gl = this._gl, target = this._target, ref = this._ref) {
        if (!this.bound) gl.bindBuffer(target, ref);
        return this;
    }
    unbind(gl = this._gl, target = this._target) {
        if (this.bound) gl.bindBuffer(target, null);
        return this;
    }
    delete(gl = this._gl, ref = this._ref) {
        gl.deleteBuffer(ref);
        return this;
    }
    data(data, gl = this._gl, target = this._target, usage = this._usage) {
        this.size = data.length;
        gl.bufferData(target, data, usage);
        return this;
    }
    subData(offset, data, gl = this._gl, target = this._target) {
        gl.bufferSubData(target, offset, data);
        return this;
    }

    get capacity_on_gpu() {
        return this._gl.getBufferParameter(this._gl.ARRAY_BUFFER, this._gl.BUFFER_SIZE);
    }
    get size_on_gpu() {
        return this._gl.getBufferParameter(this._gl.ARRAY_BUFFER, this._gl.BUFFER_USAGE);
    }
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
class Shader {
    constructor(gl, type, source) {
        this._gl = gl;
        this._ref = gl.createShader(type);
        this.error = false;
        this.ready = false;
        this.compile(source);
    }
    compile(source, gl = this._gl, ref = this._ref) {
        gl.shaderSource(ref, source);
        gl.compileShader(ref);

        if (!this.status) {
            this.error = true;
            console.log(this.info);
            return this;
        }

        this.ready = true;
        return this;
    }
    get ref() {
        return this._ref;
    }
    get status() {
        return this._gl.getShaderParameter(this._ref, this._gl.COMPILE_STATUS);
    }
    get info() {
        return this._gl.getShaderInfoLog(this._ref);
    }
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
class Program {
    constructor(gl, vshader, fshader) {
        this.gl = gl;
        this.ref = gl.createProgram();
        this.vert = vshader;
        this.frag = fshader;
        this.ready = false;
        this.error = false;

        this.attribute = {
            vertex: null,
            color: null
        };
        this.uniform = {
            resolution: {
                ref: null,
                value: null
            },
            scale: {
                ref: null,
                value: null
            }
        };
        /*
         this.uniform =
         {
         perspectiveMat4 : null,
         viewMat4        : null
         };
         */

        gl.attachShader(this.ref, vshader.ref);
        gl.attachShader(this.ref, fshader.ref);

        if (this.link()) {
            this.attribute.vertex = gl.getAttribLocation(this.ref, "aPosition");
            this.attribute.color = gl.getAttribLocation(this.ref, "aColor");

            this.uniform.resolution.ref = gl.getUniformLocation(this.ref, "uResolution");
            this.uniform.scale.ref = gl.getUniformLocation(this.ref, "uScale");
        }
    }

    link(gl = this.gl, ref = this.ref) {
        gl.linkProgram(ref);
        if (!this.linked) {
            console.log(this.info);
            return !(this.error = true);
        }
        return (this.ready = true);
    }
    get linked() {
        return this.gl.getProgramParameter(this.ref, this.gl.LINK_STATUS);
    }
    get info() {
        return this.gl.getProgramInfoLog(this.ref);
    }


    enable(gl = this.gl, ref = this.ref, atrb = this.attribute) {
        gl.useProgram(ref);

        // point attributes to data in buffer;
        gl.vertexAttribPointer(this.attribute.vertex, 3, gl.FLOAT, false, 28, 0);
        gl.vertexAttribPointer(this.attribute.color, 4, gl.FLOAT, false, 28, 12);

        // enable them
        gl.enableVertexAttribArray(this.attribute.vertex);
        gl.enableVertexAttribArray(this.attribute.color);

        //console.log( this.uniform.resolution.value );
        gl.uniform2fv(this.uniform.resolution.ref, this.uniform.resolution.value);
        gl.uniform1f(this.uniform.scale.ref, this.uniform.scale.value);

        return this;
    }
    disable(gl = this.gl) {
        gl.useProgram(null);
        return this;
    }
}
module.exports.Layers = Layers

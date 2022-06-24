/* global createProgram */
/* eslint no-unused-vars: ["warn", {"varsIgnorePattern": "Axes"}] */

/**
 * vertex shader
 */
const axisVertex = `
    attribute vec4 axisLocation;
    uniform mat4 projection;

    void main() {
       gl_Position = projection * axisLocation;
    }

`;

/**
 * fragment shader
 */
const axisFragment = `
    precision lowp float;

    void main() {
        gl_FragColor = vec4(0, 0, 0, 1);
    }
`;

/**
 * Displays a 3d set of axes.
 */
class Axes {
    /**
     * Creates a set of axes.
     *
     * @param {number} minx Minimum x value
     * @param {number} maxx Maximum x value
     * @param {number} miny Minimum y value
     * @param {number} maxy Maximum y value
     * @param {number} minz Minimum z value
     * @param {number} maxz Maximum z value
     * @param {number} scale Number of tick marks on the axes (scale ticks on both
     * positive and negative sides)
     */
    constructor(minx, maxx, miny, maxy, minz, maxz, scale) {
        this.minx = minx;
        this.maxx = maxx;
        this.miny = miny;
        this.maxy = maxy;
        this.minz = minz;
        this.maxz = maxz;
        this.scale = scale;
        this.buffer = null;
        this.program = null;
        this.axesVert = null;
    }

    /**
     * Creates the axes. Meant to be used internally.
     *
     * @param {WebGLRenderingContext} gl WebGl context
     */
    createAxes(gl) {
        this.buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        // create the axes.
        let midx = (this.minx + this.maxx) / 2;
        let midy = (this.miny + this.maxy) / 2;
        let midz = (this.minz + this.maxz) / 2;

        this.axesVert = [
            this.minx, midy, midz,
            this.maxx, midy, midz,
            midx, this.miny, midz,
            midx, this.maxy, midz,
            midx, midy, this.minz,
            midx, midy, this.maxz
        ];

        // create the tick marks
        let lengthx = (this.maxx - this.minx) / 120;
        let lengthy = (this.maxy - this.miny) / 120;
        let xWidth = (this.maxx - this.minx) / (this.scale * 2);
        let yWidth = (this.maxy - this.miny) / (this.scale * 2);
        let zWidth = (this.maxz - this.minz) / (this.scale * 2);
        for (let i = 1; i < this.scale + 1; i++) {
            this.axesVert.push(
                xWidth * i + midx, -lengthy, midz,
                xWidth * i + midx, lengthy, midz,
                -xWidth * i + midx, -lengthy, midz,
                -xWidth * i + midx, lengthy, midz,

                -lengthx, yWidth * i + midy, midz,
                lengthx, yWidth * i + midy, midz,
                -lengthx, -yWidth * i + midy, midz,
                lengthx, -yWidth * i + midy, midz,

                midx, -lengthy, zWidth * i + midz,
                midx, lengthy, zWidth * i + midz,
                midx, -lengthy, -zWidth * i + midz,
                midx, lengthy, -zWidth * i + midz
            );
        }

        // create the plus mark on the positive end of the axes
        let plusOffset = 2 * lengthx;
        let plusTL = 5 * lengthx; // 0.05 * this.scale;
        let plusBR = lengthx; // 0.01 * this.scale;
        let plusMid = 3 * lengthx; // 0.03 * this.scale;

        this.axesVert.push(
            this.maxx + plusOffset, plusBR + midy, plusMid + midz,
            this.maxx + plusOffset, plusTL + midy, plusMid + midz,
            this.maxx + plusOffset, plusMid + midy, plusBR + midz,
            this.maxx + plusOffset, plusMid + midy, plusTL + midz,

            plusBR + midx, this.maxy + plusOffset, plusMid + midz,
            plusTL + midx, this.maxy + plusOffset, plusMid + midz,
            plusMid + midx, this.maxy + plusOffset, plusBR + midz,
            plusMid + midx, this.maxy + plusOffset, plusTL + midz,

            plusBR + midx, plusMid + midy, this.maxz + plusOffset,
            plusTL + midx, plusMid + midy, this.maxz + plusOffset,
            plusMid + midx, plusBR + midy, this.maxz + plusOffset,
            plusMid + midx, plusTL + midy, this.maxz + plusOffset
        );

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.axesVert), gl.STATIC_DRAW);
    }

    /**
     * Draws the axes.
     *
     * @param {WebGLRenderingContext} gl WebGL context
     * @param {Matrix} proj Projection matrix for the axes.
     */
    draw(gl, proj) {
        if (this.buffer === null) {
            this.createAxes(gl);
        }
        if (this.program === null) {
            this.program = createProgram(gl, axisVertex, axisFragment);
        }

        let verLoc = gl.getAttribLocation(this.program, 'axisLocation');
        let matProjection = gl.getUniformLocation(this.program, 'projection');

        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.vertexAttribPointer(verLoc, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(verLoc);

        gl.useProgram(this.program);
        gl.uniformMatrix4fv(matProjection, false, proj.getData());

        gl.drawArrays(gl.LINES, 0, this.axesVert.length / 3);
    }
}

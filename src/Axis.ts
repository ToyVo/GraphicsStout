import Matrix from './Matrix';
import {createProgram} from './program';

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
 * Displays a 3d set of axis.
 */
export default class Axis {
	private readonly program: WebGLProgram;
	private readonly buffer: WebGLBuffer;
	private readonly axisVert: Array<number>;

	/**
	 * Creates a set of axes.
	 *
	 * @param gl
	 * @param minX Minimum x value
	 * @param maxX Maximum x value
	 * @param minY Minimum y value
	 * @param maxY Maximum y value
	 * @param minZ Minimum z value
	 * @param maxZ Maximum z value
	 * @param scale Number of tick marks on the axes (scale ticks on both positive and negative sides)
	 * @param mid
	 */
	constructor(gl: WebGLRenderingContext, minX: number, maxX: number, minY: number, maxY: number, minZ: number, maxZ: number, scale: number, mid: boolean = false) {
		const buffer = gl.createBuffer();
		if(!buffer) {
			throw new Error('failed to create buffer');
		}
		this.buffer = buffer;
		this.program = createProgram(gl, axisVertex, axisFragment);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
		// create the axes.
		let midX: number;
		let midY: number;
		let midZ: number;
		if(mid) {
			midX = 0;
			midY = 0;
			midZ = 0;
		} else {
			midX = (minX + maxX) / 2;
			midY = (minY + maxY) / 2;
			midZ = (minZ + maxZ) / 2;
		}

		this.axisVert = [
			minX, midY, midZ,
			maxX, midY, midZ,
			midX, minY, midZ,
			midX, maxY, midZ,
			midX, midY, minZ,
			midX, midY, maxZ
		];

		// create the tick marks
		const lengthX = (maxX - minX) / 120;
		const lengthY = (maxY - minY) / 120;
		const xWidth = (maxX - minX) / (scale * 2);
		const yWidth = (maxY - minY) / (scale * 2);
		const zWidth = (maxZ - minZ) / (scale * 2);
		for(let i = 1; i < scale + 1; i++) {
			this.axisVert.push(
				xWidth * i + midX, -lengthY, midZ,
				xWidth * i + midX, lengthY, midZ,
				-xWidth * i + midX, -lengthY, midZ,
				-xWidth * i + midX, lengthY, midZ,

				-lengthX, yWidth * i + midY, midZ,
				lengthX, yWidth * i + midY, midZ,
				-lengthX, -yWidth * i + midY, midZ,
				lengthX, -yWidth * i + midY, midZ,

				midX, -lengthY, zWidth * i + midZ,
				midX, lengthY, zWidth * i + midZ,
				midX, -lengthY, -zWidth * i + midZ,
				midX, lengthY, -zWidth * i + midZ
			);
		}

		// create the plus mark on the positive end of the axes
		let plusOffset;
		let plusTL;
		let plusBR;
		let plusMid;
		if(mid) {
			plusOffset = 0.06;
			plusTL = 0.05;
			plusBR = 0.01;
			plusMid = 0.03;
		} else {
			plusOffset = 2 * lengthX;
			plusTL = 5 * lengthX; // 0.05 * this.scale;
			plusBR = lengthX; // 0.01 * this.scale;
			plusMid = 3 * lengthX; // 0.03 * this.scale;
		}

		this.axisVert.push(
			maxX + plusOffset, plusBR + midY, plusMid + midZ,
			maxX + plusOffset, plusTL + midY, plusMid + midZ,
			maxX + plusOffset, plusMid + midY, plusBR + midZ,
			maxX + plusOffset, plusMid + midY, plusTL + midZ,

			plusBR + midX, maxY + plusOffset, plusMid + midZ,
			plusTL + midX, maxY + plusOffset, plusMid + midZ,
			plusMid + midX, maxY + plusOffset, plusBR + midZ,
			plusMid + midX, maxY + plusOffset, plusTL + midZ,

			plusBR + midX, plusMid + midY, maxZ + plusOffset,
			plusTL + midX, plusMid + midY, maxZ + plusOffset,
			plusMid + midX, plusBR + midY, maxZ + plusOffset,
			plusMid + midX, plusTL + midY, maxZ + plusOffset
		);

		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.axisVert), gl.STATIC_DRAW);
	}

	/**
	 * Draws the axes.
	 *
	 * @param gl WebGL context
	 * @param projection Projection matrix for the axes.
	 */
	draw(gl: WebGLRenderingContext, projection: Matrix) {
		const verLoc = gl.getAttribLocation(this.program, 'axisLocation');
		const matProjection = gl.getUniformLocation(this.program, 'projection');

		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
		gl.vertexAttribPointer(verLoc, 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(verLoc);

		gl.useProgram(this.program);
		gl.uniformMatrix4fv(matProjection, false, projection.getData());

		gl.drawArrays(gl.LINES, 0, this.axisVert.length / 3);
	}
}

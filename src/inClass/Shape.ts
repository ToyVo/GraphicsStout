import {createProgram} from '../program';

export default class Shape {
	protected buffer: WebGLBuffer;
	private location: {x: number, y: number, z: number};
	protected vertices: Array<number>;
	private vertexSize: number;
	private bufferType: GLenum;
	private color: Float32Array;
	private shapeProgram: WebGLProgram;

	/**
	 *
	 * @param gl
	 */
	constructor(gl: WebGLRenderingContext) {
		this.location = {
			x: 0,
			y: 0,
			z: 0
		};
		this.vertices = [];
		this.vertexSize = 3;
		const buffer = gl.createBuffer();
		if(!buffer) {
			throw new Error('Failed to create buffer');
		}
		this.buffer = buffer;
		this.bufferType = gl.ARRAY_BUFFER;
		this.shapeProgram = createProgram(gl, shapeVertexShader, shapeFragmentShader);
		this.color = new Float32Array([0, 0, 0, 1]);
	}

	getLocation() {
		return this.location;
	}

	setLocation(x: number, y: number, z: number) {
		this.location.x = x;
		this.location.y = y;
		this.location.z = z;
	}

	getColor(): Float32Array {
		return this.color;
	}

	setColor(nColors: Float32Array) {
		this.color = new Float32Array(nColors);
	}

	draw(gl: WebGLRenderingContext) {
		// buffer my data
		gl.bindBuffer(this.bufferType, this.buffer);
		// bind data
		const loc = gl.getAttribLocation(this.shapeProgram, 'location');
		gl.vertexAttribPointer(loc, this.vertexSize, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(loc);

		// set the color
		const col = gl.getUniformLocation(this.shapeProgram, 'color');
		const model = gl.getUniformLocation(this.shapeProgram, 'model');

		gl.useProgram(this.shapeProgram);
		gl.uniform4fv(col, this.color);

		const cos = Math.cos(21 * Math.PI / 180);
		const sin = Math.sin(21 * Math.PI / 180);
		const transform = [
			cos, sin, 0, 0,
			-sin, cos, 0, 0,
			0, 0, 1, 0,
			this.location.x, this.location.y, this.location.z, 1
		];

		gl.uniformMatrix4fv(model, false, transform);

		// draw data
		gl.drawArrays(gl.TRIANGLES, 0, this.vertices.length / this.vertexSize);
	}
}

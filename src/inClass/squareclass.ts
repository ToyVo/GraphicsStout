import Shape from './Shape';

export default class Square extends Shape {

	constructor(gl: WebGLRenderingContext) {
		super(gl);

		this.vertices = [
			-0.5, 0.5, 0,
			-0.5, -0.5, 0,
			0.5, 0.5, 0,
			0.5, 0.5, 0,
			-0.5, -0.5, 0,
			0.5, -0.5, 0
		];

		// bind it
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);

		// buffer the data
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
	}
}

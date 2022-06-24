/**
 * Creates a ray starting at the origin along the x-axis
 */
import Matrix from './Matrix';
import Vector from './Vector';

export class Ray {
	private readonly vertices: Float32Array;
	private readonly program: WebGLProgram;
	private readonly triangles: Uint8Array;
	private readonly edges: Uint8Array;
	private readonly world: Matrix;
	private rotateMatrix: Matrix;
	private translateMatrix: Matrix;
	private colors: Float32Array;
	private buffered: boolean;
	private readonly trianglesBuffer: WebGLBuffer;
	private readonly edgesBuffer: WebGLBuffer;
	private readonly verticesBuffer: WebGLBuffer;

	/**
	 * Creates a ray.
	 *
	 * @param gl WebGL Context
	 */
	constructor(gl: WebGLRenderingContext) {
		this.program = createProgram(gl, edgeVertex, edgeFragment);
		// vertices
		this.vertices = new Float32Array([
			0, 0, 0,
			1, 0, 0,
			0, 1, 0,
			0, 0, 1,
			1, 1, 0,
			1, 0, 1,
			0, 1, 1,
			1, 1, 1
		]);

		// triangles
		this.triangles = new Uint8Array([
			0, 1, 3, 5, // bottom
			6, 7, // front
			2, 4, // top
			0, 1, // back
			1, 4, 5, 7, // right
			6, 2, 3, 0 // left
		]);

		this.edges = new Uint8Array([
			0, 1,
			1, 4,
			4, 2,
			2, 0,
			3, 6,
			6, 7,
			7, 5,
			5, 3,
			0, 3,
			1, 5,
			2, 6,
			4, 7
		]);

		this.world = new Matrix().scale(2, 0.01, 0.01);

		this.rotateMatrix = new Matrix(); // rotate matrix
		this.translateMatrix = new Matrix();

		this.colors = new Float32Array([0, 0, 0, 1]);
		this.buffered = false;
		this.verticesBuffer = this.createBuffer(gl);
		this.trianglesBuffer = this.createBuffer(gl);
		this.edgesBuffer = this.createBuffer(gl);
	}

	/**
	 * Creates the buffers for the program. Intended for internal use.
	 *
	 * @param gl WebGL context
	 */
	bufferData(gl: WebGLRenderingContext) {
		gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.trianglesBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.triangles, gl.STATIC_DRAW);

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.edgesBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.edges, gl.STATIC_DRAW);

		this.buffered = true;
	}

	// render
	/**
	 * Draws a ray using the provided context and the projection
	 * matrix.
	 *
	 * @param gl WebGL context
	 * @param projection Projection matrix
	 * @param view
	 */
	render(gl: WebGLRenderingContext, projection: Matrix, view: Matrix) {
		if(!this.buffered) {
			this.bufferData(gl);
		}

		const verLoc = gl.getAttribLocation(this.program, 'location');
		const matProjection = gl.getUniformLocation(this.program, 'projection');
		const matModel = gl.getUniformLocation(this.program, 'model');
		const matView = gl.getUniformLocation(this.program, 'view');
		const eColor = gl.getUniformLocation(this.program, 'cColor');

		gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesBuffer);
		gl.vertexAttribPointer(verLoc, 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(verLoc);

		gl.useProgram(this.program);

		gl.uniformMatrix4fv(matProjection, false, projection.getData());
		gl.uniformMatrix4fv(matModel, false, this.getModel().getData());
		gl.uniformMatrix4fv(matView, false, view.getData());

		gl.uniform4fv(eColor, this.colors);

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.trianglesBuffer);
		gl.drawElements(gl.TRIANGLE_STRIP, this.triangles.length, gl.UNSIGNED_BYTE, 0);

		gl.uniform4fv(eColor, new Float32Array([0, 0, 0, 1]));

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.edgesBuffer);
		gl.drawElements(gl.LINES, this.edges.length, gl.UNSIGNED_BYTE, 0);
	}

	/**
	 * Sets the this.translateMatrix variable to a new translation matrix that uses the
	 * parameters for the translation information.
	 *
	 * @param tx Amount to translate the ray in the x direction.
	 * @param ty Amount to translate the ray in the y direction.
	 * @param tz Amount to translate the ray in the z direction.
	 */
	translate(tx: number, ty: number, tz: number) {
		this.translateMatrix = new Matrix();
		this.translateMatrix = this.translateMatrix.translate(tx, ty, tz);
	}

	/**
	 * Sets the this.rotateMatrix variable to a new rotation matrix that uses the
	 * parameters for the rotation information.
	 *
	 * @param vector Vector to rotate this ray to
	 */
	rotate(vector: Vector) {
		this.rotateMatrix = this.getRotateToVector(new Vector(new Float32Array([1, 0, 0])), vector);
	}

	/**
	 * Gets a rotation matrix that moves a start vector to the end vector.
	 *
	 * @param start Original vector
	 * @param end  Destination vector
	 *
	 * @return A rotation matrix that moves start to end.
	 */
	getRotateToVector(start: Vector, end: Vector): Matrix {
		const nStart = new Vector(start.getData());
		const nEnd = new Vector(end.getData());
		nStart.normalize();
		nEnd.normalize();
		const a = nStart.crossProduct(nEnd);
		a.normalize();

		const c = nStart.dotProduct(nEnd);
		const alpha = Math.acos(c);
		const s = Math.sin(alpha);

		const minC = 1 - c;

		return new Matrix([
			a.getX() * a.getX() * minC + c, a.getX() * a.getY() * minC - s * a.getZ(),
			a.getX() * a.getZ() * minC + s * a.getY(), 0,
			a.getX() * a.getY() * minC + s * a.getZ(), a.getY() * a.getY() * minC + c,
			a.getY() * a.getZ() * minC - s * a.getX(), 0,
			a.getX() * a.getZ() * minC - s * a.getY(), a.getY() * a.getZ() * minC + s * a.getX(),
			a.getZ() * a.getZ() * minC + c, 0,
			0, 0, 0, 1
		]);
	}

	/**
	 * Changes the color of the ray.
	 *
	 * @param cols The color of the ray.
	 */
	setColor(cols: Float32Array) {
		this.colors = cols;
	}

	/**
	 * Creates a model matrix by combining the other matrices.
	 *
	 * @return A matrix with all of the transformations applied to the ray.
	 */
	getModel(): Matrix {
		return this.translateMatrix.mult(this.rotateMatrix.mult(this.world));
	}

	createBuffer(gl: WebGLRenderingContext): WebGLBuffer {
		const buffer = gl.createBuffer();
		if(!buffer) {
			throw new Error('failed to create buffer');
		} else {
			return buffer;
		}
	}
}

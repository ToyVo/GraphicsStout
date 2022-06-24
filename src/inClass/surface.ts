/**
 * vertex shader
 */
const surfaceVertex = `
    attribute vec4 location;

    uniform mat4 model;
    uniform mat4 projection;

    varying lowp vec4 cColor;

    void main() {
       gl_Position = projection * model * location;
       cColor = vec4((location.y + 1.0) / 2.0, 0.0, 0.0, 1.0);
    }

`;

/**
 * fragment shader
 */
const surfaceFragment = `
    precision lowp float;
    varying lowp vec4 cColor;

    void main() {
        gl_FragColor = cColor;
    }
`;

const triVertex = `
    attribute vec4 location;

    uniform mat4 model;
    uniform mat4 projection;

    void main() {
       gl_Position = projection * model * location;
    }

`;

/**
 * fragment shader
 */
const triFragment = `
    precision lowp float;
    uniform vec4 cColor;

    void main() {
        gl_FragColor = cColor;
    }
`;

/**
 * Creates a surface.
 */
class Surface {
	/**
	 * Creates a surface.
	 *
	 * @param {WebGLRenderingContext} gl WebGL Context
	 */
	constructor(gl, width, height) {
		// shaders
		this.wire = false;
		this.program = createProgram(gl, surfaceVertex, surfaceFragment);
		this.triprogram = createProgram(gl, triVertex, triFragment);
		// vertices
		// TODO create the length of the arrays
		this.vertices = new Float32Array(width * height * 6);
		this.triangles = new Uint16Array(2 * width * (height - 1));

		this.width = width;
		this.height = height;

		let x;
		let y;
		let z;

		const xMin = -1 * Math.PI;
		const zMin = -1 * Math.PI;
		const range = 2 * Math.PI;

		let pos = 0;
		let tpos = 0;

		// TODO draw lines in both directions
		for(let r = 0; r < width; r++) {
			for(let c = 0; c < height; c++) {
				x = range * r / (width - 1) + xMin;
				z = range * c / (height - 1) + zMin;
				y = Math.cos(x) * Math.cos(2 * z);

				this.vertices[pos] = x;
				this.vertices[pos + 1] = y;
				this.vertices[pos + 2] = z;

				if(r < width - 1) {
					this.triangles[tpos + 1] = pos / 3;
				}
				// TODO check bounds
				if(r !== 0) {
					this.triangles[tpos - 2 * height] = pos / 3;
				}

				tpos += 2;
				pos += 3;
			}
		}

		for(let c = 0; c < height; c++) {
			for(let r = 0; r < width; r++) {
				x = range * r / (width - 1) + xMin;
				z = range * c / (height - 1) + zMin;
				y = Math.cos(x) * Math.cos(2 * z);

				this.vertices[pos] = x;
				this.vertices[pos + 1] = y;
				this.vertices[pos + 2] = z;

				pos += 3;
			}
		}

		// move from model coordinates to world coordinates.
		this.model = new Matrix().scale(2 / (range * 2), 0.25, 2 / (range * 2));

		this.scaleMatrix = new Matrix(); // scale matrix
		this.rotateMatrix = new Matrix(); // rotate matrix
		this.translateMatrix = new Matrix(); // translate

		this.buffered = false;
	}

	/**
	 * Creates the buffers for the program. Intended for internal use.
	 *
	 * @param {WebGLRenderingContext} gl WebGL context
	 */
	bufferData(gl) {
		this.verticesBuffer = gl.createBuffer();
		this.trianglesBuffer = gl.createBuffer();

		gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.trianglesBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.triangles, gl.STATIC_DRAW);

		this.buffered = true;
	}

	// render
	/**
	 * Draws a surface using the provided context and the projection
	 * matrix.
	 *
	 * @param {WebGLRenderingContext} gl WebGL context
	 * @param {Matrix} projection Projection matrix
	 */
	render(gl, view) {
		if(!this.buffered) {
			this.bufferData(gl);
		}

		let verLoc = gl.getAttribLocation(this.program, 'location');
		let matProjection = gl.getUniformLocation(this.program, 'projection');
		let matView = gl.getUniformLocation(this.program, 'model');

		gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesBuffer);
		gl.vertexAttribPointer(verLoc, 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(verLoc);

		gl.useProgram(this.program);

		gl.uniformMatrix4fv(matProjection, false, view.getData());
		gl.uniformMatrix4fv(matView, false, this.getModel().getData());

		gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesBuffer);
		// TODO draw lines
		for(let i = 0; i < this.width; i++) {
			gl.drawArrays(gl.LINE_STRIP, i * this.height, this.height);
		}
		for(let i = 0; i < this.height; i++) {
			gl.drawArrays(gl.LINE_STRIP, i * this.width + this.vertices.length / 6,
				this.width);
		}

		// triangles
		const backColor = gl.getUniformLocation(this.triprogram, 'cColor');
		verLoc = gl.getAttribLocation(this.triprogram, 'location');

		matProjection = gl.getUniformLocation(this.triprogram, 'projection');
		matView = gl.getUniformLocation(this.triprogram, 'model');

		gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesBuffer);
		gl.vertexAttribPointer(verLoc, 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(verLoc);

		gl.useProgram(this.triprogram);

		gl.uniformMatrix4fv(matProjection, false, view.getData());
		gl.uniformMatrix4fv(matView, false, this.getModel().getData());
		gl.uniform4fv(backColor, new Float32Array([0.5, 0.5, 0.7, 1]));

		// TODO draw triangles

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.trianglesBuffer);
		for(let i = 0; i < this.width - 1; i++) {
			gl.drawElements(gl.TRIANGLE_STRIP, this.height * 2, gl.UNSIGNED_SHORT,
				i * this.height * 4);
		}
	}

	/**
	 * Sets the this.scaleMatrix variable to a new scaling matrix that uses the
	 * parameters for the scaling informaton.
	 *
	 * @param {number} sx Amount to scale the cube in the x direction
	 * @param {number} sy Amount to scale the cube in the y direction
	 * @param {number} sz Amount to scale the cube in the z direction
	 */
	scale(sx, sy, sz) {
		this.scaleMatrix = new Matrix();
		this.scaleMatrix = this.scaleMatrix.scale(sx, sy, sz);
	}

	/**
	 * Sets the this.rotateMatrix variable to a new rotation matrix that uses the
	 * parameters for the rotation informaton.
	 *
	 * @param {number} xtheta Amount in degrees to rotate the cube around the x-axis
	 * @param {number} ytheta Amount in degrees to rotate the cube around the y-axis
	 * @param {number} ztheta Amount in degrees to rotate the cube around the z-axis
	 */
	rotate(xtheta, ytheta, ztheta) {
		this.rotateMatrix = new Matrix();
		this.rotateMatrix = this.rotateMatrix.rotate(xtheta, ytheta, ztheta);
	}

	/**
	 * Sets the this.translateMatrix variable to a new translation matrix that uses the
	 * parameters for the translation informaton.
	 *
	 * @param {number} tx Amount to translate the cube in the x direction.
	 * @param {number} ty Amount to translate the cube in the y direction.
	 * @param {number} tz Amount to translate the cube in the z direction.
	 */
	translate(tx, ty, tz) {
		this.translateMatrix = new Matrix();
		this.translateMatrix = this.translateMatrix.translate(tx, ty, tz);
	}

	/**
	 * Creates a model matrix by combining the other matrices. The matrices should be applied
	 * in the order:
	 *  view
	 *  scaleMatrix
	 *  rotateMatrix
	 *  translateMatrix
	 *
	 * @return {Matrix} A matrix with all of the transformations applied to the cube.
	 */
	getModel() {
		return this.translateMatrix.mult(this.rotateMatrix).mult(this.scaleMatrix).mult(this.model);
	}
}

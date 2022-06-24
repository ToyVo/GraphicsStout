export default class Renderer {
	public t: number = 0.0;
	public modeVal: number = 1;
	public lightPos: Array<number> = [1.0, 1.0, -1.0];
	public lightVec: Float32Array = new Float32Array(3);
	public ambientColor: Array<number> = [0.2, 0.1, 0.0];
	public diffuseColor: Array<number> = [0.8, 0.4, 0.0];
	public specularColor: Array<number> = [1.0, 1.0, 1.0];
	public clearColor: Array<number> = [0.0, 0.4, 0.7];
	public attenuation: number = 0.01;
	public shininess: number = 80.0;
	public kaVal: number = 1.0;
	public kdVal: number = 1.0;
	public ksVal: number = 1.0;

	private gl: WebGLRenderingContext;
	private sceneVertNo = 0;
	private bufID: WebGLBuffer;
	private progID: WebGLProgram = 0;
	private vertID: WebGLShader = 0;
	private fragID: WebGLShader = 0;
	private vertexLoc: number = 0;
	private texCoordLoc: number = 0;
	private normalLoc: number = 0;
	private projectionLoc: WebGLUniformLocation = 0;
	private modelViewLoc: WebGLUniformLocation = 0;
	private normalMatrixLoc: WebGLUniformLocation = 0;
	private modeLoc: WebGLUniformLocation = 0;
	private kaLoc: WebGLUniformLocation = 0;
	private kdLoc: WebGLUniformLocation = 0;
	private ksLoc: WebGLUniformLocation = 0;
	private attenuationLoc: WebGLUniformLocation = 0;
	private shininessLoc: WebGLUniformLocation = 0;
	private lightPosLoc: WebGLUniformLocation = 0;
	private lightVecLoc: WebGLUniformLocation = 0;
	private ambientColorLoc: WebGLUniformLocation = 0;
	private diffuseColorLoc: WebGLUniformLocation = 0;
	private specularColorLoc: WebGLUniformLocation = 0;
	private projection: Float32Array = new Float32Array(16);
	private modelView: Float32Array = new Float32Array(16);
	private currentFileName: string = './knot.txt';
	private vertSrc: string;
	private fragSrc: string;

	constructor(vertSrc: string, fragSrc: string) {
		this.vertSrc = vertSrc;
		this.fragSrc = fragSrc;

		const canvas = document.createElement('canvas');
		document.body.appendChild(canvas);
		const gl = canvas.getContext('webgl');
		if(!gl) {
			throw new Error('Could not retrieve WebGL Context');
		}
		this.gl = gl;
		this.resize(canvas.width, canvas.height);

		this.init();
	}

	public updateShader(newvertSrc: string, newfragSrc: string) {
		this.vertSrc = newvertSrc;
		this.fragSrc = newfragSrc;

		this.gl.deleteProgram(this.progID);
		this.gl.deleteShader(this.vertID);
		this.gl.deleteShader(this.fragID);

		this.setupShaders();
	}

	public updateModel(newFileName: string) {
		this.currentFileName = newFileName;

		this.gl.deleteProgram(this.progID);
		this.gl.deleteShader(this.vertID);
		this.gl.deleteShader(this.fragID);
		this.gl.deleteBuffer(this.bufID);

		this.init();
	}

	public init() {
		this.gl.enable(this.gl.DEPTH_TEST);
		this.setupShaders();

		// generate a Vertex Buffer Object (VBO)
		const bufID = this.gl.createBuffer();
		if(!bufID) {
			throw new Error('Failed to create buffer bufID');
		}
		this.bufID = bufID;

		const sceneVertexData = Renderer.loadVertexData(this.currentFileName);
		this.sceneVertNo = sceneVertexData.length / (3 + 2 + 3);

		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.bufID);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, sceneVertexData, this.gl.STATIC_DRAW);

		let offset = 0;
		let stride = 0;
		if(this.vertexLoc != -1) {
			// position
			stride = (3 + 2 + 3) * Float32Array.BYTES_PER_ELEMENT;
			this.gl.vertexAttribPointer(this.vertexLoc, 3, this.gl.FLOAT, false, stride, offset);
			this.gl.enableVertexAttribArray(this.vertexLoc);
		}
		if(this.texCoordLoc != -1) {
			// texCoordinate
			offset = 3 * Float32Array.BYTES_PER_ELEMENT;
			this.gl.vertexAttribPointer(this.texCoordLoc, 2, this.gl.FLOAT, false, stride, offset);
			this.gl.enableVertexAttribArray(this.texCoordLoc);
		}
		if(this.normalLoc != -1) {
			// normal
			offset = (3 + 2) * Float32Array.BYTES_PER_ELEMENT;
			this.gl.vertexAttribPointer(this.normalLoc, 3, this.gl.FLOAT, false, stride, offset);
			this.gl.enableVertexAttribArray(this.normalLoc);
		}
	}

	private static loadVertexData(filename: string) {
		let data = new Float32Array(0);
		const request = new XMLHttpRequest();
		request.open('GET', filename, false);
		request.send(); // "false" above, will block

		if(request.status != 200) {
			alert('can not load file ' + filename);
		} else {
			const floatValues = request.responseText.split('\n');
			const numFloats = parseInt(floatValues[0]);
			if(numFloats % (3 + 2 + 3) != 0) return data;
			data = new Float32Array(numFloats);
			for(let k = 0; k < numFloats; k++) {
				data[k] = Number.parseFloat(floatValues[k + 1]);
			}
		}
		return data;
	}

	public resize(w: number, h: number) {
		this.gl.viewport(0, 0, w, h);

		// this function replaces gluPerspective
		Renderer.mat4Perspective(this.projection, 32.0, w / h, 0.5, 4.0);
		// mat4Print(projection);
	}

	public display() {
		this.gl.clearColor(this.clearColor[0], this.clearColor[1], this.clearColor[2], 1.0);
		this.gl.clear(this.gl.COLOR_BUFFER_BIT);

		// camera orbits in the z=1.5 plane
		// and looks at the origin
		// mat4LookAt replaces gluLookAt
		const rad = Math.PI / 180.0 * this.t;

		Renderer.mat4LookAt(this.modelView,
			1.5 * Math.cos(rad), 1.5 * Math.sin(rad), 1.5, // eye
			0.0, 0.0, 0.0, // look at
			0.0, 0.0, 1.0); // up

		// this.mat4Print(this.modelView);

		const modelViewInv = new Float32Array(16);
		const normalMatrix = new Float32Array(16);
		Renderer.mat4Invert(this.modelView, modelViewInv);
		Renderer.mat4Transpose(modelViewInv, normalMatrix);

		this.gl.useProgram(this.progID);

		// load the current projection and modelView matrix into the
		// corresponding UNIFORM variables of the shader
		this.gl.uniformMatrix4fv(this.projectionLoc, false, this.projection);
		this.gl.uniformMatrix4fv(this.modelViewLoc, false, this.modelView);
		if(this.normalMatrixLoc != -1) this.gl.uniformMatrix4fv(this.normalMatrixLoc, false, normalMatrix);
		if(this.modeLoc != -1) this.gl.uniform1i(this.modeLoc, this.modeVal);
		if(this.kaLoc != -1) this.gl.uniform1f(this.kaLoc, this.kaVal);
		if(this.kdLoc != -1) this.gl.uniform1f(this.kdLoc, this.kdVal);
		if(this.ksLoc != -1) this.gl.uniform1f(this.ksLoc, this.ksVal);
		if(this.attenuationLoc != -1) this.gl.uniform1f(this.attenuationLoc, this.attenuation);
		if(this.shininessLoc != -1) this.gl.uniform1f(this.shininessLoc, this.shininess);
		if(this.lightPosLoc != -1) this.gl.uniform3fv(this.lightPosLoc, this.lightPos);
		if(this.lightVecLoc != -1) this.gl.uniform3fv(this.lightVecLoc, this.lightVec);
		if(this.ambientColorLoc != -1) this.gl.uniform3fv(this.ambientColorLoc, this.ambientColor);
		if(this.diffuseColorLoc != -1) this.gl.uniform3fv(this.diffuseColorLoc, this.diffuseColor);
		if(this.specularColorLoc != -1) this.gl.uniform3fv(this.specularColorLoc, this.specularColor);

		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.bufID);
		this.gl.drawArrays(this.gl.TRIANGLES, 0, this.sceneVertNo);
	}

	private setupShaders() {
		// create shader
		const vertID = this.gl.createShader(this.gl.VERTEX_SHADER);
		if(!vertID) {
			throw new Error('Failed to create shader vertID');
		}
		this.vertID = vertID;
		const fragID = this.gl.createShader(this.gl.FRAGMENT_SHADER);
		if(!fragID) {
			throw new Error('Failed to create shader vertID');
		}
		this.fragID = fragID;

		// specify shader source
		this.gl.shaderSource(this.vertID, this.vertSrc);
		this.gl.shaderSource(this.fragID, this.fragSrc);

		// compile the shader
		this.gl.compileShader(this.vertID);
		this.gl.compileShader(this.fragID);

		// check for errors
		if(!this.gl.getShaderParameter(this.vertID, this.gl.COMPILE_STATUS)) {
			throw new Error(`invalid vertex shader : ${this.gl.getShaderInfoLog(this.vertID)}`);
		}
		if(!this.gl.getShaderParameter(this.fragID, this.gl.COMPILE_STATUS)) {
			throw new Error(`invalid fragment shader : ${this.gl.getShaderInfoLog(this.fragID)}`);
		}

		// create program and attach shaders
		const progID = this.gl.createProgram();
		if(!progID) {
			throw new Error('Failed to create program');
		}
		this.progID = progID;
		this.gl.attachShader(this.progID, this.vertID);
		this.gl.attachShader(this.progID, this.fragID);

		// link the program
		this.gl.linkProgram(this.progID);
		if(!this.gl.getProgramParameter(this.progID, this.gl.LINK_STATUS)) {
			throw new Error(`${this.gl.getProgramInfoLog(this.progID)}`);
		}

		// retrieve the location of the IN variables of the vertex shader
		this.vertexLoc = this.gl.getAttribLocation(this.progID, 'position');
		this.texCoordLoc = this.gl.getAttribLocation(this.progID, 'texCoord');
		this.normalLoc = this.gl.getAttribLocation(this.progID, 'normal');

		// retrieve the location of the UNIFORM variables of the shader
		const projectionLoc = this.gl.getUniformLocation(this.progID, 'projection');
		if(!projectionLoc) {
			throw new Error('Could not get uniform location for projection');
		}
		this.projectionLoc = projectionLoc;
		const modelViewLoc = this.gl.getUniformLocation(this.progID, 'modelview');
		if(!modelViewLoc) {
			throw new Error('Could not get uniform location for modelview');
		}
		this.modelViewLoc = modelViewLoc;
		const normalMatrixLoc = this.gl.getUniformLocation(this.progID, 'normalMat');
		if(!normalMatrixLoc) {
			throw new Error('Could not get uniform location for normalMat');
		}
		this.normalMatrixLoc = normalMatrixLoc;
		const modeLoc = this.gl.getUniformLocation(this.progID, 'mode');
		if(!modeLoc) {
			throw new Error('Could not get uniform location for mode');
		}
		this.modeLoc = modeLoc;
		const lightPosLoc = this.gl.getUniformLocation(this.progID, 'lightPos');
		if(!lightPosLoc) {
			throw new Error('Could not get uniform location for lightPos');
		}
		this.lightPosLoc = lightPosLoc;
		const lightVecLoc = this.gl.getUniformLocation(this.progID, 'lightVec');
		if(!lightVecLoc) {
			throw new Error('Could not get uniform location for lightVec');
		}
		this.lightVecLoc = lightVecLoc;
		const ambientColorLoc = this.gl.getUniformLocation(this.progID, 'ambientColor');
		if(!ambientColorLoc) {
			throw new Error('Could not get uniform location for ambientColor');
		}
		this.ambientColorLoc = ambientColorLoc;
		const diffuseColorLoc = this.gl.getUniformLocation(this.progID, 'diffuseColor');
		if(!diffuseColorLoc) {
			throw new Error('Could not get uniform location for diffuseColor');
		}
		this.diffuseColorLoc = diffuseColorLoc;
		const specularColorLoc = this.gl.getUniformLocation(this.progID, 'specularColor');
		if(!specularColorLoc) {
			throw new Error('Could not get uniform location for specularColor');
		}
		this.specularColorLoc = specularColorLoc;
		const shininessLoc = this.gl.getUniformLocation(this.progID, 'shininessVal');
		if(!shininessLoc) {
			throw new Error('Could not get uniform location for shininessVal');
		}
		this.shininessLoc = shininessLoc;
		const attenuationLoc = this.gl.getUniformLocation(this.progID, 'attenuationVal');
		if(!attenuationLoc) {
			throw new Error('Could not get uniform location for attenuationVal');
		}
		this.attenuationLoc = attenuationLoc;
		const kaLoc = this.gl.getUniformLocation(this.progID, 'Ka');
		if(!kaLoc) {
			throw new Error('Could not get uniform location for Ka');
		}
		this.kaLoc = kaLoc;
		const kdLoc = this.gl.getUniformLocation(this.progID, 'Kd');
		if(!kdLoc) {
			throw new Error('Could not get uniform location for Kd');
		}
		this.kdLoc = kdLoc;
		const ksLoc = this.gl.getUniformLocation(this.progID, 'Ks');
		if(!ksLoc) {
			throw new Error('Could not get uniform location for Ks');
		}
		this.ksLoc = ksLoc;
	}

	// the following functions are some matrix and vector helpers
	// they work for this demo but in general it is recommended
	// to use more advanced matrix libraries
	private static vec3Dot(a: Float32Array, b: Float32Array) {
		return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
	}

	private static vec3Cross(a: Float32Array, b: Float32Array, res: Float32Array) {
		res[0] = a[1] * b[2] - b[1] * a[2];
		res[1] = a[2] * b[0] - b[2] * a[0];
		res[2] = a[0] * b[1] - b[0] * a[1];
	}

	private static vec3Normalize(a: Float32Array) {
		const mag = Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2]);
		a[0] /= mag;
		a[1] /= mag;
		a[2] /= mag;
	}

	private static mat4Identity(a: Float32Array) {
		for(let i = 0; i < 16; ++i) a[i] = 0.0;
		for(let i = 0; i < 4; ++i) a[i + i * 4] = 1.0;
	}

	private static mat4Multiply(a: Float32Array, b: Float32Array, res: Float32Array) {
		for(let i = 0; i < 4; ++i) {
			for(let j = 0; j < 4; ++j) {
				res[j * 4 + i] = 0.0;
				for(let k = 0; k < 4; ++k) {
					res[j * 4 + i] += a[k * 4 + i] * b[j * 4 + k];
				}
			}
		}
	}

	private static mat4Perspective(a: Float32Array, fov: number, aspect: number, zNear: number, zFar: number) {
		const f = 1.0 / Math.tan(fov / 2.0 * (Math.PI / 180.0));
		Renderer.mat4Identity(a);
		a[0] = f / aspect;
		a[4 + 1] = f;
		a[2 * 4 + 2] = (zFar + zNear) / (zNear - zFar);
		a[3 * 4 + 2] = (2.0 * zFar * zNear) / (zNear - zFar);
		a[2 * 4 + 3] = -1.0;
		a[3 * 4 + 3] = 0.0;
	}

	private static mat4LookAt(viewMatrix: Float32Array, eyeX: number, eyeY: number, eyeZ: number, centerX: number, centerY: number, centerZ: number, upX: number, upY: number, upZ: number) {
		const dir = new Float32Array(3);
		const right = new Float32Array(3);
		const up = new Float32Array(3);
		const eye = new Float32Array(3);

		up[0] = upX;
		up[1] = upY;
		up[2] = upZ;
		eye[0] = eyeX;
		eye[1] = eyeY;
		eye[2] = eyeZ;

		dir[0] = centerX - eyeX;
		dir[1] = centerY - eyeY;
		dir[2] = centerZ - eyeZ;
		Renderer.vec3Normalize(dir);
		Renderer.vec3Cross(dir, up, right);
		Renderer.vec3Normalize(right);
		Renderer.vec3Cross(right, dir, up);
		Renderer.vec3Normalize(up);
		// first row
		viewMatrix[0] = right[0];
		viewMatrix[4] = right[1];
		viewMatrix[8] = right[2];
		viewMatrix[12] = -Renderer.vec3Dot(right, eye);
		// second row
		viewMatrix[1] = up[0];
		viewMatrix[5] = up[1];
		viewMatrix[9] = up[2];
		viewMatrix[13] = -Renderer.vec3Dot(up, eye);
		// third row
		viewMatrix[2] = -dir[0];
		viewMatrix[6] = -dir[1];
		viewMatrix[10] = -dir[2];
		viewMatrix[14] = Renderer.vec3Dot(dir, eye);
		// forth row
		viewMatrix[3] = 0.0;
		viewMatrix[7] = 0.0;
		viewMatrix[11] = 0.0;
		viewMatrix[15] = 1.0;
	}

	private static mat4Print(a: Float32Array) {
		// opengl uses column major order
		let out = '';
		for(let i = 0; i < 4; ++i) {
			for(let j = 0; j < 4; ++j) {
				out += a[j * 4 + i] + ' ';
			}
			out += '\n';
		}
		alert(out);
	}

	private static mat4Transpose(a: Float32Array, transposed: Float32Array) {
		let t = 0;
		for(let i = 0; i < 4; ++i) {
			for(let j = 0; j < 4; ++j) {
				transposed[t++] = a[j * 4 + i];
			}
		}
	}

	private static mat4Invert(m: Float32Array, inverse: Float32Array) {
		const inv = new Float32Array(16);
		inv[0] = m[5] * m[10] * m[15] - m[5] * m[11] * m[14] - m[9] * m[6] * m[15] +
			m[9] * m[7] * m[14] + m[13] * m[6] * m[11] - m[13] * m[7] * m[10];
		inv[4] = -m[4] * m[10] * m[15] + m[4] * m[11] * m[14] + m[8] * m[6] * m[15] -
			m[8] * m[7] * m[14] - m[12] * m[6] * m[11] + m[12] * m[7] * m[10];
		inv[8] = m[4] * m[9] * m[15] - m[4] * m[11] * m[13] - m[8] * m[5] * m[15] +
			m[8] * m[7] * m[13] + m[12] * m[5] * m[11] - m[12] * m[7] * m[9];
		inv[12] = -m[4] * m[9] * m[14] + m[4] * m[10] * m[13] + m[8] * m[5] * m[14] -
			m[8] * m[6] * m[13] - m[12] * m[5] * m[10] + m[12] * m[6] * m[9];
		inv[1] = -m[1] * m[10] * m[15] + m[1] * m[11] * m[14] + m[9] * m[2] * m[15] -
			m[9] * m[3] * m[14] - m[13] * m[2] * m[11] + m[13] * m[3] * m[10];
		inv[5] = m[0] * m[10] * m[15] - m[0] * m[11] * m[14] - m[8] * m[2] * m[15] +
			m[8] * m[3] * m[14] + m[12] * m[2] * m[11] - m[12] * m[3] * m[10];
		inv[9] = -m[0] * m[9] * m[15] + m[0] * m[11] * m[13] + m[8] * m[1] * m[15] -
			m[8] * m[3] * m[13] - m[12] * m[1] * m[11] + m[12] * m[3] * m[9];
		inv[13] = m[0] * m[9] * m[14] - m[0] * m[10] * m[13] - m[8] * m[1] * m[14] +
			m[8] * m[2] * m[13] + m[12] * m[1] * m[10] - m[12] * m[2] * m[9];
		inv[2] = m[1] * m[6] * m[15] - m[1] * m[7] * m[14] - m[5] * m[2] * m[15] +
			m[5] * m[3] * m[14] + m[13] * m[2] * m[7] - m[13] * m[3] * m[6];
		inv[6] = -m[0] * m[6] * m[15] + m[0] * m[7] * m[14] + m[4] * m[2] * m[15] -
			m[4] * m[3] * m[14] - m[12] * m[2] * m[7] + m[12] * m[3] * m[6];
		inv[10] = m[0] * m[5] * m[15] - m[0] * m[7] * m[13] - m[4] * m[1] * m[15] +
			m[4] * m[3] * m[13] + m[12] * m[1] * m[7] - m[12] * m[3] * m[5];
		inv[14] = -m[0] * m[5] * m[14] + m[0] * m[6] * m[13] + m[4] * m[1] * m[14] -
			m[4] * m[2] * m[13] - m[12] * m[1] * m[6] + m[12] * m[2] * m[5];
		inv[3] = -m[1] * m[6] * m[11] + m[1] * m[7] * m[10] + m[5] * m[2] * m[11] -
			m[5] * m[3] * m[10] - m[9] * m[2] * m[7] + m[9] * m[3] * m[6];
		inv[7] = m[0] * m[6] * m[11] - m[0] * m[7] * m[10] - m[4] * m[2] * m[11] +
			m[4] * m[3] * m[10] + m[8] * m[2] * m[7] - m[8] * m[3] * m[6];
		inv[11] = -m[0] * m[5] * m[11] + m[0] * m[7] * m[9] + m[4] * m[1] * m[11] -
			m[4] * m[3] * m[9] - m[8] * m[1] * m[7] + m[8] * m[3] * m[5];
		inv[15] = m[0] * m[5] * m[10] - m[0] * m[6] * m[9] - m[4] * m[1] * m[10] +
			m[4] * m[2] * m[9] + m[8] * m[1] * m[6] - m[8] * m[2] * m[5];

		let det = m[0] * inv[0] + m[1] * inv[4] + m[2] * inv[8] + m[3] * inv[12];
		if(det == 0) return false;
		det = 1.0 / det;
		for(let i = 0; i < 16; i++) inverse[i] = inv[i] * det;
		return true;
	}
}

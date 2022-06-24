/**
 * loads compiles and returns shaders for use
 * @param gl webgl context
 * @param source shader source code
 * @param type type of shader (vertex or fragment)
 */
export function loadShader(gl: WebGLRenderingContext, source: string, type: GLenum): WebGLShader {
	const shader = gl.createShader(type);
	if(!shader) {
		throw new Error(`failed to create shader of type ${type}`);
	}
	gl.shaderSource(shader, source);
	gl.compileShader(shader);

	if(gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		return shader;
	} else {
		gl.deleteShader(shader);
		throw new Error(`${gl.getShaderInfoLog(shader)}`);
	}
}

/**
 *	creates and returns the program
 * @param gl webgl context
 * @param vertexSrc vertex shader source
 * @param fragmentSrc fragment shader source
 */
export function createProgram(gl: WebGLRenderingContext, vertexSrc: string, fragmentSrc: string): WebGLProgram {
	// create shaders
	const vertex = loadShader(gl, vertexSrc, gl.VERTEX_SHADER);
	const fragment = loadShader(gl, fragmentSrc, gl.FRAGMENT_SHADER);

	// create program
	const program = gl.createProgram();
	if(!program) {
		throw new Error('failed to create program');
	}

	// attach shaders
	gl.attachShader(program, vertex);
	gl.attachShader(program, fragment);

	// link the program
	gl.linkProgram(program);

	// check the results
	if(gl.getProgramParameter(program, gl.LINK_STATUS)) {
		return program;
	} else {
		gl.deleteProgram(program);
		throw new Error('Program did not link');
	}
}

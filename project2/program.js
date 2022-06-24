/* eslint no-unused-vars: ["warn", {"varsIgnorePattern": "createProgram"}] */

/**
 * Creates a shader based on the source code.
 *
 * @param {WebGLRenderingContext} gl WebGL context
 * @param {string} source Source code for the shader.
 * @param {number} type Type of shader to create.
 *
 * @return {WebGLShader} Shader created from the code or null.
 */
function loadShader(gl, source, type) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    // console.warn(gl.getShaderParameter(shader, gl.COMPILE_STATUS));
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        // console.warn(source);
        return null;
    }

    return shader;
}

/**
 * Creates a program that uses the provided shaders.
 *
 * @param {WebGLRenderingContext} gl WebGL context
 * @param {string} vertexScr Source code for the vertex shader.
 * @param {string} fragScr Source code for the fragment shader.
 *
 * @return {WebGLProgram} Program created using the shaders or null.
 */
function createProgram(gl, vertexScr, fragScr) {
    const vertex = loadShader(gl, vertexScr, gl.VERTEX_SHADER);
    const frag = loadShader(gl, fragScr, gl.FRAGMENT_SHADER);

    const prog = gl.createProgram();
    gl.attachShader(prog, vertex);
    gl.attachShader(prog, frag);
    gl.linkProgram(prog);

    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        gl.deleteProgram(prog);

        return null;
    }

    return prog;
}

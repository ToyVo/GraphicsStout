// created by Thorsten Thormaehlen for educational purpose

function Renderer(canvasName, vertSrc, fragSrc) {
    // public member
    this.t = 0.0;
    this.modeVal = 1;
    this.lightPos = [1.0, 1.0, -1.0];
    this.lightVec = new Float32Array(3);
    this.ambientColor = [0.2, 0.1, 0.0];
    this.diffuseColor = [0.8, 0.4, 0.0];
    this.specularColor = [1.0, 1.0, 1.0];
    this.clearColor = [0.0, 0.4, 0.7];
    this.attenuation = 0.01;
    this.shininess = 80.0;
    this.kaVal = 1.0;
    this.kdVal = 1.0;
    this.ksVal = 1.0;

    // private members (inside closure)
    // let canvasName = canvasName;
    // let vertSrc = vertSrc;
    // let fragSrc = fragSrc;
    let canvas;
    let gl;
    let sceneVertNo = 0;
    let bufID;
    let progID = 0;
    let vertID = 0;
    let fragID = 0;
    let vertexLoc = 0;
    let texCoordLoc = 0;
    let normalLoc = 0;
    let projectionLoc = 0;
    let modelviewLoc = 0;
    let normalMatrixLoc = 0;
    let modeLoc = 0;
    let kaLoc = 0;
    let kdLoc = 0;
    let ksLoc = 0;
    let attenuationLoc = 0;
    let shininessLoc = 0;
    let lightPosLoc = 0;
    let lightVecLoc = 0;
    let ambientColorLoc = 0;
    let diffuseColorLoc = 0;
    let specularColorLoc = 0;
    let projection = new Float32Array(16);
    let modelview = new Float32Array(16);
    let currentFileName = './knot.txt';

    // public
    this.updateShader = function (newvertSrc, newfragSrc) {
        vertSrc = newvertSrc;
        fragSrc = newfragSrc;

        gl.deleteProgram(progID);
        gl.deleteShader(vertID);
        gl.deleteShader(fragID);

        setupShaders();
    };

    // public
    this.updateModel = function (newFileName) {
        currentFileName = newFileName;

        gl.deleteProgram(progID);
        gl.deleteShader(vertID);
        gl.deleteShader(fragID);
        gl.deleteBuffer(bufID);

        this.init();
    };

    // public
    this.init = function () {
        this.canvas = window.document.getElementById(canvasName);
        try {
            gl = this.canvas.getContext('experimental-webgl');
        } catch (e) {
            console.error(e);
        }
        if (!gl) {
            window.alert('Error: Could not retrieve WebGL Context');
            return;
        }

        gl.enable(gl.DEPTH_TEST);
        setupShaders();

        // generate a Vertex Buffer Object (VBO)
        bufID = gl.createBuffer();

        let sceneVertexData = loadVertexData(currentFileName);
        sceneVertNo = sceneVertexData.length / (3 + 2 + 3);

        gl.bindBuffer(gl.ARRAY_BUFFER, bufID);
        gl.bufferData(gl.ARRAY_BUFFER, sceneVertexData, gl.STATIC_DRAW);

        let offset;
        let stride;
        if (vertexLoc != -1) {
            // position
            offset = 0;
            stride = (3 + 2 + 3) * Float32Array.BYTES_PER_ELEMENT;
            gl.vertexAttribPointer(vertexLoc, 3, gl.FLOAT, false, stride, offset);
            gl.enableVertexAttribArray(vertexLoc);
        }
        if (texCoordLoc != -1) {
            // texCoord
            offset = 0 + 3 * Float32Array.BYTES_PER_ELEMENT;
            gl.vertexAttribPointer(texCoordLoc, 2, gl.FLOAT, false, stride, offset);
            gl.enableVertexAttribArray(texCoordLoc);
        }
        if (normalLoc != -1) {
            // normal
            offset = 0 + (3 + 2) * Float32Array.BYTES_PER_ELEMENT;
            gl.vertexAttribPointer(normalLoc, 3, gl.FLOAT, false, stride, offset);
            gl.enableVertexAttribArray(normalLoc);
        }
        this.resize(this.canvas.width, this.canvas.height);
    };

    function loadVertexData(filename) {
        let data = new Float32Array(0);
        let request = new XMLHttpRequest();
        request.open('GET', filename, false);
        request.send(); // "false" above, will block

        if (request.status != 200) {
            alert('can not load file ' + filename);
        } else {
            let floatVals = request.responseText.split('\n');
            let numFloats = parseInt(floatVals[0]);
            if (numFloats % (3 + 2 + 3) != 0) return data;
            data = new Float32Array(numFloats);
            for (let k = 0; k < numFloats; k++) {
                data[k] = floatVals[k + 1];
            }
        }
        return data;
    }

    // public
    this.resize = function (w, h) {
        gl.viewport(0, 0, w, h);

        // this function replaces gluPerspective
        mat4Perspective(projection, 32.0, w / h, 0.5, 4.0);
        // mat4Print(projection);
    };

    // public
    this.display = function () {
        gl.clearColor(this.clearColor[0], this.clearColor[1], this.clearColor[2], 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        // camera orbits in the z=1.5 plane
        // and looks at the origin
        // mat4LookAt replaces gluLookAt
        let rad = Math.PI / 180.0 * this.t;

        mat4LookAt(modelview,
            1.5 * Math.cos(rad), 1.5 * Math.sin(rad), 1.5, // eye
            0.0, 0.0, 0.0, // look at
            0.0, 0.0, 1.0); // up

        // mat4Print(modelview);

        let modelviewInv = new Float32Array(16);
        let normalmatrix = new Float32Array(16);
        mat4Invert(modelview, modelviewInv);
        mat4Transpose(modelviewInv, normalmatrix);

        gl.useProgram(progID);

        // load the current projection and modelview matrix into the
        // corresponding UNIFORM variables of the shader
        gl.uniformMatrix4fv(projectionLoc, false, projection);
        gl.uniformMatrix4fv(modelviewLoc, false, modelview);
        if (normalMatrixLoc != -1) gl.uniformMatrix4fv(normalMatrixLoc, false, normalmatrix);
        if (modeLoc != -1) gl.uniform1i(modeLoc, this.modeVal);
        if (kaLoc != -1) gl.uniform1f(kaLoc, this.kaVal);
        if (kdLoc != -1) gl.uniform1f(kdLoc, this.kdVal);
        if (ksLoc != -1) gl.uniform1f(ksLoc, this.ksVal);
        if (attenuationLoc != -1) gl.uniform1f(attenuationLoc, this.attenuation);
        if (shininessLoc != -1) gl.uniform1f(shininessLoc, this.shininess);
        if (lightPosLoc != -1) gl.uniform3fv(lightPosLoc, this.lightPos);
        if (lightVecLoc != -1) gl.uniform3fv(lightVecLoc, this.lightVec);
        if (ambientColorLoc != -1) gl.uniform3fv(ambientColorLoc, this.ambientColor);
        if (diffuseColorLoc != -1) gl.uniform3fv(diffuseColorLoc, this.diffuseColor);
        if (specularColorLoc != -1) gl.uniform3fv(specularColorLoc, this.specularColor);

        gl.bindBuffer(gl.ARRAY_BUFFER, bufID);
        gl.drawArrays(gl.TRIANGLES, 0, sceneVertNo);
    };

    // private
    function setupShaders() {
        // create shader
        vertID = gl.createShader(gl.VERTEX_SHADER);
        fragID = gl.createShader(gl.FRAGMENT_SHADER);

        // specify shader source
        gl.shaderSource(vertID, vertSrc);
        gl.shaderSource(fragID, fragSrc);

        // compile the shader
        gl.compileShader(vertID);
        gl.compileShader(fragID);

        let error = false;
        // check for errors
        if (!gl.getShaderParameter(vertID, gl.COMPILE_STATUS)) {
            document.getElementById('code_vert_error').innerHTML = 'invalid vertex shader : ' + gl.getShaderInfoLog(vertID);
            error = true;
        } else {
            document.getElementById('code_vert_error').innerHTML = '';
        }
        if (!gl.getShaderParameter(fragID, gl.COMPILE_STATUS)) {
            document.getElementById('code_frag_error').innerHTML = 'invalid fragment shader : ' + gl.getShaderInfoLog(fragID);
            error = true;
        } else {
            document.getElementById('code_frag_error').innerHTML = '';
        }

        if (error) return;

        // create program and attach shaders
        progID = gl.createProgram();
        gl.attachShader(progID, vertID);
        gl.attachShader(progID, fragID);

        // link the program
        gl.linkProgram(progID);
        if (!gl.getProgramParameter(progID, gl.LINK_STATUS)) {
            alert(gl.getProgramInfoLog(progID));
            return;
        }

        // retrieve the location of the IN variables of the vertex shader
        vertexLoc = gl.getAttribLocation(progID, 'position');
        texCoordLoc = gl.getAttribLocation(progID, 'texCoord');
        normalLoc = gl.getAttribLocation(progID, 'normal');

        // retrieve the location of the UNIFORM variables of the shader
        projectionLoc = gl.getUniformLocation(progID, 'projection');
        modelviewLoc = gl.getUniformLocation(progID, 'modelview');
        normalMatrixLoc = gl.getUniformLocation(progID, 'normalMat');
        modeLoc = gl.getUniformLocation(progID, 'mode');
        lightPosLoc = gl.getUniformLocation(progID, 'lightPos');
        lightVecLoc = gl.getUniformLocation(progID, 'lightVec');
        ambientColorLoc = gl.getUniformLocation(progID, 'ambientColor');
        diffuseColorLoc = gl.getUniformLocation(progID, 'diffuseColor');
        specularColorLoc = gl.getUniformLocation(progID, 'specularColor');
        shininessLoc = gl.getUniformLocation(progID, 'shininessVal');
        attenuationLoc = gl.getUniformLocation(progID, 'attenuationVal');
        kaLoc = gl.getUniformLocation(progID, 'Ka');
        kdLoc = gl.getUniformLocation(progID, 'Kd');
        ksLoc = gl.getUniformLocation(progID, 'Ks');
    }

    // the following functions are some matrix and vector helpers
    // they work for this demo but in general it is recommended
    // to use more advanced matrix libraries
    function vec3Dot(a, b) {
        return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    }

    function vec3Cross(a, b, res) {
        res[0] = a[1] * b[2] - b[1] * a[2];
        res[1] = a[2] * b[0] - b[2] * a[0];
        res[2] = a[0] * b[1] - b[0] * a[1];
    }

    function vec3Normalize(a) {
        let mag = Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2]);
        a[0] /= mag; a[1] /= mag; a[2] /= mag;
    }

    function mat4Identity(a) {
        a.length = 16;
        for (let i = 0; i < 16; ++i) a[i] = 0.0;
        for (let i = 0; i < 4; ++i) a[i + i * 4] = 1.0;
    }

    function mat4Multiply(a, b, res) {
        for (let i = 0; i < 4; ++i) {
            for (let j = 0; j < 4; ++j) {
                res[j * 4 + i] = 0.0;
                for (let k = 0; k < 4; ++k) {
                    res[j * 4 + i] += a[k * 4 + i] * b[j * 4 + k];
                }
            }
        }
    }

    function mat4Perspective(a, fov, aspect, zNear, zFar) {
        let f = 1.0 / Math.tan(fov / 2.0 * (Math.PI / 180.0));
        mat4Identity(a);
        a[0] = f / aspect;
        a[1 * 4 + 1] = f;
        a[2 * 4 + 2] = (zFar + zNear) / (zNear - zFar);
        a[3 * 4 + 2] = (2.0 * zFar * zNear) / (zNear - zFar);
        a[2 * 4 + 3] = -1.0;
        a[3 * 4 + 3] = 0.0;
    }

    function mat4LookAt(viewMatrix,
        eyeX, eyeY, eyeZ,
        centerX, centerY, centerZ,
        upX, upY, upZ) {
        let dir = new Float32Array(3);
        let right = new Float32Array(3);
        let up = new Float32Array(3);
        let eye = new Float32Array(3);

        up[0] = upX; up[1] = upY; up[2] = upZ;
        eye[0] = eyeX; eye[1] = eyeY; eye[2] = eyeZ;

        dir[0] = centerX - eyeX; dir[1] = centerY - eyeY; dir[2] = centerZ - eyeZ;
        vec3Normalize(dir);
        vec3Cross(dir, up, right);
        vec3Normalize(right);
        vec3Cross(right, dir, up);
        vec3Normalize(up);
        // first row
        viewMatrix[0] = right[0];
        viewMatrix[4] = right[1];
        viewMatrix[8] = right[2];
        viewMatrix[12] = -vec3Dot(right, eye);
        // second row
        viewMatrix[1] = up[0];
        viewMatrix[5] = up[1];
        viewMatrix[9] = up[2];
        viewMatrix[13] = -vec3Dot(up, eye);
        // third row
        viewMatrix[2] = -dir[0];
        viewMatrix[6] = -dir[1];
        viewMatrix[10] = -dir[2];
        viewMatrix[14] = vec3Dot(dir, eye);
        // forth row
        viewMatrix[3] = 0.0;
        viewMatrix[7] = 0.0;
        viewMatrix[11] = 0.0;
        viewMatrix[15] = 1.0;
    }

    function mat4Print(a) {
        // opengl uses column major order
        let out = '';
        for (let i = 0; i < 4; ++i) {
            for (let j = 0; j < 4; ++j) {
                out += a[j * 4 + i] + ' ';
            }
            out += '\n';
        }
        alert(out);
    }

    function mat4Transpose(a, transposed) {
        let t = 0;
        for (let i = 0; i < 4; ++i) {
            for (let j = 0; j < 4; ++j) {
                transposed[t++] = a[j * 4 + i];
            }
        }
    }

    function mat4Invert(m, inverse) {
        let inv = new Float32Array(16);
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
        if (det == 0) return false;
        det = 1.0 / det;
        for (let i = 0; i < 16; i++) inverse[i] = inv[i] * det;
        return true;
    }
}

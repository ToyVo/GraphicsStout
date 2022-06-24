/* eslint no-unused-vars: ["warn", {"varsIgnorePattern": "(Matrix)|(Vector)"}] */

/**
 * Represents a 4x4 matrix suitable for performing transformations
 * on a vector of homogeneous coordinates.
 */
class Matrix {
    /**
     * Creates a 4x4 matrix. If no parameter is given, the identity
     * matrix is created. If values is provided it should be an array
     * and it will provide UP TO 16 values for the matrix. If there are
     * less than 16 values, the remaining values in the array should
     * correspond to the identify matrix. If there are more than 16,
     * the rest should be ignored.
     *
     * The data is assumed to be in COLUMN MAJOR order.
     *
     * To see if values was passed to the function, you can check if
     *      typeof values !== "undefined"
     * This will be true if values has a value.
     *
     * @param {number[]} values (optional) An array of floating point values.
     *
     */
    constructor(values) {
        this.matrix = [
            1.0, 0.0, 0.0, 0.0,
            0.0, 1.0, 0.0, 0.0,
            0.0, 0.0, 1.0, 0.0,
            0.0, 0.0, 0.0, 1.0
        ];
        if (typeof values !== 'undefined') {
            // addes the values from the given values to the matrix, will be in row major order
            let length = values.length;
            if (length > 16) {
                length = 16;
            }
            for (let i = 0; i < length; i++) {
                this.matrix[i] = values[i];
            }
            // transposes the matrix so that it is in column major order
            for (let n = 0; n < 3; n++) {
                for (let m = n + 1; m < 4; m++) {
                    let num = this.matrix[n * 4 + m];
                    this.matrix[n * 4 + m] = this.matrix[m * 4 + n];
                    this.matrix[m * 4 + n] = num;
                }
            }
        }
    }

    /**
     * Returns a Float32Array array with the data from the matrix. The
     * data should be in COLUMN MAJOR form.
     *
     * @return {Float32Array} Array with the matrix data.
     */
    getData() {
        return new Float32Array(this.matrix);
    }

    /**
     * Gets a value from the matrix at position (r, c).
     *
     * @param {number} r Row number (0-3) of value in the matrix.
     * @param {number} c Column number (0-3) of value in the matrix.
     */
    getValue(r, c) {
        return this.matrix[c * 4 + r];
    }

    /**
     * Updates a single position (r, c) in the matrix with value.
     *
     * @param {number} r Row number (0-3) of value in the matrix.
     * @param {number} c Column number (0-3) of value in the matrix.
     * @param {number} value Value to place in the matrix.
     */
    setValue(r, c, value) {
        this.matrix[c * 4 + r] = value;
    }

    /**
     * Resets the matrix to be the identity matrix.
     */
    identity() {
        this.matrix = [
            1.0, 0.0, 0.0, 0.0,
            0.0, 1.0, 0.0, 0.0,
            0.0, 0.0, 1.0, 0.0,
            0.0, 0.0, 0.0, 1.0
        ];
    }

    /**
     * Multiplies the current matrix by the parameter matrix and returns the result.
     * This operation should not change the current matrix or the parameter.
     *
     * @param {Matrix} matB Matrix to post-multiply the current matrix by.
     *
     * @return {Matrix} Product of the current matrix and the parameter.
     */
    mult(matB) {
        // TODO
        let matC = new Matrix();
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                let sum = 0;
                for (let k = 0; k < 4; k++) {
                    sum += this.getValue(i, k) * matB.getValue(k, j);
                }
                matC.setValue(i, j, sum);
            }
        }
        return matC;
    }

    /**
     * Creates a new Matrix that is the current matrix translated by
     * the parameters.
     *
     * This should not change the current matrix.
     *
     * @param {number} x Amount to translate in the x direction.
     * @param {number} y Amount to translate in the y direction.
     * @param {number} z Amount to translate in the z direction.
     *
     * @return {Matrix} Result of translating the current matrix.
     */
    translate(x, y, z) {
        let translation = new Matrix([
            1, 0, 0, x,
            0, 1, 0, y,
            0, 0, 1, z,
            0, 0, 0, 1
        ]);
        return this.mult(translation);
    }

    /**
     * Rotatation around the x-axis. If provided, the rotation is done around
     * the point (x, y, z). By default, that point is the origin.
     *
     * This should not change the current matrix.
     *
     * @param {number} theta Amount in DEGREES to rotate around the x-axis.
     * @param {number} x x coordinate of the point around which to rotate. Defaults to 0.
     * @param {number} y y coordinate of the point around which to rotate. Defaults to 0.
     * @param {number} z z coordinate of the point around which to rotate. Defaults to 0.
     *
     * @return {Matrix} Result of rotating the current matrix.
     */
    rotateX(theta, x = 0, y = 0, z = 0) {
        theta = theta * Math.PI / 180;
        let transform = new Matrix([
            1.0, 0.0, 0.0, 0.0,
            0.0, Math.cos(theta), -Math.sin(theta), 0.0,
            0.0, Math.sin(theta), Math.cos(theta), 0.0,
            0.0, 0.0, 0.0, 1.0
        ]);
        return this.translate(x, y, z).mult(transform).translate(-x, -y, -z);
    }

    /**
     * Rotatation around the y-axis. If provided, the rotation is done around
     * the point (x, y, z). By default, that point is the origin.
     *
     * This should not change the current matrix.
     *
     * @param {number} theta Amount in DEGREES to rotate around the y-axis.
     * @param {number} x x coordinate of the point around which to rotate. Defaults to 0.
     * @param {number} y y coordinate of the point around which to rotate. Defaults to 0.
     * @param {number} z z coordinate of the point around which to rotate. Defaults to 0.
     *
     * @return {Matrix} Result of rotating the current matrix.
     */
    rotateY(theta, x = 0, y = 0, z = 0) {
        theta = theta * Math.PI / 180;
        let transform = new Matrix([
            Math.cos(theta), 0.0, Math.sin(theta), 0.0,
            0.0, 1.0, 0.0, 0.0,
            -Math.sin(theta), 0.0, Math.cos(theta), 0.0,
            0.0, 0.0, 0.0, 1.0
        ]);
        return this.translate(x, y, z).mult(transform).translate(-x, -y, -z);
    }

    /**
     * Rotatation around the z-axis. If provided, the rotation is done around
     * the point (x, y, z). By default, that point is the origin.
     *
     * This should not change the current matrix.
     *
     * @param {number} theta Amount in DEGREES to rotate around the z-axis.
     * @param {number} x x coordinate of the point around which to rotate. Defaults to 0.
     * @param {number} y y coordinate of the point around which to rotate. Defaults to 0.
     * @param {number} z z coordinate of the point around which to rotate. Defaults to 0.
     *
     * @return {Matrix} Result of rotating the current matrix.
     */
    rotateZ(theta, x = 0, y = 0, z = 0) {
        theta = theta * Math.PI / 180;
        let transform = new Matrix([
            Math.cos(theta), -Math.sin(theta), 0.0, 0.0,
            Math.sin(theta), Math.cos(theta), 0.0, 0.0,
            0.0, 0.0, 1.0, 0.0,
            0.0, 0.0, 0.0, 1.0
        ]);
        return this.translate(x, y, z).mult(transform).translate(-x, -y, -z);
    }

    /**
     * Rotatation around the z-axis followed by a rotation around the y-axis and then
     * the z-axis. If provided, the rotation is done around the point (x, y, z).
     * By default, that point is the origin.
     *
     * The rotation must be done in order z-axis, y-axis, x-axis.
     *
     * This should not change the current matrix.
     *
     * @param {number} thetax Amount in DEGREES to rotate around the x-axis.
     * @param {number} thetay Amount in DEGREES to rotate around the y-axis.
     * @param {number} thetaz Amount in DEGREES to rotate around the z-axis.
     * @param {number} x x coordinate of the point around which to rotate. Defaults to 0.
     * @param {number} y y coordinate of the point around which to rotate. Defaults to 0.
     * @param {number} z z coordinate of the point around which to rotate. Defaults to 0.
     *
     * @return {Matrix} Result of rotating the current matrix.
     */
    rotate(thetax, thetay, thetaz, x = 0, y = 0, z = 0) {
        // TODO
        return this.rotateX(thetax, x, y, z).rotateY(thetay, x, y, z).rotateZ(thetaz, x, y, z);
    }

    /**
     * Scaling relative to a point. If provided, the scaling is done relative to
     * the point (x, y, z). By default, that point is the origin.
     *
     * This should not change the current matrix.
     *
     * @param {number} sx Amount to scale in the x direction.
     * @param {number} sy Amount to scale in the y direction.
     * @param {number} sz Amount to scale in the z direction.
     * @param {number} x x coordinate of the point around which to scale. Defaults to 0.
     * @param {number} y y coordinate of the point around which to scale. Defaults to 0.
     * @param {number} z z coordinate of the point around which to scale. Defaults to 0.
     *
     * @return {Matrix} Result of scaling the current matrix.
     */
    scale(sx, sy, sz, x = 0, y = 0, z = 0) {
        // TODO
        let transform = new Matrix([
            sx, 0.0, 0.0, 0.0,
            0.0, sy, 0.0, 0.0,
            0.0, 0.0, sz, 0.0,
            0.0, 0.0, 0.0, 1.0
        ]);
        return this.translate(x, y, z).mult(transform).translate(-x, -y, -z);
    }

    /**
     * Prints the matrix as an HTML table.
     *
     * @return {string} HTML table with the contents of the matrix.
     */
    asHTML() {
        let output = '<table>';

        for (let r = 0; r < 4; r++) {
            output += '<tr>';

            for (let c = 0; c < 4; c++) {
                output += '<td>' + this.getValue(r, c).toFixed(2) + '</td>';
            }

            output += '</tr>';
        }

        output += '</table>';

        return output; // TODO
    }
}

/**
 * Represents a vector in 3d space.
 */
class Vector {
    /**
     * Creates a vector. If no parameter is given, the vector is set to
     * all 0's. If values is provided it should be an array
     * and it will provide UP TO 3 values for the vector. If there are
     * less than 3 values, the remaining values in the array should
     * set to 0. If there are more than 3, the rest should be ignored.
     *
     * To see if values was passed to the function, you can check if
     *      typeof values !== "undefined"
     * This will be true if values has a value.
     *
     * @param {number[]} values (optional) An array of floating point values.
     *
     */
    constructor(values) {
        this.vector = [0.0, 0.0, 0.0];
        if (typeof values !== 'undefined') {
            let length = values.length;
            if (length > 3) {
                length = 3;
            }
            for (let i = 0; i < length; i++) {
                this.vector[i] = values[i];
            }
        }
    }

    /**
     * Calculates the cross product of the current vector and the parameter.
     *
     * This should not change the current vector or the parameter.
     *
     * @param {Vector} v Vector to cross with the current vector.
     *
     * @return {Vector} The cross product of the current vector and the parameter.
     */
    crossProduct(v) {
        // TODO
        let s1 = this.getY() * v.getZ() - this.getZ() * v.getY();
        let s2 = this.getZ() * v.getX() - this.getX() * v.getZ();
        let s3 = this.getX() * v.getY() - this.getY() * v.getX();
        return new Vector([s1, s2, s3]);
    }

    /**
     * Calculates the dot product of the current vector and the parameter.
     *
     * This should not change the current vector or the parameter.
     *
     * @param {Vector} v Vector to dot with the current vector.
     *
     * @return {number} The dot product of the current vector and the parameter.
     */
    dotProduct(v) {
        // TODO
        return this.getX() * v.getX() + this.getY() * v.getY() + this.getZ() * v.getZ();
    }

    /**
     * Normalized the current vector so that is has a
     * length of 1.
     */
    normalize() {
        // TODO
        let length = this.length();
        if (length !== 0) {
            let newVector = [this.getX() / length, this.getY() / length, this.getZ() / length];
            // console.log(newVector + " newVector");
            this.vector = newVector;
            // console.log(this.vector + " this.vector");
        }
    }

    /**
     * Gets the length (magnitude) of the current vector.
     *
     * @return {number} The length of the current vector.
     */
    length() {
        return Math.sqrt(this.getX() * this.getX() + this.getY() * this.getY() + this.getZ() * this.getZ());
    }

    /**
     * Scales the current vector by amount s.
     *
     * @param {number} s Amount to scale the vector.
     */
    scale(s) {
        // TODO
        this.vector = [this.getX() * s, this.getY() * s, this.getZ() * s];
    }

    /**
     * Returns the x value of the vector.
     *
     * @return {number} The x value of the vector.
     */
    getX() {
        // TODO
        return this.vector[0];
    }

    /**
     * Returns the y value of the vector.
     *
     * @return {number} The y value of the vector.
     */
    getY() {
        // TODO
        return this.vector[1];
    }

    /**
     * Returns the z value of the vector.
     *
     * @return {number} The z value of the vector.
     */
    getZ() {
        // TODO
        return this.vector[2];
    }

    /**
     * Returns a Float32Array with the contents of the vector. The
     * data in the vector should be in the order [x, y, z, w]. This
     * makes it suitable for multiplying by a 4x4 matrix.
     *
     * The w value should always be 0.
     *
     * @return {Float32Array} The vector as a 4 element array.
     */
    getData() {
        // TODO
        return new Float32Array([this.vector[0], this.vector[1], this.vector[2], 0]);
    }
}

/**
 * Represents a vector in 3d space.
 */
export default class Vector {
	private readonly data: Float32Array;

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
	 * @param values An array of floating point values.
	 *
	 */
	constructor(values?: Float32Array) {
		this.data = new Float32Array([0, 0, 0, 0]);

		if(values) {
			for(let i = 0; i < values.length && i < 3; i++) {
				this.data[i] = values[i];
			}
		}
	}

	/**
	 * Calculates the cross product of the current vector and the parameter.
	 *
	 * This should not change the current vector or the parameter.
	 *
	 * @param v Vector to cross with the current vector.
	 *
	 * @return The cross product of the current vector and the parameter.
	 */
	crossProduct(v: Vector): Vector {
		return new Vector(new Float32Array([
			this.data[1] * v.data[2] - this.data[2] * v.data[1],
			this.data[2] * v.data[0] - this.data[0] * v.data[2],
			this.data[0] * v.data[1] - this.data[1] * v.data[0]
		]));
	}

	/**
	 * Calculates the dot product of the current vector and the parameter.
	 *
	 * This should not change the current vector or the parameter.
	 *
	 * @param v Vector to dot with the current vector.
	 *
	 * @return The dot product of the current vector and the parameter.
	 */
	dotProduct(v: Vector): number {
		return this.data[0] * v.data[0] +
			this.data[1] * v.data[1] +
			this.data[2] * v.data[2];
	}

	/**
	 * Normalized the current vector so that is has a
	 * length of 1.
	 */
	normalize() {
		const len = this.length();

		if(len !== 0) {
			for(let i = 0; i < 3; i++) {
				this.data[i] /= len;
			}
		}
	}

	/**
	 * Gets the length (magnitude) of the current vector.
	 *
	 * @return The length of the current vector.
	 */
	length(): number {
		return Math.sqrt(this.data[0] * this.data[0] +
			this.data[1] * this.data[1] +
			this.data[2] * this.data[2]);
	}

	/**
	 * Scales the current vector by amount s.
	 *
	 * @param s Amount to scale the vector.
	 */
	scale(s: number) {
		for(let i = 0; i < 3; i++) {
			this.data[i] *= s;
		}
	}

	/**
	 * Returns the x value of the vector.
	 *
	 * @return The x value of the vector.
	 */
	getX(): number {
		return this.data[0];
	}

	/**
	 * Returns the y value of the vector.
	 *
	 * @return The y value of the vector.
	 */
	getY(): number {
		return this.data[1];
	}

	/**
	 * Returns the z value of the vector.
	 *
	 * @return The z value of the vector.
	 */
	getZ(): number {
		return this.data[2];
	}

	/**
	 * Returns a Float32Array with the contents of the vector. The
	 * data in the vector should be in the order [x, y, z, w]. This
	 * makes it suitable for multiplying by a 4x4 matrix.
	 *
	 * The w value should always be 0.
	 *
	 * @return The vector as a 4 element array.
	 */
	getData(): Float32Array {
		return this.data;
	}
}

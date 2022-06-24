// testing the constructor to make sure that it will
// convert from row to column major order
function testMatrixContructor() {
	const test = new Matrix([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
	console.log(test.getData());
}

// testing a matrix to make sure that it scales correct
function testScale() {
	const test = new Matrix([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
	const transform = new Matrix([
		2, 0.0, 0.0, 0.0,
		0.0, 2, 0.0, 0.0,
		0.0, 0.0, 2, 0.0,
		0.0, 0.0, 0.0, 1.0
	]);
	console.log(test.mult(transform).getData());
	console.log(test.scale(2, 2, 2).getData());
}

// testing my mulitiplication algorithm against manual multiplication
function testMultiplyMatrix() {
	const test1 = new Matrix([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
	const test2 = new Matrix([16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31]);
	console.log(test1.mult(test2).getData());
}

// testing the translate to make sure it moves
function testTranslate() {
	const test = new Matrix([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
	const transform = new Matrix([
		1, 0.0, 0.0, 2.0,
		0.0, 1, 0.0, 2.0,
		0.0, 0.0, 1, 2.0,
		0.0, 0.0, 0.0, 1.0
	]);
	console.log(test.mult(transform).getData());
	console.log(test.translate(2, 2, 2).getData());
}

// testing how my rotation works compared to doing it manually
function testRotateX() {
	const test = new Matrix([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
	const transform = new Matrix([
		1, 0, 0, 0,
		0, Math.cos(2), -Math.sin(2), 0,
		0, Math.sin(2), Math.cos(2), 0,
		0, 0, 0, 1
	]);
	console.log(test.mult(transform).getData());
	console.log(test.rotateX(2).getData());
}

function testRotateY() {
	const test = new Matrix([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
	const transform = new Matrix([
		Math.cos(2), 0, Math.sin(2), 0,
		0, 1, 0, 0,
		-Math.sin(2), 0, Math.cos(2), 0,
		0, 0, 0, 1
	]);
	console.log(test.mult(transform).getData());
	console.log(test.rotateY(2).getData());
}

function testRotateZ() {
	const test = new Matrix([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
	const transform = new Matrix([
		Math.cos(2), -Math.sin(2), 0, 0,
		Math.sin(2), Math.cos(2), 0, 0,
		0, 0, 1, 0,
		0, 0, 0, 1
	]);
	console.log(test.mult(transform).getData());
	console.log(test.rotateY(2).getData());
}

function testVectorConstructor() {
	const v1 = new Vector();
	const v2 = new Vector([1, 2, 3]);
	console.log('vector constructor');
	console.log(v1.getData());
	console.log(v2.getData());
}

// test vector dot product
function testVectorDot() {
	const vec1 = new Vector([1, 2, 3]);
	const vec2 = new Vector([2, 2, 2]);
	console.log('vector dot product');
	console.log(vec1.dotProduct(vec2));
}

// test Vec length
function testVectorLength() {
	const vec = new Vector([2, 2, 2]);
	console.log('vector length');
	console.log(vec.length());
}

// test normalization
function testNormalize() {
	const vec = new Vector([2, 2, 2]);
	vec.normalize();
	console.log('normalized vector');
	console.log(vec.getData());
}

// test cross product
function testCrossProduct() {
	const vec1 = new Vector([1, 2, 3]);
	const vec2 = new Vector([2, 2, 2]);
	console.log('cross product');
	console.log(vec1.crossProduct(vec2));
}

// test scaling
function testVectorScale() {
	const vec = new Vector([1, 1, 1]);
	vec.scale(2);
	console.log('scale vector');
	console.log(vec.getData());
}

function testGetSize() {
	console.log('get size: ');
	const tetra1 = new Tetra();
	tetra1.resize(2, 3, 4);
	console.log(tetra1.getSize());
	tetra1.resize(1, -2, 4);
	console.log(tetra1.getSize());
}

function testGetLocation() {
	console.log('get location: ');
	const tetra1 = new Tetra();
	tetra1.move(2, 3, 4);
	console.log(tetra1.getLocation());
	tetra1.move(1, -2, 4);
	console.log(tetra1.getLocation());
}

function testGetOrientation() {
	console.log('get orientation: ');
	const tetra1 = new Tetra();
	tetra1.orient(2, 3, 4);
	console.log(tetra1.getOrientation());
	tetra1.orient(1, -2, 4);
	console.log(tetra1.getOrientation());
}

function testOrtho(left, right, bottom, top, near, far) {
	const testCamera = new Camera();
	console.log(testCamera.ortho(left, right, bottom, top, near, far));
}

function testFrustum(left, right, bottom, top, near, far) {
	const testCamera = new Camera();
	console.log(testCamera.frustum(left, right, bottom, top, near, far));
}

function testLookAt(eyeLocation, locatingBeingLookedAt, upVector) {
	const testCamera = new Camera();
	console.log(testCamera.lookAt(eyeLocation, locatingBeingLookedAt, upVector));
}

function testViewPoint(location, viewNormalVector, upVector) {
	const testCamera = new Camera();
	console.log(testCamera.viewPoint(location, viewNormalVector, upVector));
}


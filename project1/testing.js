/* eslint-disable no-unused-vars */
/* global Matrix, Vector */

// testing the constructor to make sure that it will
// convert from row to column major order
function testMatrixContructor () {
    let test = new Matrix([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
    console.log(test.getData());
}

// testing a matrix to make sure that it scales correct
function testScale () {
    let test = new Matrix([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
    let transform = new Matrix([
        2, 0.0, 0.0, 0.0,
        0.0, 2, 0.0, 0.0,
        0.0, 0.0, 2, 0.0,
        0.0, 0.0, 0.0, 1.0
    ]);
    console.log(test.mult(transform).getData());
    console.log(test.scale(2, 2, 2).getData());
}

// testing my mulitiplication algorithm against manual multiplication
function testMultiplyMatrix () {
    let test1 = new Matrix([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
    let test2 = new Matrix([16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31]);
    console.log(test1.mult(test2).getData());
}

// testing the translate to make sure it moves
function testTranslate () {
    let test = new Matrix([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
    let transform = new Matrix([
        1, 0.0, 0.0, 2.0,
        0.0, 1, 0.0, 2.0,
        0.0, 0.0, 1, 2.0,
        0.0, 0.0, 0.0, 1.0
    ]);
    console.log(test.mult(transform).getData());
    console.log(test.translate(2, 2, 2).getData());
}

// testing how my rotation works compared to doing it manually
function testRotateX () {
    let test = new Matrix([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
    let transform = new Matrix([
        1, 0, 0, 0,
        0, Math.cos(2), -Math.sin(2), 0,
        0, Math.sin(2), Math.cos(2), 0,
        0, 0, 0, 1
    ]);
    console.log(test.mult(transform).getData());
    console.log(test.rotateX(2).getData());
}
function testRotateY () {
    let test = new Matrix([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
    let transform = new Matrix([
        Math.cos(2), 0, Math.sin(2), 0,
        0, 1, 0, 0,
        -Math.sin(2), 0, Math.cos(2), 0,
        0, 0, 0, 1
    ]);
    console.log(test.mult(transform).getData());
    console.log(test.rotateY(2).getData());
}
function testRotateZ () {
    let test = new Matrix([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
    let transform = new Matrix([
        Math.cos(2), -Math.sin(2), 0, 0,
        Math.sin(2), Math.cos(2), 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ]);
    console.log(test.mult(transform).getData());
    console.log(test.rotateY(2).getData());
}

function testVectorConstructor() {
    let v1 = new Vector();
    let v2 = new Vector([1, 2, 3]);
    console.log('vector constructor');
    console.log(v1.getData());
    console.log(v2.getData());
}

// test vector dot product
function testVectorDot () {
    let vec1 = new Vector([1, 2, 3]);
    let vec2 = new Vector([2, 2, 2]);
    console.log('vector dot product');
    console.log(vec1.dotProduct(vec2));
}

// test Vec length
function testVectorLength() {
    let vec = new Vector([2, 2, 2]);
    console.log('vector length');
    console.log(vec.length());
}

// test normalization
function testNormalize() {
    let vec = new Vector([2, 2, 2]);
    vec.normalize();
    console.log('normalized vector');
    console.log(vec.getData());
}

// test cross product
function testCrossProduct () {
    let vec1 = new Vector([1, 2, 3]);
    let vec2 = new Vector([2, 2, 2]);
    console.log('cross product');
    console.log(vec1.crossProduct(vec2));
}

// test scaling
function testVectorScale () {
    let vec = new Vector([1, 1, 1]);
    vec.scale(2);
    console.log('scale vector');
    console.log(vec.getData());
}

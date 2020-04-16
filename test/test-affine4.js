import test from "tape"
import * as affine4 from "../src/affine4.js"

const identity = () => new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1])
const arraySimilar = (a,b,epsilon = 1e-5) => [].every.call(a, (x,i) => Math.abs(x - b[i]) < epsilon)
const RAD45 = 45/180*Math.PI
const COSIN45 = Math.cos(RAD45)
const SIN45 = Math.sin(RAD45)

test("affine4.create", (t) => {
  t.deepEquals(affine4.create(), identity(), "create")
  t.end()
})

test("affine4.translateXYZ", (t) => {
  let out = affine4.create()
  t.deepEquals(affine4.translateXYZ(out, identity(), {x:0,y:0,z:0}), identity(), "no translation")
  t.deepEquals(affine4.translateXYZ(out, [1,2,3,4, 5,6,7,8, 9,10,11,12, 0,0,0,1], {x:-1,y:2,z:-.75}), [1,2,3,4, 5,6,7,8, 9,10,11,12, -1,2,-.75,1], "translation")
  t.end()
})

test("affine4.makeTranslateXYZ", (t) => {
  let out = affine4.create()
  t.deepEquals(affine4.makeTranslateXYZ(out, {x:0,y:0,z:0}), identity(), "no translation")
  t.deepEquals(affine4.makeTranslateXYZ(out, {x:-2,y:3,z:-4.25}), [1,0,0,0, 0,1,0,0, 0,0,1,0, -2,3,-4.25,1], "translation")
  t.end()
})

test("affine4.makeRotateX", (t) => {
  let out = affine4.create()
  let outB = affine4.create()
  t.deepLooseEqual(affine4.makeRotateX(out, 0), identity(), "no rotation")
  t.deepLooseEqual(affine4.makeRotateX(out, 0.2), affine4.makeRotateX(outB, 2*Math.PI + 0.2), "rotation")
  t.end()
})

test("affine4.makeRotateY", (t) => {
  let out = affine4.create()
  let outB = affine4.create()
  t.deepLooseEqual(affine4.makeRotateY(out, 0), identity(), "no rotation")
  t.deepLooseEqual(affine4.makeRotateY(out, 0.2), affine4.makeRotateY(outB, 2*Math.PI + 0.2), "rotation")
  t.end()
})

test("affine4.makeRotateZ", (t) => {
  let out = affine4.create()
  let outB = affine4.create()
  t.deepLooseEqual(affine4.makeRotateZ(out, 0), identity(), "no rotation")
  t.deepLooseEqual(affine4.makeRotateZ(out, 0.2), affine4.makeRotateZ(outB, 2*Math.PI + 0.2), "rotation")
  t.end()
})

test("affine4.invert", (t) => {
  let out = affine4.create()
  let outB = affine4.create()
  t.deepLooseEqual(affine4.invert(out, identity()), identity(), "identity")
  t.deepLooseEqual(affine4.invert(out, affine4.makeTranslateXYZ(out, {x:1.3, y:-9, z:2})), affine4.makeTranslateXYZ(outB, {x:-1.3, y:9, z:-2}), "translation")
  t.deepLooseEqual(affine4.invert(out, affine4.makeRotateX(out, 1.3)), affine4.makeRotateX(outB, -1.3), "rotation")
  t.deepLooseEqual(affine4.invert(out, affine4.makeScaleXYZ(out, {x:9, y:.5, z:-3})), affine4.makeScaleXYZ(outB, {x:1/9, y:1/.5, z:1/-3}), "scale")
  t.ok( arraySimilar( affine4.invert(out, [-.34,-.189,.10,0, .30,-.69,-.28,0, .23,-.12,.54,0, .07,7.8,15.3,1]), [-2.10,.47,.63,0, -1.17,-1.07,-.34,0, .64,-.44,1.51,0, -.43,15,-20.48,1], 0.02 ), "random matrix")
  t.end()
})

test("affine4.multiply", (t) => {
  let out = affine4.create()
  let outB = affine4.create()
  let outC = affine4.create()
  t.deepEquals(affine4.multiply(out, identity(), identity()), identity(), "identity")
  t.ok( arraySimilar(affine4.multiply(out, [-.34,-.189,.10,0, .30,-.69,-.28,0, .23,-.12,.54,0, .07,7.8,15.3,1], affine4.invert(out, [-.34,-.189,.10,0, .30,-.69,-.28,0, .23,-.12,.54,0, .07,7.8,15.3,1])), identity() ), "A*inv(A)")
  t.ok( arraySimilar( affine4.multiply(out, affine4.makeRotateX(out, 0.25), affine4.makeRotateX(outB, 1.25)), affine4.makeRotateX(outC, 1.5), 0.01 ), "multiply rotation")
  t.deepEquals(affine4.multiply(out, affine4.makeTranslateXYZ(out, {x:1,y:2,z:3}), affine4.makeTranslateXYZ(outB, {x:-1,y:-4,z:-12})), affine4.makeTranslateXYZ(outC, {x:0,y:-2,z:-9}), "multiply translation")
  t.end()
})

test("affine4.multiplyVecXYZ", (t) => {
  let out = {x:0,y:0,z:0}
  t.deepEquals(affine4.multiplyVecXYZ(out, identity(), {x:0,y:0,z:0}), {x:0,y:0,z:0}, "identity")

  let m = identity()
  m[12] = 6
  m[13] = -5
  m[14] = 2.5
  t.deepEquals(affine4.multiplyVecXYZ(out, m, {x:0,y:0,z:0}), {x:6,y:-5,z:2.5}, "translate only")

  m = identity()
  m[0] = 2
  m[5] = -0.5
  m[10] = 0.1
  t.ok(arraySimilar(affine4.multiplyVecXYZ(out, m, {x:1,y:1,z:1}), {x:2,y:-.5,z:.1}), "scale only")

  m = identity()
  m[0] = COSIN45, m[1] = SIN45
  m[4] = -SIN45, m[5] = COSIN45
  t.ok(arraySimilar(affine4.multiplyVecXYZ(out, m, {x:1,y:1,z:1}), {x:0,y:Math.sqrt(2),z:1}), "rotate 45 deg about z only")

  m = identity()
  m[0] = COSIN45*2, m[1] = SIN45
  m[4] = -SIN45, m[5] = COSIN45*-0.5
  m[10] = 0.1
  m[12] = 6, m[13] = -5, m[14] = 2.5
  t.ok(arraySimilar(affine4.multiplyVecXYZ(out, m, {x:1,y:1,z:1}), {x:6,y:-5-0.5*Math.sqrt(2),z:0.1}), "rotate, scale, translate")

  t.end()
})

test("affine4.invertAndMultiplyVecXYZ", (t) => {
  let out = {x:0,y:0,z:0}
  t.deepEquals(affine4.invertAndMultiplyVecXYZ(out, identity(), {x:0,y:0,z:0}), {x:0,y:0,z:0}, "inverse identity")

  let m = identity()
  m[12] = 6
  m[13] = -5
  m[14] = 2.5
  t.deepEquals(affine4.invertAndMultiplyVecXYZ(out, m, {x:0,y:0,z:0}), {x:-6,y:5,z:-2.5}, "inverse translate only")

  m = identity()
  m[0] = 2
  m[5] = -0.5
  m[10] = 0.1
  t.ok(arraySimilar(affine4.invertAndMultiplyVecXYZ(out, m, {x:1,y:1,z:1}), {x:.5,y:-2,z:10}), "inverse scale only")

  m = identity()
  m[0] = COSIN45, m[1] = SIN45
  m[4] = -SIN45, m[5] = COSIN45
  t.ok(arraySimilar(affine4.invertAndMultiplyVecXYZ(out, m, {x:1,y:1,z:1}), {x:Math.sqrt(2),y:0,z:1}), "inverse rotate 45 deg about z only")

  m = identity()
  m[0] = COSIN45*2, m[1] = SIN45
  m[4] = -SIN45, m[5] = COSIN45*-0.5
  m[10] = 0.1
  m[12] = 6, m[13] = -5, m[14] = 2.5
  t.ok(arraySimilar(affine4.multiplyVecXYZ(out, m, {x:1,y:1,z:1}), {x:-6+.5*Math.sqrt(2),y:5,z:10}), "inverse rotate, scale, translate")

  t.end()
})

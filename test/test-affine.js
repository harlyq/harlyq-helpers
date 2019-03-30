import test from "tape"
import * as affine4 from "../src/affine4.js"

const identity = () => new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1])
const arraySimilar = (a,b) => [].every.call(a, (x,i) => Math.abs(x, b[i]) < 1e-5)
const RAD45 = 45/180*Math.PI
const COSIN45 = Math.cos(RAD45)
const SIN45 = Math.sin(RAD45)

test("affine4.create", (t) => {
  t.deepEquals(affine4.create(), identity(), "create")
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

import test from "tape"
import * as overlap from "../src/overlap.js"
import * as affine4 from "../src/affine4.js"

test("overlap.sphereWithSphere", (t) => {
  t.notOk(overlap.sphereWithSphere({x:1,y:1,z:1}, 2, {x:5,y:5,z:5}, 2), "non-overlapping spheres")
  t.ok(overlap.sphereWithSphere({x:0,y:0,z:0}, 4, {x:1,y:1,z:1}, 3), "overlapping spheres")
  t.ok(overlap.sphereWithSphere({x:0,y:0,z:0}, 4, {x:0,y:0,z:0}, 3), "A surrounds B")
  t.ok(overlap.sphereWithSphere({x:5,y:5,z:5}, 3, {x:5,y:5,z:5}, 6), "B surrounds A")
  t.end()
})

test("overlap.aabbWithAabb", (t) => {
  t.ok(overlap.aabbWithAabb({x:-1,y:-2,z:-3},{x:1,y:2,z:3}, {x:0,y:0,z:0},{x:4,y:4,z:4}), "overlapping aabb")
  t.notOk(overlap.aabbWithAabb({x:-2,y:-2,z:-2},{x:-1,y:-1,z:-1}, {x:0,y:0,z:0},{x:4,y:4,z:4}), "non-overlapping aabb")
  t.ok(overlap.aabbWithAabb({x:-2,y:-2,z:-2},{x:2,y:2,z:2}, {x:0,y:0,z:0},{x:1,y:1,z:1}), "A surrounds B")
  t.ok(overlap.aabbWithAabb({x:0,y:0,z:0},{x:1,y:1,z:1}, {x:-2,y:-2,z:-2},{x:2,y:2,z:2}), "B surrounds A")
  t.end()
})

test("overlap.boxWithBox", (t) => {
  const affA = affine4.create()
  const affB = affine4.create()

  t.notOk(overlap.boxWithBox({x:-1,y:-2,z:-3},{x:0,y:-1,z:-2}, affine4.create(), {x:-1,y:-2,z:-3},{x:0,y:-1,z:-2}, affine4.makeTranslateXYZ(affB, {x:5,y:5,z:5})), "non-overlapping with same aabb, different pos, no rotation")
  t.ok(overlap.boxWithBox({x:-1,y:-2,z:-1},{x:1,y:2,z:1}, affine4.create(), {x:-1,y:-2,z:-1},{x:1,y:2,z:1}, affine4.makeTranslateXYZ(affB, {x:0,y:3.5,z:0})), "overlapping with same aabb, close on y, no rotation")
  t.notOk(overlap.boxWithBox({x:-1,y:-2,z:-1},{x:1,y:2,z:1}, affine4.makeRotateZ(affA, Math.PI*0.5), {x:-1,y:-2,z:-1},{x:1,y:2,z:1}, affine4.translateXYZ(affB, affine4.makeRotateZ(affB, Math.PI*0.5), {x:0,y:3,z:0})), "non-overlapping with same aabb, close on y, both rotated 90 on z")
  t.notOk(overlap.boxWithBox({x:-1,y:-1,z:-1},{x:1,y:1,z:1}, affine4.translateXYZ(affA, affine4.makeRotateZ(affA, Math.PI*0.25), {x:1.8,y:1.8,z:0}), {x:-1,y:-1,z:-1},{x:1,y:1,z:1}, affine4.makeRotateZ(affB, Math.PI*0.5)), "non-overlapping squares, but extents of A overlap B")
  t.end()
})

test("overlap.boxWithwithinBox", (t) => {
  const affA = affine4.create()
  const affB = affine4.create()

  t.notOk(overlap.boxWithinBox({x:-1,y:-2,z:-3},{x:0,y:-1,z:-2}, affine4.create(), {x:-1,y:-2,z:-3},{x:0,y:-1,z:-2}, affine4.create()), "same boxes")
  t.ok(overlap.boxWithinBox({x:-1,y:-2,z:-1},{x:1,y:2,z:1}, affine4.makeScaleXYZ(affA, {x:.95,y:.95,z:.95}), {x:-1,y:-2,z:-1},{x:1,y:2,z:1}, affine4.create()), "a scaled within b")
  t.ok(overlap.boxWithinBox({x:-1,y:-2,z:-1},{x:1,y:2,z:1}, affine4.makeRotateZ(affA, Math.PI*0.1), {x:-2,y:-3,z:-2},{x:2,y:3,z:2}, affine4.create()), "a rotated within b")
  t.notOk(overlap.boxWithinBox({x:-1,y:-2,z:-1},{x:1,y:2,z:1}, affine4.create(), {x:-1,y:-2,z:-1},{x:1,y:2,z:1}, affine4.makeRotateZ(affB, Math.PI*0.5)), "overlapping")
  t.notOk(overlap.boxWithinBox({x:-1,y:-1,z:-1},{x:1,y:1,z:1}, affine4.makeTranslateXYZ(affA, {x:2.1,y:1.8,z:0}), {x:-1,y:-1,z:-1},{x:1,y:1,z:1}, affine4.create()), "separated")
  t.end()
})


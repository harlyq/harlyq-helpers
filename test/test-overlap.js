import test from "tape"
import * as overlap from "../src/overlap.js"

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
  const QUAT_IDENTITY = {x:0, y:0, z:0, w:1}
  const QUAT_ROT_90_Z = {x:0, y:0, z:Math.sin(Math.PI/4), w:Math.cos(Math.PI/4)}
  const QUAT_ROT_45_Z = {x:0, y:0, z:Math.sin(Math.PI/8), w:Math.cos(Math.PI/8)}
  const SCALE_IDENTITY = {x:1, y:1, z:1}
  t.notOk(overlap.boxWithBox({x:-1,y:-2,z:-3},{x:0,y:-1,z:-2},{x:0,y:0,z:0},QUAT_IDENTITY,SCALE_IDENTITY, {x:-1,y:-2,z:-3},{x:0,y:-1,z:-2},{x:5,y:5,z:5},QUAT_IDENTITY,SCALE_IDENTITY), "non-overlapping with same aabb, different pos, no rotation")
  t.ok(overlap.boxWithBox({x:-1,y:-2,z:-1},{x:1,y:2,z:1},{x:0,y:0,z:0},QUAT_IDENTITY,SCALE_IDENTITY, {x:-1,y:-2,z:-1},{x:1,y:2,z:1},{x:0,y:3.5,z:0},QUAT_IDENTITY,SCALE_IDENTITY), "overlapping with same aabb, close on y, no rotation")
  t.notOk(overlap.boxWithBox({x:-1,y:-2,z:-1},{x:1,y:2,z:1},{x:0,y:0,z:0},QUAT_ROT_90_Z,SCALE_IDENTITY, {x:-1,y:-2,z:-1},{x:1,y:2,z:1},{x:0,y:3,z:0},QUAT_ROT_90_Z,SCALE_IDENTITY), "non-overlapping with same aabb, close on y, both rotated 90 on z")
  t.notOk(overlap.boxWithBox({x:-1,y:-1,z:-1},{x:1,y:1,z:1},{x:1.8,y:1.8,z:0},QUAT_ROT_45_Z,SCALE_IDENTITY, {x:-1,y:-1,z:-1},{x:1,y:1,z:1},{x:0,y:0,z:0},QUAT_ROT_90_Z,SCALE_IDENTITY), "non-overlapping squares, but extents of A overlap B")
  t.end()
})
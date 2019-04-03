import * as vertex3 from "./vertex3.js"
import * as utils from "./utils.js"

/**
 * @typedef {{x: number, y: number, z: number}} VecXYZ
 * @typedef {{x: number, y: number, z: number, w: number}} QuatXYZW
 * @typedef {number[] | Float32Array} Vertices
 */

// returns the minimum distance between 'verticesA' and 'verticesB' along the 'axis'. Negative distances indicate overlap
/** @typedef {<TA extends VecXYZ, TPA extends VecXYZ, TQA extends QuatXYZW, TPB extends VecXYZ, TQB extends QuatXYZW>(axis: TA, verticesA: Vertices, verticesB: Vertices, posA: TPA, quatA: TQA, posB: TPB, quatB: TQB) => number} TestSeparatingAxisFn */
/** @type {TestSeparatingAxisFn} */
export const testSeparatingAxis = (function() {
  let minMaxA = {min:0, max:0}
  let minMaxB = {min:0, max:0}

  return /** @type {TestSeparatingAxisFn} */function testSeparatingAxis(axis, verticesA, verticesB, posA, quatA, posB, quatB) {
    vertex3.projectOntoAxis(minMaxA, axis, verticesA, posA, quatA, 3)
    vertex3.projectOntoAxis(minMaxB, axis, verticesB, posB, quatB, 3)
    const dAB = minMaxA.min - minMaxB.max
    const dBA = minMaxB.min - minMaxA.max
    return Math.max(dAB, dBA)
  }
})()

/** @typedef {(vertices: Vertices, indices: number[], point: Vertices, pi: number) => boolean} IsPointInsideFn */
/** @type {IsPointInsideFn} */
export const isPointInside = (function() {
  let UP_X = new Float32Array([1,0,0])
  let UP_Y = new Float32Array([0,1,0])
  let axis = new Float32Array(3)
  let normal = new Float32Array(3)
  let up = new Float32Array(3)
  let delta = new Float32Array(3)
  let maxDelta = new Float32Array(3)
  let minDelta = new Float32Array(3)
  let projected = new Float32Array(3)

  return /** @type {IsPointInsideFn} */function isPointInside(vertices, indices, point, pi = 0) {
    vertex3.sub(axis, vertices, point, indices[0], pi)
    vertex3.normalize(axis, axis)
    vertex3.copy(up, vertex3.equals(axis, UP_Y, 0.01) ? UP_X : UP_Y)
    vertex3.cross(normal, axis, up)
    vertex3.cross(up, normal, axis)
    
    vertex3.setZero(minDelta)
    vertex3.setZero(maxDelta)

    for (let i = 0, n = indices.length; i < n; i++) {
      // delta = (point - vertex) - dot(point - vertex, axis)*axis
      vertex3.sub(delta, vertices, point, indices[i], pi)
      projected[0] = vertex3.dot(delta, axis)
      projected[1] = vertex3.dot(delta, normal)
      projected[2] = vertex3.dot(delta, up)

      vertex3.min(minDelta, projected, minDelta)
      vertex3.max(maxDelta, projected, maxDelta)
    }

    return minDelta[0] < 0 && maxDelta[0] > 0 &&
      minDelta[1] < 0 && maxDelta[1] > 0 &&
      minDelta[2] < 0 && maxDelta[2] > 0
  }
})()


/** @type {(vertices: Vertices, stride: number) => number[]} */
export function generateHullIndices(vertices, stride = 3) {
  let extremes = vertex3.generateExtremes(vertices, stride)
  let hull = extremes.slice()

  for (let i = 0; i < vertices.length; i += stride) {
    if (extremes.includes(i)) {
      continue // ignore the extremes, they are already in the hull
    }

    if (!isPointInside(vertices, hull, vertices, i)) {
      hull.push(i) // expand the hull

      // remove points that are now inside the hull, we can ignore
      // the extremes and the last point added because they are guaranteed
      // to not be inside the hull
      for (let j = extremes.length; j < hull.length - 1; j++) {
        if (isPointInside(vertices, hull, vertices, hull[j])) {
          utils.unorderedRemoveAt(hull, j) // changes hull.length
        }
      }
    }
  }

  return hull
}



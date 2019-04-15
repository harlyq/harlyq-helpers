import * as vecxyz from "./vecxyz.js"

/**
 * @typedef {{x: number, y: number, z: number}} VecXYZ
 * @typedef {{x: number, y: number, z: number, w: number}} QuatXYZW
 * @typedef {number[] | Float32Array} Vertices
 */

// returns the 3D projected extents of 'vertices' onto 'axis'
/** @typedef {<T extends {min: number, max: number}, TA extends VecXYZ, TV extends Vertices, TP extends VecXYZ, TQ extends QuatXYZW>(out: T, axis: TA, vertices: TV, pos: TP, quat: TQ, stride: number) => T} ProjectOntoAxisFn */
/** @type {ProjectOntoAxisFn} */
export const projectOntoAxis = (function() {
  let localAxis = {x:0, y:0, z:0}
  let localOrigin = {x:0, y:0, z:0}

  return /** @type {ProjectOntoAxisFn} */ function projectOntoAxis(out, axis, vertices, pos, quat, stride = 3) {
    vecxyz.transformQuaternion(localAxis, axis, quat)
  
    let min = vertices[0]
    let max = vertices[0]
    for (let i = 0; i < vertices.length; i += stride) {
      const v = dotXYZ(vertices[i], localAxis)
      min = Math.min(v, min)
      max = Math.max(v, max)
    }
  
    vecxyz.copy(localOrigin, pos)
    vecxyz.transformQuaternion(localOrigin, localOrigin, quat)
    const offset = vecxyz.dot(localOrigin, localAxis)
  
    out.min = min + offset
    out.max = max + offset
    return out
  }  
})()

/** @type {<T extends Vertices>(out: T, x: number, y: number, z: number, oi: number) => T} */
export function set(out, x=0, y=0, z=0, oi=0) {
  out[oi] = x
  out[oi+1] = y
  out[oi+2] = z
  return out
}

/** @type {<T extends Vertices>(out: T, oi: number) => T} */
export function setZero(out, oi = 0) {
  // @ts-ignore, can use fill on TypedArray
  return out.fill(0, oi, oi+3)
}

/** @type {<T extends Vertices, TA extends Vertices>(out: T, a: TA, ai: number, oi: number) => T} */
export function copy(out, a, ai = 0, oi = 0) {
  out[oi] = a[ai]
  out[oi+1] = a[ai+1]
  out[oi+2] = a[ai+2]
  return out
}

/** @type {<T extends Vertices, TA extends Vertices, TB extends Vertices>(out: T, a: TA, b: TB, ai: number, bi: number, oi: number) => T} */
export function sub(out, a, b, ai = 0, bi = 0, oi = 0) {
  out[oi] = a[ai] - b[bi]
  out[oi+1] = a[ai+1] - b[bi+1]
  out[oi+2] = a[ai+2] - b[bi+2]
  return out
}

/** @type {<T extends Vertices, TA extends Vertices>(out: T, a: TA, ai: number, oi: number) => T} */
export function normalize(out, a, ai = 0, oi = 0) {
  const ax = a[ai], ay = a[ai+1], az = a[ai+2]
  const len = Math.hypot(ax, ay, az) || 1
  out[oi] = ax/len
  out[oi+1] = ay/len
  out[oi+2] = az/len
  return out
}

/** @type {<TA extends Vertices, TB extends Vertices>(a: TA, b: TB, ai: number, bi: number, oi: number) => number} */
export function dot(a, b, ai = 0, bi = 0) {
  return a[ai]*b[bi] + a[ai+1]*b[bi+1] + a[ai+2]*b[bi+2]
}

/** @type {<TA extends Vertices, TV extends VecXYZ>(a: TA, vec: TV, ai: number) => number} */
export function dotXYZ(a, vec, ai = 0) {
  return a[ai]*vec.x + a[ai+1]*vec.y + a[ai+2]*vec.z
}

/** @type {<T extends Vertices, TA extends Vertices, TB extends Vertices>(out: T, a: TA, b: TB, s: number, ai: number, bi: number, oi: number) => T} */
export function scaleAndAdd(out, a, b, s, ai = 0, bi = 0, oi = 0) {
  out[oi] = a[ai] + b[bi]*s
  out[oi+1] = a[ai+1] + b[bi+1]*s
  out[oi+2] = a[ai+2] + b[bi+2]*s
  return out
}

/** @type {<T extends Vertices, TA extends Vertices, TB extends Vertices>(out: T, a: TA, b: TB, ai: number, bi: number, oi: number) => T} */
export function max(out, a, b, ai = 0, bi = 0, oi = 0) {
  out[oi] = Math.max(a[ai], b[bi])
  out[oi+1] = Math.max(a[ai+1], b[bi+1])
  out[oi+2] = Math.max(a[ai+2], b[bi+2])
  return out
}

/** @type {<T extends Vertices, TA extends Vertices, TB extends Vertices>(out: T, a: TA, b: TB, ai: number, bi: number, oi: number) => T} */
export function min(out, a, b, ai = 0, bi = 0, oi = 0) {
  out[oi] = Math.min(a[ai], b[bi])
  out[oi+1] = Math.min(a[ai+1], b[bi+1])
  out[oi+2] = Math.min(a[ai+2], b[bi+2])
  return out
}

/** @type {<TA extends Vertices, TB extends Vertices>(a: TA, b: TB, tolerance: number) => boolean} */
export function equals(a, b, tolerance = 0.00001, ai = 0, bi = 0) {
  return Math.abs(a[ai] - b[bi]) < tolerance && Math.abs(a[ai+1] - b[bi+1]) < tolerance && Math.abs(a[ai+2] - b[bi+2]) < tolerance
}

/** @type {<T extends Vertices, TA extends Vertices, TB extends Vertices>(out: T, a: TA, b: TB, ai: number, bi: number, oi: number) => T} */
export function cross(out, a, b, ai = 0, bi = 0, oi = 0) {
  const ax = a[ai], ay = a[ai+1], az = a[ai+2]
  const bx = b[bi], by = b[bi+1], bz = b[bi+2]
  out[oi] = ay*bz - az*by
  out[oi+1] = az*bx - ax*bz
  out[oi+2] = ax*by - ay*bx
  return out
}

/** @type {<T extends VecXYZ, TV extends Vertices>(out: T, vertices: TV, stride: number) => T} */
export function centroid(out, vertices, stride = 3) {
  const n = vertices.length/stride

  vecxyz.setZero(out)
  for (let i = 0; i < vertices.length; i += stride) {
    out.x += vertices[i]
    out.y += vertices[i+1]
    out.z += vertices[i+2]
  }
  out.x /= n
  out.y /= n
  out.z /= n

  return out
}

// returns a sorted list of indices into vertices which represent the max and min extents along the x, y and z axis (at most 6 values)
/** @type {<TV extends Vertices>(vertices: TV, stride: number) => number[]} */
export function generateExtremes(vertices, stride = 3) {
  let extremes = new Array(6).fill(0)
  let min = new Float32Array(3)
  let max = new Float32Array(3)
  const INDICES_FOR_MAX = 3

  copy(min, vertices)
  copy(max, vertices)

  for (let i = stride; i < vertices.length; i += stride) {
    for (let axis = 0; axis < 3; axis++) {
      const v = vertices[i + axis]
      if (v < min[axis]) {
        min[axis] = v
        extremes[axis] = i
      }
      if (v > max[axis]) {
        max[axis] = v
        extremes[axis + INDICES_FOR_MAX] = i
      }
    }
  }

  return extremes.sort((a,b) => a - b).filter((x,i,sorted) => i === 0 || x !== sorted[i-1]) // returns unique indices, in ascending order
}

/** @type {<TV extends Vertices>(vertices: TV, indices: number[]) => Vertices} */
export function createFromIndices(vertices, indices) {
  let newVertices = new Float32Array(indices.length*3)
  for (let i = 0, newIndex = 0; i < indices.length; i++, newIndex += 3) {
    const oldIndex = indices[i]
    newVertices[newIndex] = vertices[oldIndex]
    newVertices[newIndex+1] = vertices[oldIndex+1]
    newVertices[newIndex+2] = vertices[oldIndex+2]
  }
  return newVertices
}

export function average(out, vertices) {
  let x = 0, y = 0, z = 0
  const n = vertices.length
  for (let i = 0; i < n; i += 3) {
    x += vertices[i]
    y += vertices[i+1]
    z += vertices[i+2]
  }

  return out.set(out, x/n, y/n, z/n)
}


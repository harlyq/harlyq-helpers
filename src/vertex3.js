import * as vecxyz from "./vecxyz.js"

/**
 * @typedef {Float32Array | number[]} Affine4
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
export function add(out, a, b, ai = 0, bi = 0, oi = 0) {
  out[oi] = a[ai] + b[bi]
  out[oi+1] = a[ai+1] + b[bi+1]
  out[oi+2] = a[ai+2] + b[bi+2]
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

/** @type {<TA extends Vertices>(a: TA, ai: number) => number} */
export function length(a, ai = 0) {
  return Math.hypot(a[ai], a[ai+1], a[ai+2])
}

/** @type {<TA extends Vertices, TB extends Vertices>(a: TA, b: TB, ai: number, bi: number, oi: number) => number} */
export function dot(a, b, ai = 0, bi = 0) {
  return a[ai]*b[bi] + a[ai+1]*b[bi+1] + a[ai+2]*b[bi+2]
}

/** @type {<TA extends Vertices, TV extends VecXYZ>(a: TA, vec: TV, ai: number) => number} */
export function dotXYZ(a, vec, ai = 0) {
  return a[ai]*vec.x + a[ai+1]*vec.y + a[ai+2]*vec.z
}

// out = a + b*s
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

// returns a sorted list of indices into vertices which represent the max and min extents along the x, y and z axis (at most 6 values)
/** @type {<TV extends Vertices>(vertices: TV, stride: number) => number[]} */
export function generateExtremes(vertices, stride = 3) {
  let extremes = new Array(6).fill(0) // two vertices for each axis (a min and a max)
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

/** @type {<T extends Vertices, TV extends Vertices>(out: T, vertices: TV, oi?: number, stride?: number) => Vertices} */
export function average(out, vertices, oi = 0, stride = 3) {
  let x = 0, y = 0, z = 0
  const n = vertices.length/3
  for (let i = 0; i < vertices.length; i += stride) {
    x += vertices[i]
    y += vertices[i+1]
    z += vertices[i+2]
  }

  return set(out, x/n, y/n, z/n, oi)
}

// sets the vector to the normal of the plane formed by points p0, p1 and p2
/** @typedef {<T extends Vertices, TP0 extends Vertices, TP1 extends Vertices, TP2 extends Vertices>(out: T, a: TP0, b: TP1, c: TP2, ai?: number, bi?: number, ci?: number, oi?: number) => T} SetFromCoplanarPointsFn */
/** @type {SetFromCoplanarPointsFn} */
export const setFromCoplanarPoints = (function() {
  let vbc = new Float32Array(3)
  let vba = new Float32Array(3)
  let crossProduct = new Float32Array(3)

  return /** @type {SetFromCoplanarPointsFn} */function setFromCoplanerPoints(out, a, b, c, ai = 0, bi = 0, ci = 0, oi = 0) {
    sub(vbc, c, b, ci, bi)
    sub(vba, a, b, ai, bi)
    return normalize( out, cross(crossProduct, vbc, vba), 0, oi )
  }
})()

// from https://en.wikipedia.org/wiki/Centroid
/** @type {<T extends Vertices, TV extends Vertices>(out: T, vertices: TV, indices: number[], oi?: number) => T} */
export function centroidFromIndices(out, vertices, indices, oi = 0) {
  const n = indices.length

  let x = 0, y = 0, z = 0

  for (let j = 0; j < indices.length; j++) {
    const i = indices[j]
    x += vertices[i]/n
    y += vertices[i+1]/n
    z += vertices[i+2]/n
  }

  return set(out, x, y, z, oi)
}

// from https://en.wikipedia.org/wiki/Coplanarity
/** @typedef {<TA extends Vertices, TB extends Vertices, TC extends Vertices, TD extends Vertices>(a: TA, b: TB, c: TC, d: TD, tolerance: number, ai: number, bi: number, ci: number, di: number) => boolean} AreCoplanarFn */
/** @type {AreCoplanarFn} */
export const areCoplanar = (function() {
  const ba = new Float32Array(3)
  const ca = new Float32Array(3)
  const da = new Float32Array(3)
  return /** @type {AreCoplanarFn} */ function areCoplanar(a, b, c, d, tolerance = 1e-5, ai=0, bi=0, ci=0, di=0) {
    sub(ba, b, a, bi, ai)
    sub(ca, c, a, ci, ai)
    sub(da, d, a, di, ai)

    // ideally we would use normalized vectors, but do we want the extra cost?
    return Math.abs( dot( da, cross(ba, ba, ca) ) ) < tolerance
  }
})()

/** @type {<T extends Vertices, TA extends Vertices>(out: T, a: TA, s: number, ai?: number, oi?: number) => T} */
export function multiplyScalar(out, a, s, ai=0, oi=0) {
  out[oi] = a[ai]*s
  out[oi+1] = a[ai+1]*s
  out[oi+2] = a[ai+2]*s
  return out
}

/** @type {<T extends Vertices, TV extends Vertices, TA extends Affine4>(out: T, vertices: TV, aff: TA, vi?: number, oi?: number) => T} */
export function applyAffine4(out, vertices, aff, vi=0, oi=0) {
  const vx = vertices[vi], vy = vertices[vi+1], vz = vertices[vi+2]

  out[oi] = aff[0]*vx + aff[4]*vy + aff[8]*vz + aff[12]
  out[oi+1] = aff[1]*vx + aff[5]*vy + aff[9]*vz + aff[13]
  out[oi+2] = aff[2]*vx + aff[6]*vy + aff[10]*vz + aff[14]

  return out
}
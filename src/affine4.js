import * as vecxyz from "./vecxyz.js";
import * as quatxyzw from "./quatxyzw.js";

// remix of https://github.com/mrdoob/three.js/blob/master/src/math/Matrix4.js

/**
 * @typedef {Float32Array} Affine4
 * @typedef {{x: number, y: number, z: number}} VecXYZ
 * @typedef {{x: number, y: number, z: number, w: number}} QuatXYZW
 * @typedef {number} Radians
 */

/**
 * column major 4x4 affine matrix
 * @type {() => Affine4}
 */
export function create() {
  return new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1])
}

/** @type {<T extends Affine4, TA extends Affine4, TT extends VecXYZ>(out: T, aff: TA, t: TT) => T */
export function translateXYZ(out, aff, t) {
  // @ts-ignore
  if (out !== aff) {
    out.set(aff)
  }

  out[12] += t.x
  out[13] += t.y
  out[14] += t.z
  return out
}

/** @type {<T extends Affine4, TA extends Affine4>(out: T, aff: TA, rad: Radians) => T} */
export function rotateX(out, aff, rad) {
  // @ts-ignore
  if (out !== aff) {
    out.set(aff)
  }

  const cs = Math.cos(rad)
  const ss = Math.sin(rad)
  out[5] *= cs
  out[6] *= ss
  out[9] *= -ss
  out[10] *= cs

  return out
}

/** @type {<T extends Affine4, TA extends Affine4>(out: T, aff: TA, rad: Radians) => T} */
export function rotateY(out, aff, rad) {
  // @ts-ignore
  if (out !== aff) {
    out.set(aff)
  }

  const cs = Math.cos(rad)
  const ss = Math.sin(rad)
  out[0] *= cs
  out[2] *= -ss
  out[8] *= ss
  out[10] *= cs

  return out
}

/** @type {<T extends Affine4, TA extends Affine4>(out: T, aff: TA, rad: Radians) => T} */
export function rotateZ(out, aff, rad) {
  // @ts-ignore
  if (out !== aff) {
    out.set(aff)
  }

  const cs = Math.cos(rad)
  const ss = Math.sin(rad)
  out[0] *= cs
  out[1] *= ss
  out[4] *= -ss
  out[5] *= cs

  return out
}

/** @type {<T extends Affine4, TA extends Affine4, TS extends VecXYZ>(out: T, aff: TA, scale: TS) => T} */
export function scaleXYZ(out, aff, scale) {
  out.set(aff)
  out[0] *= scale.x
  out[5] *= scale.y
  out[10] *= scale.z
  return out
}

/** @type {<T extends VecXYZ, TA extends Affine4, TV extends VecXYZ>(out: T, aff: TA, v: TV) => T} */
export function multiplyVecXYZ(out, aff, v) {
  const vx = v.x, vy = v.y, vz = v.z

  out.x = aff[0]*vx + aff[4]*vy + aff[8]*vz + aff[12]
  out.y = aff[1]*vx + aff[5]*vy + aff[9]*vz + aff[13]
  out.z = aff[2]*vx + aff[6]*vy + aff[10]*vz + aff[14]

  return out
}

/** @type {<T extends VecXYZ, TA extends Affine4, TV extends VecXYZ>(out: T, aff: TA, v: TV) => T} */
export function invertAndMultiplyVecXYZ(out, aff, v) {
  const n11 = aff[0], n21 = aff[1], n31 = aff[2]
  const n12 = aff[4], n22 = aff[5], n32 = aff[6]
  const n13 = aff[8], n23 = aff[9], n33 = aff[10]
  const tx = aff[12], ty = aff[13], tz = aff[14]

  const t11 = n33 * n22 - n32 * n23
  const t12 = n32 * n13 - n33 * n12
  const t13 = n23 * n12 - n22 * n13

  const det = n11 * t11 + n21 * t12 + n31 * t13
  const invDet = 1/det

  // invert the rotation matrix
  const m11 = t11 * invDet
  const m21 = ( n31 * n23 - n33 * n21 ) * invDet
  const m31 = ( n32 * n21 - n31 * n22 ) * invDet

  const m12 = t12 * invDet
  const m22 = ( n33 * n11 - n31 * n13 ) * invDet
  const m32 = ( n31 * n12 - n32 * n11 ) * invDet

  const m13 = t13 * invDet
  const m23 = ( n21 * n13 - n23 * n11 ) * invDet
  const m33 = ( n22 * n11 - n21 * n12 ) * invDet

  // apply inv(aff)*(v - t)
  const ax = v.x - tx, ay = v.y - ty, az = v.z - tz
  out.x = m11*ax + m12*ay + m13*az
  out.y = m21*ax + m22*ay + m23*az
  out.z = m31*ax + m32*ay + m33*az

  return out
}

/** @type {<TA extends Affine4>(aff: TA) => number} */
export function determinant(aff) {
  const n11 = aff[0], n21 = aff[1], n31 = aff[2]
  const n12 = aff[4], n22 = aff[5], n32 = aff[6]
  const n13 = aff[8], n23 = aff[9], n33 = aff[10]

  const t11 = n33 * n22 - n32 * n23
  const t12 = n32 * n13 - n33 * n12
  const t13 = n23 * n12 - n22 * n13

  return n11 * t11 + n21 * t12 + n31 * t13
}

/** @typedef {<T extends Affine4, VP extends VecXYZ, VQ extends QuatXYZW, VS extends VecXYZ>(aff: T, outPosition: VP, outQuaterion: VQ, outScale: VS) => T} DecomposeFN */
/** @type {DecomposeFN} */
export const decompose = (function() {
  let affCopy = new Float32Array(16)

  return /** @type {DecomposeFN} */function decompose(aff, outPosition = undefined, outQuaternion = undefined, outScale = undefined) {
    if (outPosition) {
      outPosition.x = aff[12]
      outPosition.y = aff[13]
      outPosition.z = aff[14]
    }
  
    if (outScale || outQuaternion) {
      const sx = Math.hypot(aff[0], aff[1], aff[2])
      const sy = Math.hypot(aff[4], aff[5], aff[6])
      const sz = Math.hypot(aff[8], aff[9], aff[10])
    
      if (outScale) {
        outScale.x = sx
        outScale.y = sy
        outScale.z = sz
      }
    
      if (outQuaternion) {
        const det = determinant(aff)
        const invSX = det < 0 ? -1/sx : 1/sx // invert scale on one axis for negative determinant
        const invSY = 1/sy
        const invSZ = 1/sz
  
        affCopy.set(aff)
        affCopy[0] *= invSX
        affCopy[1] *= invSX
        affCopy[2] *= invSX
        affCopy[4] *= invSY
        affCopy[5] *= invSY
        affCopy[6] *= invSY
        affCopy[8] *= invSZ
        affCopy[9] *= invSZ
        affCopy[10] *= invSZ
  
        quatxyzw.setFromUnscaledAffine4(outQuaternion, affCopy)
      }
    }
  
    return aff
  }  
})()


/** @typedef {<TA extends Affine4>(aff: TA) => string} ToStringFn */
/** @type {ToStringFn} */
export const toString = (function() {
  let position = {x:0, y:0, z:0}
  let quaternion = {x:0, y:0, z:0, w:1}
  let scale = {x:1, y:1, z:1}

  return /** @type {ToStringFn} */ function toString(aff) {
    decompose(aff, position, quaternion, scale)
    return `[position: ${vecxyz.toString(position)}, quaternion: ${quatxyzw.toString(quaternion)}, scale: ${vecxyz.toString(scale)}]`
  }
})()


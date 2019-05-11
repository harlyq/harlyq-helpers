import * as vecxyz from "./vecxyz.js";
import * as quatxyzw from "./quatxyzw.js";

// remix of https://github.com/mrdoob/three.js/blob/master/src/math/Matrix4.js

/**
 * @typedef {Float32Array | number[]} Affine4
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

/** @type {<T extends Affine4, TA extends Affine4, TT extends VecXYZ>(out: T, aff: TA, t: TT) => T} */
export function translateXYZ(out, aff, t) {
  for (let i = 0; i < aff.length; i++) {
    out[i] = aff[i]
  }

  out[12] += t.x
  out[13] += t.y
  out[14] += t.z
  return out
}

/** @type {<T extends Affine4, TT extends VecXYZ>(out: T, t: TT) => T} */
export function makeTranslateXYZ(out, t) {
  out.fill(0)

  out[12] = t.x
  out[13] = t.y
  out[14] = t.z
  out[0] = out[5] = out[10] = out[15] = 1

  return out
}

/** @type {<T extends Affine4, TA extends Affine4>(out: T, rad: Radians) => T} */
export function makeRotateX(out, rad) {
  out.fill(0)

  const cs = Math.cos(rad)
  const ss = Math.sin(rad)
  out[5] = cs
  out[6] = ss
  out[9] = -ss
  out[10] = cs
  out[0] = out[15] = 1

  return out
}

/** @type {<T extends Affine4>(out: T, rad: Radians) => T} */
export function makeRotateY(out, rad) {
  out.fill(0)

  const cs = Math.cos(rad)
  const ss = Math.sin(rad)
  out[0] = cs
  out[2] = -ss
  out[8] = ss
  out[10] = cs
  out[5] = out[15] = 1

  return out
}

/** @type {<T extends Affine4>(out: T, rad: Radians) => T} */
export function makeRotateZ(out, rad) {
  out.fill(0)

  const cs = Math.cos(rad)
  const ss = Math.sin(rad)
  out[0] = cs
  out[1] = ss
  out[4] = -ss
  out[5] = cs
  out[10] = out[15] = 1

  return out
}

/** @type {<T extends Affine4, TS extends VecXYZ>(out: T, scale: TS) => T} */
export function makeScaleXYZ(out, scale) {
  out.fill(0)

  out[0] = scale.x
  out[5] = scale.y
  out[10] = scale.z
  out[15] = 1

  return out
}

/** @type {<T extends Affine4, TA extends Affine4, TB extends Affine4>(out: T, affA: TA, affB: TB) => T} */
export function multiply(out, affA, affB) {
  const a11 = affA[0], a21 = affA[1], a31 = affA[2]
  const a12 = affA[4], a22 = affA[5], a32 = affA[6]
  const a13 = affA[8], a23 = affA[9], a33 = affA[10]
  const a14 = affA[12], a24 = affA[13], a34 = affA[14]

  const b11 = affB[0], b21 = affB[1], b31 = affB[2]
  const b12 = affB[4], b22 = affB[5], b32 = affB[6]
  const b13 = affB[8], b23 = affB[9], b33 = affB[10]
  const b14 = affB[12], b24 = affB[13], b34 = affB[14]

  out[0] = a11*b11 + a12*b21 + a13*b31
  out[1] = a21*b11 + a22*b21 + a23*b31
  out[2] = a31*b11 + a32*b21 + a33*b31

  out[4] = a11*b12 + a12*b22 + a13*b32
  out[5] = a21*b12 + a22*b22 + a23*b32
  out[6] = a31*b12 + a32*b22 + a33*b32

  out[8] = a11*b13 + a12*b23 + a13*b33
  out[9] = a21*b13 + a22*b23 + a23*b33
  out[10] = a31*b13 + a32*b23 + a33*b33

  out[12] = a11*b14 + a12*b24 + a13*b34 + a14
  out[13] = a21*b14 + a22*b24 + a23*b34 + a24
  out[14] = a31*b14 + a32*b24 + a33*b34 + a34

  out[3] = out[7] = out[11] = 0
  out[15] = 1

  return out
}

/** @type {<T extends Affine4, TA extends Affine4>(out: T, aff: TA) => T} */
export function invert(out, aff) {
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

  out[0] = m11, out[1] = m21, out[2] = m31, out[3] = 0
  out[4] = m12, out[5] = m22, out[6] = m32, out[7] = 0
  out[8] = m13, out[9] = m23, out[10] = m33, out[11] = 0
  out[12] = -m11*tx - m12*ty - m13*tz
  out[13] = -m21*tx - m22*ty - m23*tz
  out[14] = -m31*tx - m32*ty - m33*tz
  out[15] = 1

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


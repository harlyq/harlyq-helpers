/**
 * @typedef {{x: number, y: number, z: number, w: number}} QuatXYZW
 * @typedef {Float32Array | number[]} Affine4
 */

const SQRT_1_2 = Math.sqrt(0.5)

/** @type {QuatXYZW} */
export const IDENTITY = Object.freeze({x:0, y:0, z:0, w:1})

/** @type {QuatXYZW} */
export const ROTATE_X_180 = Object.freeze({x:1, y:0, z:0, w:0})

/** @type {QuatXYZW} */
export const ROTATE_Y_180 = Object.freeze({x:0, y:1, z:0, w:0})

/** @type {QuatXYZW} */
export const ROTATE_Z_180 = Object.freeze({x:0, y:0, z:1, w:0})

/** @type {QuatXYZW} */
export const ROTATE_X_90 = Object.freeze({x:SQRT_1_2, y:0, z:0, w:SQRT_1_2})

/** @type {QuatXYZW} */
export const ROTATE_Y_90 = Object.freeze({x:0, y:SQRT_1_2, z:0, w:SQRT_1_2})

/** @type {QuatXYZW} */
export const ROTATE_Z_90 = Object.freeze({x:0, y:0, z:SQRT_1_2, w:SQRT_1_2})

/** @type {<T extends QuatXYZW, TA extends QuatXYZW>(out: T, a: TA) => T} */
export function conjugate(out, a) {
  out.x = -a.x
  out.y = -a.y
  out.z = -a.z
  out.w = a.w
  return out
}

/** @type {<T extends QuatXYZW, TA extends QuatXYZW>(out: T, a: TA) => T} */
export function copy(out, a) {
  out.x = a.x
  out.y = a.y
  out.z = a.z
  out.w = a.w
  return out
}

/** @type {<TA extends QuatXYZW>(a: TA) => number} */
export function length(a) {
  return Math.hypot(a.x, a.y, a.z, a.w)
}

/** @type {<T extends QuatXYZW, TA extends QuatXYZW>(out: T, a: TA) => T} */
export function normalize(out, a) {
  const ax = a.x, ay = a.y, az = a.z, aw = a.w
  const len = Math.hypot(ax, ay, az, aw)
  if (len < 1e-10) {
    out.x = out.y = out.z = 0
    out.w = 1
  } else {
    out.x = ax/len
    out.y = ay/len
    out.z = az/len
    out.w = aw/len
  }
  return out
}

/** @type {<T extends QuatXYZW>(out: T, array: number[], i: number) => T} */
export function setFromArray(out, array, i) {
  i = i || 0
  out.x = array[i]
  out.y = array[i+1]
  out.z = array[i+2]
  out.w = array[i+3]
  return out
}

/** @type {<T extends QuatXYZW>(out: T, aff: Affine4) => T} */
export function setFromUnscaledAffine4(out, aff) {
  const m11 = aff[0], m12 = aff[4], m13 = aff[8]
  const m21 = aff[1], m22 = aff[5], m23 = aff[9]
  const m31 = aff[2], m32 = aff[6], m33 = aff[10]
  const trace = m11 + m22 + m33
  let s

  if ( trace > 0 ) {

    s = 0.5 / Math.sqrt( trace + 1.0 );

    out.w = 0.25 / s;
    out.x = ( m32 - m23 ) * s;
    out.y = ( m13 - m31 ) * s;
    out.z = ( m21 - m12 ) * s;

  } else if ( m11 > m22 && m11 > m33 ) {

    s = 2.0 * Math.sqrt( 1.0 + m11 - m22 - m33 );

    out.w = ( m32 - m23 ) / s;
    out.x = 0.25 * s;
    out.y = ( m12 + m21 ) / s;
    out.z = ( m13 + m31 ) / s;

  } else if ( m22 > m33 ) {

    s = 2.0 * Math.sqrt( 1.0 + m22 - m11 - m33 );

    out.w = ( m13 - m31 ) / s;
    out.x = ( m12 + m21 ) / s;
    out.y = 0.25 * s;
    out.z = ( m23 + m32 ) / s;

  } else {

    s = 2.0 * Math.sqrt( 1.0 + m33 - m11 - m22 );

    out.w = ( m21 - m12 ) / s;
    out.x = ( m13 + m31 ) / s;
    out.y = ( m23 + m32 ) / s;
    out.z = 0.25 * s;

  }
  return out
}

/** @type {<TA extends QuatXYZW, TB extends QuatXYZW>(a: TA, b: TB, tolerance: number) => boolean} */
export function equals(a, b, tolerance = 0.000001) {
  return Math.abs(a.x - b.x) < tolerance && Math.abs(a.y - b.y) < tolerance && Math.abs(a.z - b.z) < tolerance && Math.abs(a.w - b.w) < tolerance
}

/** @type {<TQ extends QuatXYZW>(quat: TQ) => string} */
export function toString(quat) {
  return `(${quat.x.toFixed(3)},${quat.y.toFixed(3)},${quat.z.toFixed(3)},${quat.w.toFixed(3)})`
}


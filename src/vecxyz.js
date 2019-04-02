export const ZERO = Object.freeze({x: 0, y: 0, z: 0})
export const UNIT_X = Object.freeze({x: 1, y: 0, z: 0})
export const UNIT_Y = Object.freeze({x: 0, y: 1, z: 0})
export const UNIT_Z = Object.freeze({x: 0, y: 0, z: 1})

export function isVecXYZ(a) {
  return "x" in a && "y" in a && "z" in a
}

export function create(x = 0, y = 0, z = 0) {
  return { x: x, y: y, z: z }
}

export function clone(a) {
  return {x: a.x, y: a.y, z: a.z}
}

export function setZero(out) {
  out.x = out.y = out.z = 0
  return out
}

export function fill(out, s) {
  out.x = out.y = out.z = s
  return out
}

export function set(out, x, y, z) {
  out.x = x
  out.y = y
  out.z = z
  return out
}

export function copy(out, a) {
  out.x = a.x
  out.y = a.y
  out.z = a.z
  return out
}

/** returns true if exactly the same */
export function exactEquals(a, b) {
  return a.x === b.x && a.y === b.y && a.z === a.z
}

/** returns true if similar */
export function equals(a, b, precision = 0.00001) {
  return a.x - b.x < precision*Math.max(1, a.x, b.x) &&
    a.y - b.y < precision*Math.max(1, a.y, b.y) &&
    a.z - b.z < precision*Math.max(1, a.z, b.z)
}

/** out = a + b */
export function add(out, a, b) {
  out.x = a.x + b.x
  out.y = a.y + b.y
  out.z = a.z + b.z
  return out
}

/** out = a - b */
export function sub(out, a, b) {
  out.x = a.x - b.x
  out.y = a.y - b.y
  out.z = a.z - b.z
  return out
}

export function dot(a, b) {
  const ax = a.x, ay = a.y, az = a.z
  const bx = b.x, by = b.y, bz = b.z
  return ax*bx + ay*by + az*bz
}

export function length(a) {
  return Math.hypot(a.x, a.y, a.z)
}

export function squaredLength(a) {
  const ax = a.x, ay = a.y, az = a.z
  return ax*ax + ay*ay + az*az
}

export function manhattenLength(a) {
  return Math.abs(a.x) + Math.abs(a.y) + Math.abs(a.z)
}

export function setLength(out, a, s) {
  return scale(out, normalize(out, a), s)
}

export function distance(a,b) {
  const x = b.x - a.x, y = b.y - a.y, z = b.z - a.z
  return Math.hypot(x, y, z)
}

export function squaredDistance(a,b) {
  const x = b.x - a.x, y = b.y - a.y, z = b.z - a.z
  return x*x + y*y + z*z
}

export function negate(out, a) {
  out.x = -a.x
  out.y = -a.y
  out.z = -a.z
  return out
}

/** out = 1/a */
export function inverse(out, a) {
  out.x = 1/a.x
  out.y = 1/a.y
  out.z = 1/a.x
  return out
}

export function normalize(out, a) {
  const x = a.x, y = a.y, z = a.z
  const len = Math.hypot(x,y,z) || 1
  out.x = x/len
  out.y = y/len
  out.z = z/len
  return out
}

export function lerp(out, a, b, t) {
  const ax = a.x, ay = a.y, az = a.z
  out.x = ax + t*(b.x - ax)
  out.y = ay + t*(b.y - ay)
  out.z = az + t*(b.z - az)
  return out
}

/** out = a.*s */
export function scale(out, a, s) {
  out.x = a.x*s
  out.y = a.y*s
  out.z = a.z*s
  return out
}

/** out = a + b*s */
export function scaleAndAdd(out, a, b, s) {
  out.x = a.x + b.x*s
  out.y = a.y + b.y*s
  out.z = a.z + b.z*s
  return out
}

/** elementwise multiply */ 
export function multiply(out, a, b) {
  out.x = a.x*b.x
  out.y = a.y*b.y
  out.z = a.z*b.z
  return out
}

/** elementwise divide */
export function divide(out, a, b) {
  out.x = a.x/b.x
  out.y = a.y/b.y
  out.z = a.z/b.z
  return out
}

/** out = a .+ s */
export function offset(out, a, s) {
  out.x = a.x + s
  out.y = a.y + s
  out.z = a.z + s
  return out
}

export function smallestComponent(a) {
  return Math.min(a.x, a.y, a.z)
}

export function largestComponent(a) {
  return Math.max(a.x, a.y, a.z)
}

/** elementwise maximum */
export function max(out, a, b) {
  out.x = Math.max(a.x, b.x)
  out.y = Math.max(a.y, b.y)
  out.z = Math.max(a.z, b.z)
  return out
}

/** elementwise minimum */
export function min(out, a, b) {
  out.x = Math.min(a.x, b.x)
  out.y = Math.min(a.y, b.y)
  out.z = Math.min(a.z, b.z)
  return out
}

export function ceil(out, a) {
  out.x = Math.ceil(a.x)
  out.y = Math.ceil(a.y)
  out.z = Math.ceil(a.z)
  return out
}

export function floor(out, a) {
  out.x = Math.floor(a.x)
  out.y = Math.floor(a.y)
  out.z = Math.floor(a.z)
  return out
}

export function trunc(out, a) {
  out.x = Math.trunc(a.x)
  out.y = Math.trunc(a.y)
  out.z = Math.trunc(a.z)
  return out
}

export function clamp(out, a, min, max) {
  const ax = a.x, ay = a.y, az = a.z
  out.x = ax < min ? min : ax > max ? max : ax
  out.y = ay < min ? min : ay > max ? max : ay
  out.z = az < min ? min : az > max ? max : az
  return out
}

/** out = a vector perpendicular to a and b */
export function cross(out, a, b) {
  const ax = a.x, ay = a.y, az = a.z
  const bx = b.x, by = b.y, bz = b.z
  out.x = ay*bz - az*by
  out.y = az*bx - ax*bz
  out.z = ax*by - ay*bx
  return out
}

/** angle in radians between a and b */
export function angle(a, b) {
  const lengthAB = length(a)*length(b) || 1
  const cosine = dot(a, b)/lengthAB
  return cosine > 1 ? 0 : cosine < -1 ? Math.PI : Math.acos(cosine)
}

export function transformQuaternion(out, a, q) {
  const ax = a.x, ay = a.y, az = a.z
  const qx = q.x, qy = q.y, qz = q.z, qw = q.w

  // gl-matrix vec3.transformQuat() implementation
  // var qvec = [qx, qy, qz];
  // var uv = vec3.cross([], qvec, a);
  let uvx = qy * az - qz * ay
  let uvy = qz * ax - qx * az
  let uvz = qx * ay - qy * ax
  // var uuv = vec3.cross([], qvec, uv);
  let uuvx = qy * uvz - qz * uvy
  let uuvy = qz * uvx - qx * uvz
  let uuvz = qx * uvy - qy * uvx
  // vec3.scale(uv, uv, 2 * w);
  const w2 = qw * 2
  uvx *= w2
  uvy *= w2
  uvz *= w2
  // vec3.scale(uuv, uuv, 2);
  uuvx *= 2
  uuvy *= 2
  uuvz *= 2
  // return vec3.add(out, a, vec3.add(out, uv, uuv));
  out.x = ax + uvx + uuvx
  out.y = ay + uvy + uuvy
  out.z = az + uvz + uuvz
  return out
}

// /** out = m x a
//  * mat3 is assumed to be a column-major vector of 9 elements */
// export function transformMatrix3(out, a, m) {
//   const ax = a.x, ay = a.y, az = a.z
//   out.x = m[0]*ax + m[3]*ay + m[6]*az
//   out.y = m[1]*ax + m[4]*ay + m[7]*az
//   out.z = m[2]*ax + m[5]*ay + m[8]*az
//   return out
// }

/** out = m x a
 * m is assumed to be a column-major matrix of 16 elements. the 4th input component in 'v' is assumed to be 1
 * and we divide by the calculated 4th output component before returning */
export function transformAffine4(out, a, m) {
  const ax = a.x, ay = a.y, az = a.z
  const w = ( m[3]*ax + m[7]*ay + m[11]*az + m[15] ) || 1
  out.x = ( m[0]*ax + m[4]*ay + m[8]*az + m[12] )/w
  out.y = ( m[1]*ax + m[5]*ay + m[9]*az + m[13] )/w
  out.z = ( m[2]*ax + m[6]*ay + m[10]*az + m[14] )/w
  return out
}

/** out = a*(a.b)/(|b||b|) 
 * projects vector 'a' onto vector 'b'
*/
export function project(out, a, b) {
  const len2 = squaredLength(b) || 1
  const s = dot(a, b)/len2
  return scale(out, a, s)
}

/**
 * reflect a vector off a plane given the 'normal' (assumed to be unit vector)
 */
export function reflect(out, a, normal) {
  return sub( a, scale( normal, 2*dot(a, normal), out ), out )
}

export function setFromSpherical(out, r, phi, theta) {
  const sinPhiR = Math.sin(phi)*r
  out.x = sinPhiR*Math.sin(theta)
  out.y = Math.cos(phi)*r
  out.z = sinPhiR*Math.cos(theta)
  return out
}

export function setFromCylindircal(out, r, theta, y) {
  out.x = r*Math.sin(theta)
  out.y = y
  out.z = r*Math.cos(theta)
  return out
}

export function setFromArray(out, array, i) {
  i = i || 0
  out.x = array[i]
  out.y = array[i+1]
  out.z = array[i+2]
  return out
}

/**
 * sets the vector to the normal of the plane formed by points p0, p1 and p2
 */
export const setFromCoplanarPoints = (function() {
  let v12 = create()
  let v10 = create()

  return function setFromCoplanerPoints(out, p0, p1, p2) {
    sub(v12, p2, p1)
    sub(v10, p0, p1)
    return normalize( out, cross(out, v12, v10) )
  }
})()

export function toString(a) {
  return `(${a.x.toFixed(2)},${a.y.toFixed(2)},${a.z.toFixed(2)})`
}


import * as vecxyz from "./vecxyz.js"
import * as affine4 from "./affine4.js"

/** 
 * @typedef {{x: number, y: number, z: number}} VecXYZ
 * @typedef {{x: number, y: number, z: number, w: number}} QuatXYZW
 * @typedef {Float32Array | number[]} Affine4
 * @typedef {number} Distance
 */

/** @typedef {<EN extends VecXYZ, EX extends VecXYZ, AN extends VecXYZ, AX extends VecXYZ>(extentsMin: EN, extentsMax: EX, boxAMin: AN, boxAMax: AX, affineA: Affine4, affineB: Affine4) => void} SeparatingAxisFn */
/** @type {SeparatingAxisFn} */
export const separatingAxis = (function () {
  const vertA = {x:0, y:0, z:0}

  return /** @type {SeparatingAxisFn} */function separatingAxis(extentsMin, extentsMax, boxAMin, boxAMax, affineA, affineB) {
    // map boxA into boxB space, and determine the extents
    for (let corner = 0; corner < 8; corner++) {
      vertA.x = corner % 2 ? boxAMax.x : boxAMin.x
      vertA.y = (corner >>> 1) % 2 ? boxAMax.y : boxAMin.y
      vertA.z = (corner >>> 2) % 2 ? boxAMax.z : boxAMin.z
    
      affine4.multiplyVecXYZ( vertA, affineA, vertA )
      affine4.invertAndMultiplyVecXYZ( vertA, affineB, vertA )
    
      if (corner === 0) {
        vecxyz.copy(extentsMin, vertA)
        vecxyz.copy(extentsMax, vertA)
      } else {
        vecxyz.min(extentsMin, vertA, extentsMin)
        vecxyz.max(extentsMax, vertA, extentsMax)
      }
    }
  }
})()

/** @type {<PA extends VecXYZ, BN extends VecXYZ>(pointA: PA, planeBNormal: BN, planeBConstant: number) => number} */
export function pointToPlane(pointA, planeBNormal, planeBConstant) {
  return vecxyz.dot( planeBNormal, pointA ) + planeBConstant
}

/** @type {<AS extends VecXYZ, AE extends VecXYZ, BN extends VecXYZ>(lineAStart: AS, lineAEnd: AE, planeBNormal: BN, planeBConstant: number) => number} */
export function lineToPlane(lineAStart, lineAEnd, planeBNormal, planeBConstant) {
  const startDist = pointToPlane( lineAStart, planeBNormal, planeBConstant )
  const endDist = pointToPlane( lineAEnd, planeBNormal, planeBConstant )
  return (startDist > 0 && endDist > 0) || (startDist < 0 && endDist < 0) ? Math.min(startDist, endDist) : 0
}

/** @type {<AC extends VecXYZ, BN extends VecXYZ>(sphereACenter: AC, sphereARadius: Distance, planeBNormal: BN, planeBConstant: number) => number} */
export function sphereToPlane(sphereACenter, sphereARadius, planeBNormal, planeBConstant) {
  return pointToPlane( sphereACenter, planeBNormal, planeBConstant ) - sphereARadius
}

/** @type {<AC extends VecXYZ, BC extends VecXYZ>(sphereACenter: AC, sphereARadius: Distance, sphereBCenter: BC, sphereBRadius: Distance) => number} */
export function sphereToSphere(sphereACenter, sphereARadius, sphereBCenter, sphereBRadius) {
  return vecxyz.distance(sphereACenter, sphereBCenter) - sphereARadius - sphereBRadius
}

/** @type {<AN extends VecXYZ, AX extends VecXYZ, BN extends VecXYZ, BX extends VecXYZ>(aabbAMin: AN, aabbAMax: AX, aabbBMin: BN, aabbBMax: BX) => number} */
export function aabbToAabb(aabbAMin, aabbAMax, aabbBMin, aabbBMax) {
  const outerX = Math.max(aabbAMax.x, aabbBMax.x) - Math.min(aabbAMin.x, aabbBMin.x)
  const outerY = Math.max(aabbAMax.y, aabbBMax.y) - Math.min(aabbAMin.y, aabbBMin.y)
  const outerZ = Math.max(aabbAMax.z, aabbBMax.z) - Math.min(aabbAMin.z, aabbBMin.z)
  const innerX = outerX - (aabbAMax.x - aabbAMin.x) - (aabbBMax.x - aabbBMin.x)
  const innerY = outerY - (aabbAMax.y - aabbAMin.y) - (aabbBMax.y - aabbBMin.y)
  const innerZ = outerZ - (aabbAMax.z - aabbAMin.z) - (aabbBMax.z - aabbBMin.z)
  const isOverlapping = innerX < 0 && innerY < 0 && innerZ < 0
  return (isOverlapping ? -1 : 1) * Math.hypot(innerX, innerY, innerZ)
}

// Returns true if two boxes overlap
/** @typedef {<AN extends VecXYZ, AX extends VecXYZ, BN extends VecXYZ, BX extends VecXYZ>(boxAMin: AN, boxAMax: AX, affineA: Affine4, boxBMin: BN, boxBMax: BX, affineB: Affine4) => number} BoxToBoxFn */
/** @type {BoxToBoxFn} */
export const boxToBox = (function() {
  let extentsMin = {x:0,y:0,z:0}
  let extentsMax = {x:0,y:0,z:0}

  /** @type {<AN extends VecXYZ, AX extends VecXYZ, BN extends VecXYZ, BX extends VecXYZ>(boxAMin: AN, boxAMax: AX, affineA: Affine4, boxBMin: BN, boxBMax: BX, affineB: Affine4) => number} */
  function boxSATDistance(boxAMin, boxAMax, affineA, boxBMin, boxBMax, affineB) {
    separatingAxis(extentsMin, extentsMax, boxAMin, boxAMax, affineA, affineB)

    // returns the distance
    return Math.max(extentsMin.x - boxBMax.x, extentsMin.y - boxBMax.y, extentsMin.z - boxBMax.z,
      boxBMin.x - extentsMax.x, boxBMin.y - extentsMax.y, boxBMin.z - extentsMax.z)
  }
  
  return /** @type {BoxToBoxFn} */ function boxToBox(boxAMin, boxAMax, affineA, boxBMin, boxBMax, affineB) {
    const dAB = boxSATDistance(boxAMin, boxAMax, affineA, boxBMin, boxBMax, affineB)
    const dBA = boxSATDistance(boxBMin, boxBMax, affineB, boxAMin, boxAMax, affineA)
    return Math.max(dAB, dBA)
  }
  
})()

// Returns the distance between pointA and the surface of boxB. Negative values indicate
// that pointA is inside of boxB
/** @typedef {<PA extends VecXYZ, BN extends VecXYZ, BX extends VecXYZ>(pointA: PA, boxBMin: BN, boxBMax: BX, affineB: Affine4) => number} PointToBoxFn */
/** @type {PointToBoxFn} */
export const pointToBox = (function() {
  let vertA = {x:0,y:0,z:0}
  let scaleA = {x:1,y:1,z:1}

  return /** @type {PointToBoxFn} */function pointToBox(pointA, boxBMin, boxBMax, affineB) {
    affine4.decompose( affineB, undefined, undefined, scaleA )
    affine4.invertAndMultiplyVecXYZ( vertA, affineB, pointA )
    const vx = vertA.x, vy = vertA.y, vz = vertA.z
    const minx = boxBMin.x - vx, miny = boxBMin.y - vy, minz = boxBMin.z - vz
    const maxx = vx - boxBMax.x, maxy = vy - boxBMax.y, maxz = vz - boxBMax.z
    const dx = Math.max(maxx, minx)*scaleA.x
    const dy = Math.max(maxy, miny)*scaleA.y
    const dz = Math.max(maxz, minz)*scaleA.z

    // for points inside (dx and dy and dz < 0) take the smallest distent to an edge, otherwise
    // determine the hypotenuese to the outside edges
    return dx <= 0 && dy <= 0 && dz <= 0 ? Math.max(dx, dy, dz) : Math.hypot(Math.max(0, dx), Math.max(0, dy), Math.max(0, dz))
  }
})()

import * as vecxyz from "./vecxyz.js"
import * as affine4 from "./affine4.js"

export function pointToPlane(pointA, planeBNormal, planeBConstant) {
  return vecxyz.dot( planeBNormal, pointA ) + planeBConstant
}

export function lineToPlane(lineAStart, lineAEnd, planeBNormal, planeBConstant) {
  const startDist = pointToPlane( lineAStart, planeBNormal, planeBConstant )
  const endDist = pointToPlane( lineAEnd, planeBNormal, planeBConstant )
  return (startDist > 0 && endDist > 0) || (startDist < 0 && endDist < 0) ? Math.min(startDist, endDist) : 0
}

export function sphereToPlane(sphereACenter, sphereARadius, planeBNormal, planeBConstant) {
  return pointToPlane( sphereACenter, planeBNormal, planeBConstant ) - sphereARadius
}

export function sphereToSphere(sphereACenter, sphereARadius, sphereBCenter, sphereBRadius) {
  return vecxyz.distance(sphereACenter, sphereBCenter) - sphereARadius - sphereBRadius
}

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

/**
 * Returns true if two boxes overlap
 * 
 * @param {{x,y,z}} boxAMin - min extent of boxA
 * @param {{x,y,z}} boxAMax - max extent of boxA
 * @param {number[]} affineA - column-wise 4x4 affine matrix for boxA
 * @param {{x,y,z}} boxBMin - min extent of boxB
 * @param {{x,y,z}} boxBMax - max extent of boxB
 * @param {number[]} affineB - column-wise 4x4 affine matrix for boxB
 */
export const boxToBox = (function() {
  let vertA = {}
  let extentsMin = {}
  let extentsMax = {}

  // map boxA into boxB space, such that boxB is aligned to X,Y and Z axes and centered around 0,0,0
  function boxSATDistance(boxAMin, boxAMax, affineA, boxBMin, boxBMax, affineB) {
    // map boxB into boxA space, and determine the extents
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

    // returns the distance
    return Math.max(extentsMin.x - boxBMax.x, extentsMin.y - boxBMax.y, extentsMin.z - boxBMax.z,
      boxBMin.x - extentsMax.x, boxBMin.y - extentsMax.y, boxBMin.z - extentsMax.z)
  }
  
  return function boxToBox(boxAMin, boxAMax, affineA, boxBMin, boxBMax, affineB) {
    const dAB = boxSATDistance(boxAMin, boxAMax, affineA, boxBMin, boxBMax, affineB)
    const dBA = boxSATDistance(boxBMin, boxBMax, affineB, boxAMin, boxAMax, affineA)
    return Math.max(dAB, dBA)
  }
  
})()

/**
 * Returns the distance between pointA and the surface of boxB. Negative values indicate
 * that pointA is inside of boxB
 * 
 * @param {{x,y,z}} pointA - point
 * @param {{x,y,z}} boxBMin - min extents of boxB
 * @param {{x,y,z}} boxBMax - max extents of boxB
 * @param {float32[16]} affineB - colum-wise matrix for B
 * @param {{x,y,z}} extraScale - additional scale to apply to the output distance
 */
export const pointToBox = (function() {
  let vertA = {}
  let scaleA = {}

  return function pointToBox(pointA, boxBMin, boxBMax, affineB) {
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

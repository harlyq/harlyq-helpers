import * as vecxyz from "./vecxyz.js"
import * as quatxyzw from "./quatxyzw.js"
// import * as debugPlot from "./debug-plot.js"

/**
 * Returns true if two axis-aligned bounding boxes (AABB) overlap
 * 
 * @param {{x,y,z}} aabbAMin - min extent of AABB A
 * @param {{x,y,z}} aabbAMax - max extent of AABB A
 * @param {{x,y,z}} aabbBMin - min extent of AABB B
 * @param {{x,y,z}} aabbBMax - max extent of AABB B
 */
export function aabbWithAabb(aabbAMin, aabbAMax, aabbBMin, aabbBMax) {
  return aabbAMin.x <= aabbBMax.x && aabbAMin.y <= aabbBMax.y && aabbAMin.z <= aabbBMax.z &&
    aabbBMin.x <= aabbAMax.x && aabbBMin.y <= aabbAMax.y && aabbBMin.z <= aabbAMax.z
}

/**
 * Returns true if two boxes overlap
 * 
 * @param {{x,y,z}} boxAMin - min extent of boxA
 * @param {{x,y,z}} boxAMax - max extent of boxA
 * @param {{x,y,z}} posA - center of boxA
 * @param {{x,y,z,w}} quatA - rotation of boxA
 * @param {{x,y,z}} boxBMin - min extent of boxB
 * @param {{x,y,z}} boxBMax - max extent of boxB
 * @param {{x,y,z}} posB - center of boxB
 * @param {{x,y,z,w}} quatB - rotation of boxB
 */
export const boxWithBox = (function() {
  let vertA = {}
  let invQuatB = {}
  let extentsMin = {}
  let extentsMax = {}
  let invScaleB = {}

  // map boxA into boxB space, such that boxB is aligned to X,Y and Z axes and centered around 0,0,0
  function boxSAT(boxAMin, boxAMax, posA, quatA, scaleA, boxBMin, boxBMax, posB, quatB, scaleB) {
    // quatxyzw.conjugate(invQuatB, quatB)
    // vecxyz.sub(posAB, posA, posB)
    // vecxyz.divide(scaleA_B, scaleA, scaleB)
    quatxyzw.conjugate(invQuatB, quatB)
    vecxyz.inverse(invScaleB, scaleB)

    // map boxB into boxA space, and determine the extents
    for (let corner = 0; corner < 8; corner++) {
      vertA.x = corner % 2 ? boxAMax.x : boxAMin.x
      vertA.y = (corner >>> 1) % 2 ? boxAMax.y : boxAMin.y
      vertA.z = (corner >>> 2) % 2 ? boxAMax.z : boxAMin.z

      // vertA = (vertA*scaleA*(1/scaleB)*quatA*cong(quatB) + posA - posB)
      // vecxyz.add( vertA, vecxyz.transformQuaternion( vertA, vecxyz.transformQuaternion( vertA, vecxyz.multiply( vertA, vertA, scaleA_B ), quatA ), invQuatB ), posAB )
      // map vertA into boxA space (scaleA -> quatA -> posA)
      vecxyz.add( vertA, vecxyz.transformQuaternion( vertA, vecxyz.multiply( vertA, vertA, scaleA ), quatA ), posA )
      // map vertA into boxB space (-posB -> cong(quatB) -> 1/scaleB)
      vecxyz.multiply( vertA, vecxyz.transformQuaternion( vertA, vecxyz.sub( vertA, vertA, posB ), invQuatB ), invScaleB )

      if (corner === 0) {
        vecxyz.copy(extentsMin, vertA)
        vecxyz.copy(extentsMax, vertA)
      } else {
        vecxyz.min(extentsMin, vertA, extentsMin)
        vecxyz.max(extentsMax, vertA, extentsMax)
      }
    }

    // returns true if there are NO separating axes
    return extentsMin.x <= boxBMax.x && extentsMin.y <= boxBMax.y && extentsMin.z <= boxBMax.z &&
      boxBMin.x <= extentsMax.x && boxBMin.y <= extentsMax.y && boxBMin.z <= extentsMax.z
  }
  
  return function boxWithBox(boxAMin, boxAMax, posA, quatA, scaleA, boxBMin, boxBMax, posB, quatB, scaleB) {
    return boxSAT(boxAMin, boxAMax, posA, quatA, scaleA, boxBMin, boxBMax, posB, quatB, scaleB) &&
           boxSAT(boxBMin, boxBMax, posB, quatB, scaleB, boxAMin, boxAMax, posA, quatA, scaleA)
  }
  
})()

/**
 * Returns true if two spheres overlap
 * 
 * @param {{x,y,z}} sphereACenter 
 * @param {number} sphereARadius 
 * @param {{x,y,z}} sphereBCenter 
 * @param {number} sphereBRadius 
 */
export function sphereWithSphere(sphereACenter, sphereARadius, sphereBCenter, sphereBRadius) {
  return vecxyz.distance(sphereACenter, sphereBCenter) - sphereARadius - sphereBRadius < 0
}

export const sphereWithBox = (function() {
  let vertA = {}
  let invQuatB = {}
  const square = (x) => x*x

  return function sphereWithBox(sphereACenter, sphereARadius, boxBMin, boxBMax, posB, quatB, scaleB) {
    // map sphere into boxB space
    quatxyzw.conjugate( invQuatB, quatB )
    vecxyz.transformQuaternion( vertA, vecxyz.divide( vertA, vecxyz.sub(vertA, sphereACenter, posB), scaleB ), invQuatB )
    
    let distanceSq = 
      (vertA.x < boxBMin.x ? square(boxBMin.x - vertA.x) : vertA.x > boxBMax.x ? square(vertA.x - boxBMax.x) : 0) + 
      (vertA.y < boxBMin.y ? square(boxBMin.y - vertA.y) : vertA.y > boxBMax.y ? square(vertA.y - boxBMax.y) : 0) + 
      (vertA.z < boxBMin.z ? square(boxBMin.z - vertA.z) : vertA.z > boxBMax.z ? square(vertA.z - boxBMax.z) : 0)
    return distanceSq < sphereARadius*sphereARadius
  }
})()
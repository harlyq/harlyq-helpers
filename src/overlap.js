import * as vecxyz from "./vecxyz.js"
import * as quatxyzw from "./quatxyzw.js"

/** 
 * @typedef {{x: number, y: number, z: number}} VecXYZ
 * @typedef {{x: number, y: number, z: number, w: number}} QuatXYZW
 * @typedef {number} Distance
 */

// Returns true if two axis-aligned bounding boxes (AABB) overlap
/** @type {<AN extends VecXYZ, AX extends VecXYZ, BN extends VecXYZ, BX extends VecXYZ>(aabbAMin: AN, aabbAMax: AX, aabbBMin: BN, aabbBMax: BX) => boolean} */
export function aabbWithAabb(aabbAMin, aabbAMax, aabbBMin, aabbBMax) {
  return aabbAMin.x <= aabbBMax.x && aabbAMin.y <= aabbBMax.y && aabbAMin.z <= aabbBMax.z &&
    aabbBMin.x <= aabbAMax.x && aabbBMin.y <= aabbAMax.y && aabbBMin.z <= aabbAMax.z
}

// Returns true if two boxes overlap
/** @typedef {<AN extends VecXYZ, AX extends VecXYZ, PA extends VecXYZ, QA extends QuatXYZW, SA extends VecXYZ, BN extends VecXYZ, BX extends VecXYZ, PB extends VecXYZ, QB extends QuatXYZW, SB extends VecXYZ>(boxAMin: AN, boxAMax: AX, posA: PA, quatA: QA, scaleA: SA, boxBMin: BN, boxBMax: BX, posB: PB, quatB: QB, scaleB: SB) => boolean} BoxWithBoxFn */
/** @type {BoxWithBoxFn} */
export const boxWithBox = (function() {
  let vertA = {x:0,y:0,z:0}
  let invQuatB = {x:0,y:0,z:0,w:1}
  let extentsMin = {x:0,y:0,z:0}
  let extentsMax = {x:0,y:0,z:0}
  let invScaleB = {x:0,y:0,z:0}

  // map boxA into boxB space, such that boxB is aligned to X,Y and Z axes and centered around 0,0,0
  /** @type {<AN extends VecXYZ, AX extends VecXYZ, PA extends VecXYZ, QA extends QuatXYZW, SA extends VecXYZ, BN extends VecXYZ, BX extends VecXYZ, PB extends VecXYZ, QB extends QuatXYZW, SB extends VecXYZ>(boxAMin: AN, boxAMax: AX, posA: PA, quatA: QA, scaleA: SA, boxBMin: BN, boxBMax: BX, posB: PB, quatB: QB, scaleB: SB) => boolean} */
  function boxSAT(boxAMin, boxAMax, posA, quatA, scaleA, boxBMin, boxBMax, posB, quatB, scaleB) {
    quatxyzw.conjugate(invQuatB, quatB)
    vecxyz.inverse(invScaleB, scaleB)

    // map boxB into boxA space, and determine the extents
    for (let corner = 0; corner < 8; corner++) {
      vertA.x = corner % 2 ? boxAMax.x : boxAMin.x
      vertA.y = (corner >>> 1) % 2 ? boxAMax.y : boxAMin.y
      vertA.z = (corner >>> 2) % 2 ? boxAMax.z : boxAMin.z

      vecxyz.add( vertA, vecxyz.transformQuaternion( vertA, vecxyz.multiply( vertA, vertA, scaleA ), quatA ), posA )
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
  
  return /** @type {BoxWithBoxFn} */ function boxWithBox(boxAMin, boxAMax, posA, quatA, scaleA, boxBMin, boxBMax, posB, quatB, scaleB) {
    return boxSAT(boxAMin, boxAMax, posA, quatA, scaleA, boxBMin, boxBMax, posB, quatB, scaleB) &&
           boxSAT(boxBMin, boxBMax, posB, quatB, scaleB, boxAMin, boxAMax, posA, quatA, scaleA)
  }
  
})()

// Returns true if two spheres overlap
/** @type {<AC extends VecXYZ, BC extends VecXYZ>(sphereACenter: AC, sphereARadius: Distance, sphereBCenter: BC, sphereBRadius: Distance) => boolean} */
export function sphereWithSphere(sphereACenter, sphereARadius, sphereBCenter, sphereBRadius) {
  return vecxyz.distance(sphereACenter, sphereBCenter) - sphereARadius - sphereBRadius < 0
}

/** @typedef {<AC extends VecXYZ, BN extends VecXYZ, BX extends VecXYZ, PB extends VecXYZ, QB extends QuatXYZW, SB extends VecXYZ>(sphereACenter: AC, sphereARadius: Distance, boxBMin: BN, boxBMax: BX, posB: PB, quatB: QB, scaleB: SB) => boolean} SphereWithBoxFn */
/** @type {SphereWithBoxFn} */
export const sphereWithBox = (function() {
  let vertA = {x:0,y:0,z:0}
  let invQuatB = {x:0,y:0,z:0,w:1}
  const square = (x) => x*x

  return /** @type {SphereWithBoxFn} */function sphereWithBox(sphereACenter, sphereARadius, boxBMin, boxBMax, posB, quatB, scaleB) {
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
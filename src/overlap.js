import * as vecxyz from "./vecxyz.js"
import * as quatxyzw from "./quatxyzw.js"
import * as proximity from "./proximity.js"

/** 
 * @typedef {{x: number, y: number, z: number}} VecXYZ
 * @typedef {{x: number, y: number, z: number, w: number}} QuatXYZW
 * @typedef {Float32Array | number[]} Affine4
 * @typedef {number} Distance
 */

// Returns true if two axis-aligned bounding boxes (AABB) overlap
/** @type {<AN extends VecXYZ, AX extends VecXYZ, BN extends VecXYZ, BX extends VecXYZ>(aabbAMin: AN, aabbAMax: AX, aabbBMin: BN, aabbBMax: BX) => boolean} */
export function aabbWithAabb(aabbAMin, aabbAMax, aabbBMin, aabbBMax) {
  return aabbAMin.x <= aabbBMax.x && aabbAMin.y <= aabbBMax.y && aabbAMin.z <= aabbBMax.z &&
    aabbBMin.x <= aabbAMax.x && aabbBMin.y <= aabbAMax.y && aabbBMin.z <= aabbAMax.z
}

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

/** @type {<AN extends VecXYZ, AX extends VecXYZ, BN extends VecXYZ, BX extends VecXYZ>(boxAMin: AN, boxAMax: AX, affineA: Affine4, boxBMin: BN, boxBMax: BX, affineB: Affine4) => boolean} */
export function boxWithBox(boxAMin, boxAMax, affineA, boxBMin, boxBMax, affineB) {
  return proximity.boxToBox(boxAMin, boxAMax, affineA, boxBMin, boxBMax, affineB) < 0
}

/** @typedef {<AN extends VecXYZ, AX extends VecXYZ, BN extends VecXYZ, BX extends VecXYZ>(boxAMin: AN, boxAMax: AX, affineA: Affine4, boxBMin: BN, boxBMax: BX, affineB: Affine4) => boolean} BoxWithinBoxFn */
/** @type {BoxWithinBoxFn} */
export const boxWithinBox = (function() {
  let extentsMin = {x:0,y:0,z:0}
  let extentsMax = {x:0,y:0,z:0}

  return /** @type {BoxWithinBoxFn} */ function boxWithinBox(boxAMin, boxAMax, affineA, boxBMin, boxBMax, affineB) {
    proximity.separatingAxis(extentsMin, extentsMax, boxAMin, boxAMax, affineA, affineB)

    return extentsMin.x > boxBMin.x && extentsMin.y > boxBMin.y && extentsMin.z > boxBMin.z &&
      extentsMax.x < boxBMax.x && extentsMax.y < boxBMax.y && extentsMax.z < boxBMax.z
  }

})()

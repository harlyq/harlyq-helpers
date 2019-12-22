import * as vecxyz from "./vecxyz.js"
import * as proximity from "./proximity.js"

/** 
 * @typedef {{x: number, y: number, z: number}} VecXYZ
 */

/** @typedef {<TS extends VecXYZ, TE extends VecXYZ, TN extends VecXYZ>(lineAStart: TS, lineAEnd: TE, planeBNormal: TN, planeBConstant: number) => number | undefined} LineAndPlaneFunction */
/** @type {LineAndPlaneFunction} */
export const lineAndPlane = (function () {
  const ray = {x:0, y:0, z:0}

  return /** @type {LineAndPlaneFunction} */ function lineAndPlane(lineAStart, lineAEnd, planeBNormal, planeBConstant) {
    vecxyz.sub(ray, lineAEnd, lineAStart)
    const size = vecxyz.dot(planeBNormal, ray)
    if (size === 0) {
      if (proximity.pointToPlane(lineAStart, planeBNormal, planeBConstant) === 0) {
        return 0 // lineA is coplanar, return the start point as the intersection
      }
      return undefined // lineA is parallel to the planeB, but not on the planeB
    }
  
    const t = -( vecxyz.dot(lineAStart, planeBNormal) + planeBConstant ) / size
    return t
  } 
  
})()

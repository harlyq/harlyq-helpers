import * as vecxyz from "./vecxyz.js"
import * as proximity from "./proximity.js"

/** 
 * @typedef {{x: number, y: number, z: number}} VecXYZ
 */

/** @type {<T extends VecXYZ, TS extends VecXYZ, TE extends VecXYZ, TN extends VecXYZ>(out: T, lineAStart: TS, lineAEnd: TE, planeBNormal: TN, planeBConstant: number) => T} */
export function intersectionLineAndPlane(out, lineAStart, lineAEnd, planeBNormal, planeBConstant) {
  vecxyz.sub(out, lineAEnd, lineAStart)
  const size = vecxyz.dot(planeBNormal, out)
  if (size === 0) {
    if (proximity.pointToPlane(lineAStart, planeBNormal, planeBConstant) === 0) {
      vecxyz.copy(out, lineAStart) // lineA is coplanar, return the start point as the intersection
      return out
    }
    return undefined // lineA is parallel to the planeB, but not on the planeB
  }

  const t = -( vecxyz.dot(lineAStart, planeBNormal) + planeBConstant ) / size
  if (t < 0 || t > 1) {
    return undefined
  }

  return vecxyz.scaleAndAdd(out, lineAStart, out, t)
}

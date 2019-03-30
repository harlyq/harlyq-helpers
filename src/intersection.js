import * as vecxyz from "./vecxyz.js"
import * as proximity from "./proximity.js"

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

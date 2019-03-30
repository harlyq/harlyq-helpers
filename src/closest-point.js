import * as utils from "./utils.js"
import * as vecxyz from "./vecxyz"

export const lineToPointParametric = (function () {
  let startToPoint = {}
  let startToEnd = {}

  return function lineToPointParametric(lineAStart, lineAEnd, pointB) {
    vecxyz.sub(startToPoint, pointB, lineAStart)
    vecxyz.sub( startToEnd, lineAEnd, lineAStart)
    const d2 = vecxyz.dot(startToEnd, startToEnd) || 1
    const dPointToLine = vecxyz.dot(startToEnd, startToPoint)
    const t = dPointToLine / d2
    return t
  }
})()

export function lineToPoint(out, lineAStart, lineAEnd, pointB, clampToLine = true) {
  const t = lineToPointParametric(lineAStart, lineAEnd, pointB)
  const finalT = clampToLine ? utils.clamp(t, 0, 1) : t
  vecxyz.normalize( out, vecxyz.sub(out, lineAEnd, lineAStart) )
  return vecxyz.scaleAndAdd(out, lineAStart, out, finalT)
}


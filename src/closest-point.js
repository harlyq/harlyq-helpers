import * as utils from "./utils.js"
import * as vecxyz from "./vecxyz"

/**
 * @typedef {{x: number, y: number, z: number}} VecXYZ
 */

/** @typedef {<TS extends VecXYZ, TE extends VecXYZ, TP extends VecXYZ>(lineAStart: TS, lineAEnd: TE, pointB: TP) => number} LineToPointParametriceFn */
/** @type {LineToPointParametriceFn} */
export const lineToPointParametric = (function () {
  let startToPoint = {x: 0, y: 0, z: 0}
  let startToEnd = {x: 0, y: 0, z: 0}

  return /** @type {LineToPointParametriceFn} */ function lineToPointParametric(lineAStart, lineAEnd, pointB) {
    vecxyz.sub(startToPoint, pointB, lineAStart)
    vecxyz.sub( startToEnd, lineAEnd, lineAStart)
    const d2 = vecxyz.dot(startToEnd, startToEnd) || 1
    const dPointToLine = vecxyz.dot(startToEnd, startToPoint)
    const t = dPointToLine / d2
    return t
  }
})()

/** @type {<T extends VecXYZ, TS extends VecXYZ, TE extends VecXYZ, TP extends VecXYZ>(out: T, lineAStart: TS, lineAEnd: TE, pointB: TP, clampToLine: boolean) => T} */
export function lineToPoint(out, lineAStart, lineAEnd, pointB, clampToLine = true) {
  const t = lineToPointParametric(lineAStart, lineAEnd, pointB)
  const finalT = clampToLine ? utils.clamp(t, 0, 1) : t
  vecxyz.normalize( out, vecxyz.sub(out, lineAEnd, lineAStart) )
  return vecxyz.scaleAndAdd(out, lineAStart, out, finalT)
}


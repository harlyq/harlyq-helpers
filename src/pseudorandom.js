/**
 * @typedef {{r: number, g: number, b: number}} RGBColor
 */

/** @type {<T>(list: T[], randFn: () => number) => T} */
export function entry(list, randFn = Math.random) {
  return list[ index(list.length, randFn) ]
}

/** @type {(length: number, randFn: () => number) => number} */
export function index(length, randFn = Math.random) {
  return ~~(randFn()*length)
}

// range is (min,max)
/** @type {(min: number, max: number, randFn: () => number) => number} */
export function integer(min, max, randFn = Math.random) {
  if (max === min) return min
  return ~~(randFn()*(max + 1 - min) + min)
}

// range is (min,max]
/** @type {(min: number, max: number, randFn: () => number) => number} */
export function float(min, max, randFn = Math.random) {
  if (max === min) return min
  return randFn()*(max - min) + min
}

// in RGB space. TODO rgbMax should be a valid result
/** @type {<T extends RGBColor, RN extends RGBColor, RX extends RGBColor>(out: T, rgbMin: RN, rgbMax: RX, randFn: () => number) => T} */
export function color(out, rgbMin, rgbMax, randFn = Math.random) {
  out.r = float(rgbMin.r, rgbMax.r, randFn)
  out.g = float(rgbMin.g, rgbMax.g, randFn)
  out.b = float(rgbMin.b, rgbMax.b, randFn)
  return out
}

/** @type {<T extends {x:number, y:number, z?:number, w?:number}>(out: T, vecMin: T, vecMax: T, randFn: () => number) => T} */
export function vector(out, vecMin, vecMax, randFn = Math.random) {
  out.x = float(vecMin.x, vecMax.x, randFn)
  out.y = float(vecMin.y, vecMax.y, randFn)
  if ('z' in vecMin && 'z' in vecMax) { out.z = float(vecMin.z, vecMax.z, randFn) }
  if ('w' in vecMin && 'w' in vecMax) { out.w = float(vecMin.w, vecMax.w, randFn) }
  return out
}

// https://en.wikipedia.org/wiki/Linear_congruential_generator
export function lcg() {
  let seed = -1
  
  /** @type {(s: number) => void}*/
  function setSeed(s) {
    seed = s
  }

  /** @type {() => number} */
  function random() {
    if (seed < 0) {
      return Math.random()
    }
  
    seed = (1664525*seed + 1013904223) % 0x100000000
    return seed/0x100000000
  }
  
  return {
    setSeed,
    random,
  }
}
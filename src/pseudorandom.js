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

/** @type {(out: number[], vecMin: number[], vecMax: number[], randFn: () => number) => number[]} */
export function vector(out, vecMin, vecMax, randFn = Math.random) {
  const lengthOfMin = vecMin.length
  const lengthOfMax = vecMax.length
  const m = Math.min(lengthOfMin, lengthOfMax)
  out.length = Math.max(lengthOfMin, lengthOfMax)

  for (let i = 0; i < m; i++) {
    out[i] = float(vecMin[i], vecMax[i], randFn)
  }

  if (lengthOfMax > lengthOfMin) {
    for (let i = m; i < lengthOfMax; i++) {
      out[i] = vecMax[i]
    }
  } else {
    for (let i = m; i < lengthOfMin; i++) {
      out[i] = vecMin[i]
    }
  }
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
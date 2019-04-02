/**
 * @param {any[]} list 
 * @param {function() : number} randFn 
 * @returns {any}
 */
export function entry(list, randFn = Math.random) {
  return list[ index(list.length, randFn) ]
}

/**
 * @param {number} length
 * @param {function() : number} randFn 
 * @returns {number}
 */
export function index(length, randFn = Math.random) {
  return ~~(randFn()*length)
}

/**
 * range is (min,max)
 * @param {number} min
 * @param {number} max
 * @param {function() : number} randFn 
 * @returns {number}
 */
export function integer(min, max, randFn = Math.random) {
  if (max === min) return min
  return ~~(randFn()*(max + 1 - min) + min)
}

/**
 * range is (min,max]
 * @param {number} min
 * @param {number} max
 * @param {function() : number} randFn 
 * @returns {number}
 */
export function float(min, max, randFn = Math.random) {
  if (max === min) return min
  return randFn()*(max - min) + min
}

/**
 * in RGB space. TODO rgbMax should be a valid result
 * @param {Object} out
 * @param {{r,g,b}} rgbMin
 * @param {{r,g,b}} rgbMax
 * @param {function() : number} randFn 
 * @returns {{r,g,b}}
 */
export function color(out, rgbMin, rgbMax, randFn = Math.random) {
  out.r = float(rgbMin.r, rgbMax.r, randFn)
  out.g = float(rgbMin.g, rgbMax.g, randFn)
  out.b = float(rgbMin.b, rgbMax.b, randFn)
  return out
}

/**
 * 
 * @param {number[]} out 
 * @param {number[]} vecMin 
 * @param {number[]} vecMax 
 * @param {function() : number} randFn
 * @returns {number[]}
 */
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
  
  /**
   * 
   * @param {number} s 
   */
  function setSeed(s) {
    seed = s
  }
  
  /**
   * 
   * @returns {number}
   */
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
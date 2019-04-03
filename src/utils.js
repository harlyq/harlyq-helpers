/** @type {(v: number, min: number, max: number) => number} */
export function clamp(v, min, max) {
  return v < min ? min : v > max ? max : v
}

/** @type {(v: number, m: number) => number} */
export function euclideanModulo(v, m) {
  return ( ( v % m ) + m ) % m  
}

/** @type {(a: number, b: number, t: number) => number} */
export function lerp(a, b, t) {
  return a + (b - a)*t
}

/** @type {<T extends {[key: string]: number}>(out: T, a: {[key: string]: number}, b: {[key: string]: number}, t: number) => T} */
export function lerpObject(out, a, b, t) {
  Object.assign(out, b) // copy values from b in case the keys do not exist in a
  for (let k in a) {
    out[k] = typeof b[k] !== "undefined" ? lerp(a[k], b[k], t) : a[k]
  }
  return out
}

/** @type {(a: any, b: any) => boolean} */
export function deepEquals(a, b) {
  if (typeof a === "object" && typeof b === "object") {
    if (typeof a[Symbol.iterator] === "function" && typeof b[Symbol.iterator] === "function") {
      if (a.length !== b.length) {
        return false
      }
      for (let i = 0; i < a.length; i++) {
        const aValue = a[i]
        const bValue = b[i]
        if (typeof aValue === "object" && typeof bValue === "object") {
          if (!deepEquals(aValue, bValue)) {
            return false
          }
        } else if (aValue !== bValue) {
          return false
        }
      }

    } else {
      const aKeys = Object.keys(a)
      const bKeys = Object.keys(b)
      if (aKeys.length !== bKeys.length && aKeys.every(x => bKeys.includes(x))) {
        return false
      }

      for (let key in a) {
        const aValue = a[key]
        const bValue = b[key]
        if (typeof aValue === "object" && typeof bValue === "object") {
          if (!deepEquals(aValue, bValue)) {
            return false
          }
        } else if (aValue !== bValue) {
          return false
        }
      }
    }

    return true
  }

  return a === b
}

/** @type {(a: number, b: number, step: number) => number[]} */
export function range(a, b = undefined, step = undefined) {
  if (b === undefined) {
    if (a === 0) { 
      return [] 
    }
    b = a - 1
    a = 0
  }
  if (step === undefined) {
    step = Math.sign(b - a) || 1
  }
  return Array.from( {length: Math.floor((b - a)/step + 1)}, (_,i) => i*step + a )
}

/** @type {<T extends any[]>(list: T, i: number) => T} */
export function unorderedRemoveAt(list, i) {
  const n = list.length
  if (i < n) {
    list[i] = list[n - 1]
    list.length = n - 1
  }
  return list
}

// returns a value from a 'root' and an array of 'properties', each property is considered the child of the previous property
/** @type {(root: {[key: string]: any}, properties: string[]) => any} */
export function getWithPath(root, properties) {
  let path = root
  let parts = properties.slice().reverse()
  while (path && parts.length > 0) {
    path = path[parts.pop()]
  }

  return path
}


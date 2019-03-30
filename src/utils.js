export function clamp(v, min, max) {
  return v < min ? min : v > max ? max : v
}

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


export function unorderedRemoveAt(list, i) {
  const n = list.length
  if (i < n) {
    list[i] = list[n - 1]
    list.length = n - 1
  }
}


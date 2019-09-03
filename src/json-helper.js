
export function query(json, queryFn, dataFn) {
  return queryInternal(json, queryFn, dataFn, true, [])
}

export function queryAll(json, queryFn, dataFn) {
  return queryInternal(json, queryFn, dataFn, false, [])
}

function queryInternal(json, queryFn, dataFn, onlyFirst, path) {
  let results = []

  if ( Array.isArray(json) ) {
    for ( let i = 0; i < json.length; i++ ) {
      const arrayResult = queryInternal( json[i], queryFn, dataFn, onlyFirst, path.concat(i) )
      if ( arrayResult && onlyFirst ) {
        return arrayResult
      } else if ( arrayResult ) {
        results.push( arrayResult )
      }
    }
    
  } else if (typeof json === "object") {
    const answer = queryFn( json )

    if (answer) {
      const recordResult = dataFn( answer, path, json )
      if (recordResult && onlyFirst) {
        return recordResult
      } else if (recordResult) {
        results.push(recordResult)
      }

    } else {
      for (let key in json) {
        const keyResult = queryInternal( json[key], queryFn, dataFn, onlyFirst, path.concat(key) )
        if (keyResult && onlyFirst) {
          return keyResult
        } else if (keyResult) {
          results.push(keyResult)
        }
      }
    }
  }

  return results
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

/** @type {(a: any) => any} */
export function deepCopy(a) {
  if (Array.isArray(a)) {
    let arrayCopy = []
    for (let i = 0; i < a.length; i++) {
      arrayCopy[i] = deepCopy(a[i])
    }
    return arrayCopy
  } else if (typeof a === "object") {
    let objectCopy = {}
    for (let k in a) {
      objectCopy[k] = deepCopy(a[k])
    }
    return objectCopy
  } else {
    return a
  }
}

// returns a value from a 'root' and an array of 'properties', each property is considered the child of the previous property
/** @type {(root: {[key: string]: any}, properties: string[]) => any} */
export function getWithPath(root, properties) {
  let path = root
  let parts = properties && Array.isArray(properties) ? properties.slice().reverse() : []
  while (path && parts.length > 0) {
    path = path[parts.pop()]
  }

  return path
}



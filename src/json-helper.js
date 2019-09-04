const IDENTITY_FN = x => x

/** @type {(json: any, queryFn: (json: any) => boolean, dataFn: (json: any, path: string[]) => any ) => any } */
export function query(json, queryFn, dataFn = IDENTITY_FN) {
  return queryInternal(json, queryFn, dataFn, true, [])
}

// depth first traversal
/** @type {(json: any, queryFn: (json: any) => boolean, dataFn: (json: any, path: string[]) => any ) => any } */
export function queryAll(json, queryFn, dataFn = IDENTITY_FN) {
  const result = queryInternal(json, queryFn, dataFn, false, [])
  return result ? result : []
}

/** @type {(json: any, queryFn: (json: any) => boolean, dataFn: (json: any, path: string[]) => any, onlyFirst: boolean, path: string[] ) => any } */
function queryInternal(json, queryFn, dataFn, onlyFirst, path) {
  let results = []
  
  if ( typeof json === 'object' && json !== null ) {
    const use = queryFn( json )

    if ( use ) {    
      const answer = dataFn( json, path )
      if ( onlyFirst ) {
        return answer
      } else {
        results.push( answer )
      }
    }
    
    const keys = Object.keys( json )

    for ( let i = 0; i < keys.length; i++ ) {
      const key = keys[i]
      const arrayResult = queryInternal( json[key], queryFn, dataFn, onlyFirst, path.concat(key) )
      if ( arrayResult !== undefined ) {
        if ( onlyFirst ) {
          return arrayResult
        } else if ( arrayResult ) {
          results.push( ...arrayResult )
        }
      }
    }
  }

  return onlyFirst ? results[0] : results.length > 0 ? results : undefined
}

/** @type {(json: any, queryFn: (json: any) => boolean) => number } */
export function countAll(json, queryFn) {
  let count = 0

  if ( typeof json === 'object' && json !== null ) {
    if ( queryFn( json ) ) {
      count++
    }

    if ( Array.isArray(json) ) {
      for ( let i = 0; i < json.length; i++ ) {
        count += countAll( json[i], queryFn )
      }  
    } else {
      for ( let key in json ) {
        count += countAll( json[key], queryFn )
      }
    }
  }

  return count
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



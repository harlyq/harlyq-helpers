/** @type {(json: any, queryFn: (json: any) => boolean, dataFn: (json: any, path: string[]) => any ) => any } */
export function query(json, queryFn, dataFn = undefined) {
  return queryInternal(json, queryFn, dataFn, true, [])
}

// depth first traversal
/** @type {(json: any, queryFn: (json: any) => boolean, dataFn: (json: any, path: string[]) => any ) => any } */
export function queryAll(json, queryFn, dataFn = undefined) {
  const result = queryInternal(json, queryFn, dataFn, false, [])
  return result ? result : []
}

/** @type {(json: any, queryFn: (json: any) => boolean, dataFn: (json: any, path: string[]) => any, onlyFirst: boolean, path: string[] ) => any } */
function queryInternal(json, queryFn, dataFn, onlyFirst, path) {
  let results = []
  
  if ( typeof json === 'object' && json !== null ) {
    const use = queryFn( json )

    if ( use ) {    
      const answer = typeof dataFn === 'function' ? dataFn( json, path ) : json
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

/** @type {(json: any, mapFn: (x: any) => any) => any} */
export function map(json, mapFn) {
  if (Array.isArray(json)) {
    return json.map( v => typeof v === "object" ? map(v, mapFn) : mapFn(v) )

  } else if (typeof json === "object") {
    let result = {}
    for (let k in json) {
      const v = json[k]
      result[k] = typeof v === "object" ? map(v, mapFn) : mapFn(v)
    }
    return result
  }

  return mapFn(json)
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
          if ( !deepEquals(aValue, bValue) ) {
            return false
          }
        } else if (aValue !== bValue) {
          return false
        }
      }

    } else {
      const aKeys = Object.keys(a)
      const bKeys = Object.keys(b)
      if ( aKeys.length !== bKeys.length && aKeys.every( x => bKeys.includes(x) ) ) {
        return false
      }

      for (let key in a) {
        const aValue = a[key]
        const bValue = b[key]
        if (typeof aValue === "object" && typeof bValue === "object") {
          if ( !deepEquals(aValue, bValue) ) {
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

export const deepEqual = deepEquals

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

// returns a value from a 'root' and an array of 'paths', each property is considered the child of the previous property
/** @type {(root: any, paths: string[]) => any} */
export function getWithPath(root, paths) {
  let value = root

  for (let i = 0; typeof value !== "undefined" && i < paths.length; i++) {
    value = value[ paths[i] ]
  }

  return value
}

function setByPath(result, value, base, paths) {
  let object = typeof result === "object" ? result[base] : {[base]: undefined}
  const n = paths.length

  for (let i = 0; i < n - 1; i++) {
    const path = paths[i]
    if ( !(path in object) ) {
      object[path] = typeof path === "number" ? [] : {}
    }
    object = object[path]
  }

  object[ n > 0 ? paths[n-1] : base ] = value
  return object
}

/** @type {(oldObject: any, newObject: any, callbackFn?: (oldObject: any, newObject: any, paths: (string|number)[], oldRoot: any, newRoot: any) => boolean, paths?: (string|number)[], oldRoot?: any, newRoot?: any, result?: any) => {added?:any, deleted?:any, updated?:any} } */
export function diff(oldObject, newObject, callbackFn = undefined, paths = [], oldRoot = undefined, newRoot = undefined, result = undefined) {
  const typeofOldObject = typeof oldObject
  const typeofNewObject = typeof newObject

  if (typeofOldObject === "object" || typeofNewObject === "object") {
    const isArray = Array.isArray(oldObject)
    for (let k in oldObject) {
      result = diff(oldObject[k], newObject[k], callbackFn, paths.concat( isArray ? Number(k) : k ), oldObject, newObject, result)
    }

    for (let k in newObject) {
      if (!(k in oldObject)) {
        result = diff(undefined, newObject[k], callbackFn, paths.concat( isArray ? Number(k) : k ), oldObject, newObject, result)
      }
    }

  } else if (typeofOldObject !== "undefined" || typeofNewObject !== "undefined") {
    const isIncluded = typeof callbackFn === "function" ? callbackFn(oldObject, newObject, paths, oldRoot, newRoot) : oldObject !== newObject

    if (isIncluded) {
      result = result || {}

      // no need to copy paths
      if (typeofOldObject === "undefined") {
        if (!("added" in result)) result["added"] = []
        result.added.push(paths)

      } else if (typeofNewObject === "undefined") {
        if (!("deleted" in result)) result["deleted"] = []
        result.deleted.push(paths)

      } else {
        if (!("updated" in result)) result["updated"] = []
        result.updated.push(paths)
      }
    }
  }

  return result
}
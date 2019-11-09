import * as pseudorandom from "./pseudorandom.js"
import * as rgbcolor from "./rgbcolor.js"

export const IDENTITY_FN = x => x
export const MODIFIER_NESTED = Symbol("nested")
export const MODIFIER_OVERWRITE = Symbol("overwrite")

/**
 * @typedef {{x: number, y: number}} VecXY
 * @typedef {{x: number, y: number, z: number}} VecXYZ
 * @typedef {{x: number, y: number, z: number, w: number}} VecXYZW
 * @typedef {{r: number, g: number, b: number}} RGBColor
 * @typedef {number | VecXY | VecXYZ | VecXYZW | RGBColor | string} AttributePart
 * @typedef {{range?: AttributePart[], options?: AttributePart[]}} Attribute
 */

/** @type {(str: string, conversionFn?: (any) => any) => Attribute} */
export function parse(str, conversionFn = IDENTITY_FN) {
  const rangeOption = parseRangeOption(str)
  if (rangeOption.range) {
    return { range: rangeOption.range.map( part => conversionFn( parsePart(part) ) ) }
  } else {
    return { options: rangeOption.options.map( part => conversionFn( parsePart(part) ) ) }
  }
}

/** @typedef {(str: string) => AttributePart} ParsePartFn */
/** @type {ParsePartFn} */
export const parsePart = (function() {
  const toNumber = str => Number(str.trim())
  
  return /** @type {ParsePartFn} */function parsePart(str) {
    if (str === "") {
      return ""
    }

    let vec = str.split(" ").filter(x => x !== "").map(toNumber)
    if (!vec.some(isNaN)) {
      switch (vec.length) {
        case 1: return vec[0]
        case 2: return {x: vec[0], y: vec[1]}
        case 3: return {x: vec[0], y: vec[1], z: vec[2]}
        case 4: return {x: vec[0], y: vec[1], z: vec[2], w: vec[3]}
      }
    }
  
    let col = rgbcolor.parse(str.trim())
    if (col) {
      return col
    }
  
    return str.trim()
  }
})()

function validateNumber(number) {
  return typeof number === "number"
}

function validateVec3(vec3) {
  return typeof vec3 === "object" && "x" in vec3 && "y" in vec3 && "z" in vec3
}

function validateColor(color) {
  return typeof color === "object" && "r" in color && "g" in color && "b" in color
}

function validateRangeOption(part, validateItemFn) {
  if (part.range) { return part.range.every(validateItemFn) }
  if (part.options) { return part.options.every(validateItemFn) }
  return false
}

/** @type {<T>(str: string, validateFn: (value:T) => boolean, conversionFn: (value:T) => T) => Attribute} */
function parseValue(str, validateFn, conversionFn = IDENTITY_FN) {
  const rangeOption = parse(str, conversionFn)
  return validateRangeOption(rangeOption, validateFn) ? rangeOption : undefined
}

/** @type {<T>(str: string, validateFn: (value:T) => boolean, permitEmpty: boolean, conversionFn: (value:T) => T) => Attribute[]} */
function parseArray(str, validateFn, permitEmpty, conversionFn = IDENTITY_FN) {
  if (str.trim() === "") {
    return []
  }
  
  const rangeOptions = nestedSplit(str, ",").flatMap( partStr => {
    const str = partStr.trim()
    return !permitEmpty || str ? parse(str, conversionFn) : undefined
   } )
  return rangeOptions.every( part => permitEmpty && part === undefined ? true : validateRangeOption(part, validateFn) ) ? rangeOptions : undefined
}

/** @type {(str: string, conversionFn: (RGBColor) => RGBColor) => Attribute} */
export function parseColor(str) {
  return parseValue(str, validateColor)
}

/** @type {(str: string, conversionFn: (RGBColor) => RGBColor) => Attribute[]} */
export function parseColorArray(str, conversionFn = IDENTITY_FN) {
  return parseArray(str, validateColor, false, conversionFn)
}

/** @type {(str: string, conversionFn: (RGBColor) => RGBColor) => Attribute[]} */
export function parseColorSparseArray(str, conversionFn = IDENTITY_FN) {
  return parseArray(str, validateColor, true, conversionFn)
}

/** @type {(str: string, conversionFn: (number) => number) => Attribute} */
export function parseNumber(str, conversionFn = IDENTITY_FN) {
  return parseValue(str, validateNumber, conversionFn)
}

/** @type {(str: string, conversionFn: (number) => number) => Attribute[]} */
export function parseNumberArray(str, conversionFn = IDENTITY_FN) {
  return parseArray(str, validateNumber, false, conversionFn)
}

/** @type {(str: string, conversionFn: (number) => number) => Attribute[]} */
export function parseNumberSparseArray(str, conversionFn = IDENTITY_FN) {
  return parseArray(str, validateNumber, true, conversionFn)
}

/** @type {(str: string, conversionFn: (value:VecXYZ) => VecXYZ) => Attribute} */
export function parseVec3(str, conversionFn = IDENTITY_FN) {
  return parseValue(str, validateVec3, conversionFn)
}

/** @type {(str: string, conversionFn: (value: VecXYZ) => VecXYZ) => Attribute[]} */
export function parseVec3Array(str, conversionFn = IDENTITY_FN) {
  return parseArray(str, validateVec3, false, conversionFn)
}

/** @type {(str: string, conversionFn: (value: VecXYZ) => VecXYZ) => Attribute[]} */
export function parseVec3SparseArray(str, conversionFn = IDENTITY_FN) {
  return parseArray(str, validateVec3, true, conversionFn)
}

/** @type {(rule: Attribute) => number} */
export function getMaximum(rule) {
  if (rule.options) {
    if (rule.options.length > 0 && typeof rule.options[0] === "number") {
      // @ts-ignore
      return Math.max(...rule.options)
    }
  } else if (rule.range) {
    if (typeof rule.range[0] === "number") {
      // @ts-ignore
      return Math.max(...rule.range)
    }
  }
  return undefined
} 

/** @type {(rule: Attribute) => number} */
export function getAverage(rule) {
  const sum = list => list.reduce((total,x) => total + x, 0)

  if (rule.options) {
    if (rule.options.length > 0 && typeof rule.options[0] === "number") {
      return sum(rule.options)/rule.options.length
    }
  } else if (rule.range) {
    if (typeof rule.range[0] === "number") {
      return sum(rule.range)/rule.range.length
    }
  }
  return undefined
} 

// Convert a string "1..3" into {range: ["1","3"]}
// Convert a string "1|2|3" into {options: ["1","2","3"]}
/** @type {(str: string) => {options?: string[], range?: string[]}} */
export function parseRangeOption(str) {
  const options = str.split("|")
  if (options.length > 1) {
    return { options }
  }

  const range = str.split("..")
  if (range.length > 1) {
    return { range: [ range[0], range[1] ] } 
  }

  return { options }
}

/** @type {(att: Attribute, randFn: () => number) => AttributePart} */
export function randomize(attr, randFn = Math.random) {
  if (attr && attr.range) {
    const min = attr.range[0]
    const max = attr.range[1]

    if (rgbcolor.isColor(min)) {
      return pseudorandom.color({r:0, g:0, b:0}, /** @type {RGBColor} */ (min), /** @type {RGBColor} */ (max), randFn)
    } else if (typeof min === "object" && "x" in min && typeof max === "object" && "x" in max) {
      return pseudorandom.vector({x:0, y: 0}, (min), (max), randFn)
    } else if (typeof min === "number" && typeof max === "number") {
      return pseudorandom.float(min, max)
    } else {
      return min
    }
    
  } else if (attr && attr.options) {
    return pseudorandom.entry(attr.options, randFn)
  }
}

/** @type {(att: Attribute[], randFn: () => number) => AttributePart[]} */
export function randomizeArray(attrArray, randFn = Math.random) {
  return attrArray && attrArray.map(part => randomize(part, randFn))
}

/** @type {(attr: any) => string} */
export function stringify(attr) {
  if (typeof attr === "object") {
    if (attr.range) { return stringify(attr.range[0]) + ".." + stringify(attr.range[1]) }
    if (attr.options) { return attr.options.map(option => stringify(option)).join("|") }
    if (rgbcolor.isColor(attr)) { return rgbcolor.toString(attr) }
    if ("x" in attr && "y" in attr) { return attr.x + " " + attr.y + ("z" in attr ? " " + attr.z : "") + ("w" in attr ? " " + attr.w : "") }
    if (attr.length && "0" in attr) { return attr.join(",") }
    if (attr instanceof HTMLElement) { return "#" + attr.id }
  }
  return typeof attr !== "undefined" ? attr.toString() : undefined
}

// splits a string by the separator, but ignores separators that are nested within
// characters listed in nestedChars
// e.g. nestedSplit(str, ",", ["''", '""', "{}", "[]"])
export function nestedSplit(str, separator = ",", nestedChars = ["''", '""', "{}", "[]", "()"]) {
  let split = []
  let stack = []
  let startI = 0 // position of current token
  let k = 0 // separator index

  for (let i = 0, n = str.length; i < n; i++) {
    const c = str[i]
    if (stack.length > 0 && c === stack[stack.length - 1][1]) {
      stack.pop() // new nested chars started
    } else {
      for (let nest of nestedChars) {
        if (c === nest[0]) {
          stack.push(nest) // last nested chars completed
        }
      }
    }

    if (stack.length === 0 && c === separator[k]) {
      // no nested chars and separator found
      if (++k === separator.length) {
        // separator complete
        split.push(str.substring(startI, i - k + 1))
        startI = i + 1
        k = 0
      }
    } else {
      k = 0 // reset the separator match
    }
  }

  split.push(str.substring(startI, str.length))
  return split
}


const DEFAULT = Symbol('default')
const LAST = Symbol("last")
const FIRST = Symbol("first")
const APPEND = Symbol("append")

// if the setStyle is MODIFIER_NESTED then each set() needs a corresponding unset(), for
// MODIFIER_OVERWRITE multiple set()s to the same source,target,attribute combination will
// overwrite previous sets
export function modifierStack(defaultFn = (target, attribute) => undefined, setStyle = MODIFIER_NESTED) {
  const map = new Map()
  
  let indices = []

  function set(source, target, attribute, value, mode = LAST) {
    if (!map.has(target)) {
      map.set(target, new Array())
    }

    const list = map.get(target)
    if ( findAttributeIndices(indices, list, attribute).length === 0 ) {
      list.push( { source: DEFAULT, mode, attribute, value: defaultFn(target, attribute) } ) // new attribute, set the default first
    }

    const sourceIndex = indices.find(i => list[i].source === source)
    if (setStyle === MODIFIER_NESTED) {

      list.push( {source, mode, attribute, value} ) // add one entry per set()
    } else {

      if (sourceIndex === undefined) {
        list.push( {source, mode, attribute, value} ) // new source for existing attribute
      } else {
        list[sourceIndex].value = value // existing source and attribute
      }
    }

    findAttributeIndices(indices, list, attribute)
    console.assert(indices.length > 0)

    const firstIndex = indices[0]
    return indices.length === 1 ? list[firstIndex].value : indices.map( i => list[i].value )
  }
  
  function unset(source, target, attribute) {
    if (map.has(target)) {
      const list = map.get(target)

      // remove the last matching item
      for (let i = list.length - 1; i >= 0; i--) {
        const item = list[i]
        if (item.attribute === attribute && item.source === source) {
          list.splice(i, 1)
          break
        }
      }

      indices = findAttributeIndices(indices, list, attribute)
      if (indices.length > 0) {
        const firstIndex = indices[0]
        const newValue = indices.length === 1 ? list[firstIndex].value : indices.map( i => list[i].value )
  
        if (indices.length === 1 && list[firstIndex].source === DEFAULT) {
          list.splice(firstIndex, 1) // remove DEFAULT if it's the only source remaining
        }
  
        return newValue
      }
    }
  }
  
  function findAttributeIndices(outIndices, list, attribute) {
    outIndices.length = 0

    // FIRST returns the first non-default, or the default if there are no non-default entries
    // LAST returns the last entry (which may be the default)
    // APPEND returns a list of entries, which includes the default

    for (let i = 0, k = 0; i < list.length; i++) {
      const item = list[i]

      if (item.attribute === attribute) {
        outIndices[k] = i

        if (item.mode === APPEND) {
          k++
        } else if (item.mode === FIRST && item.source !== DEFAULT) {
          break
        }
      }
    }    

    return outIndices
  }

  return {
    set,
    unset,
    APPEND,
    FIRST,
    LAST,
  }
}

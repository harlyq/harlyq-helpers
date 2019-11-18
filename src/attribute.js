import * as pseudorandom from "./pseudorandom.js"
import * as rgbcolor from "./rgbcolor.js"
import * as jsonHelper from "./json-helper.js"

export const IDENTITY_FN = x => x
export const MODIFIER_NESTED = Symbol("nested")
export const MODIFIER_OVERWRITE = Symbol("overwrite")

const OPTIONS_SEPARATOR = "|"
const RANGE_SEPARATOR = "->"

/**
 * @typedef {{x: number, y: number}} VecXY
 * @typedef {{x: number, y: number, z: number}} VecXYZ
 * @typedef {{x: number, y: number, z: number, w: number}} VecXYZW
 * @typedef {{r: number, g: number, b: number}} RGBColor
 * @typedef {number | VecXY | VecXYZ | VecXYZW | RGBColor | string} AttributePart
 */

 /**
 * @template T
 * @typedef {{range?: T[], options?: T[], variable?: string}} Attribute<T>
 */

/** @type {<T>(str: string, parsePartFn?: (str: string) => T, conversionFn?: (value: T) => T) => Attribute<T>} */
export function parse(str, parsePartFn = parsePartAny, conversionFn = IDENTITY_FN) {
  const result = parseRangeOptionVariable( str.trim() )
  if (result.variable) {
    return { variable: result.variable }
  } else if (result.range) {
    return { range: result.range.map( part => conversionFn( parsePartFn(part) ) ) }
  } else {
    return { options: result.options.map( part => conversionFn( parsePartFn(part) ) ) }
  }
}

/** @typedef {(str: string) => any} parsePartAnyFn */
/** @type {parsePartAnyFn} */
export const parsePartAny = (function() {
  const toNumber = str => Number(str.trim())
  
  return /** @type {parsePartAnyFn} */function parsePartAny(str) {
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

function strToVector(str) {
  return str.split(" ").filter(x => x !== "").map(x => Number( x.trim() ))
}

function parsePartString(str) {
  return str.trim()
}

function parsePartNumber(str) {
  const num = Number( str.trim() )
  return num && !isNaN(num) ? num : undefined
}

function parsePartVec2(str) {
  const vec = strToVector(str)
  return vec.length < 2 || vec.some(isNaN) ? undefined : { x: Number(vec[0]), y: Number(vec[1]) }
}

function parsePartVec3(str) {
  const vec = strToVector(str)
  return vec.length < 3 || vec.some(isNaN) ? undefined : { x: Number(vec[0]), y: Number(vec[1]), z: Number(vec[2]) }
}

function parsePartVec4(str) {
  const vec = strToVector(str)
  return vec.length < 4 || vec.some(isNaN) ? undefined : { x: Number(vec[0]), y: Number(vec[1]), z: Number(vec[2]), w: Number(vec[3]) }
}

function parsePartColor(str) {
  return rgbcolor.parse( str.trim() )
}

export function validateNumber(number) {
  return typeof number === "number"
}

export function validateVec4(vec4) {
  return typeof vec4 === "object" && "x" in vec4 && "y" in vec4 && "z" in vec4 && "w" in vec4 && typeof vec4.x === "number" && typeof vec4.y === "number" && typeof vec4.z === "number" && typeof vec4.w === "number"
}

export function validateVec3(vec3) {
  return typeof vec3 === "object" && "x" in vec3 && "y" in vec3 && "z" in vec3 && typeof vec3.x === "number" && typeof vec3.y === "number" && typeof vec3.z === "number"
}

export function validateVec2(vec2) {
  return typeof vec2 === "object" && "x" in vec2 && "y" in vec2 && typeof vec2.x === "number" && typeof vec2.y === "number"
}

export function validateColor(color) {
  return typeof color === "object" && "r" in color && "g" in color && "b" in color && typeof color.r === "number" && typeof color.g === "number" && typeof color.b === "number"
}

export function validateString(str) {
  return typeof str === "string"
}

function validateRangeOptionVariable(part, validateItemFn) {
  if (part.range) { return part.range.every(validateItemFn) }
  if (part.options) { return part.options.every(validateItemFn) }
  if (part.variable) { return true } // can only assume that the variables will be the correct type
  return false
}

/** @type {<T>(str: string, parsePartFn: (str:string) => T, validateFn: (value:T) => boolean, conversionFn: (value:T) => T) => Attribute<T>} */
function parseValue(str, parsePartFn, validateFn, conversionFn = IDENTITY_FN) {
  const result = parse(str, parsePartFn, conversionFn)
  return validateRangeOptionVariable(result, validateFn) ? result : undefined
}

/** @type {<T>(str: string, parsePartFn: (str:string) => T, validateFn: (value:T) => boolean, isSparse: boolean, conversionFn: (value:T) => T) => Attribute<T>[]} */
function parseArray(str, parsePartFn, validateFn, isSparse, conversionFn = IDENTITY_FN) {
  if (str.trim() === "") {
    return []
  }
  
  const rangeOptions = nestedSplit(str, ",").flatMap( partStr => {
    const str = partStr.trim()
    return !isSparse || str ? parse(str, parsePartFn, conversionFn) : undefined
   } )
  return rangeOptions.every( part => isSparse && part === undefined ? true : validateRangeOptionVariable(part, validateFn) ) ? rangeOptions : undefined
}

/** @type {(str: string, conversionFn: (string) => string) => Attribute<string>} */
export function parseString(str) {
  return parseValue(str, parsePartColor, validateColor)
}

/** @type {(str: string, conversionFn: (string) => string) => Attribute<string>[]} */
export function parseStringArray(str, conversionFn = IDENTITY_FN) {
  return parseArray(str, parsePartColor, validateColor, false, conversionFn)
}

/** @type {(str: string, conversionFn: (string) => string) => Attribute<string>[]} */
export function parseStringSparseArray(str, conversionFn = IDENTITY_FN) {
  return parseArray(str, parsePartColor, validateColor, true, conversionFn)
}

/** @type {(str: string, conversionFn: (RGBColor) => RGBColor) => Attribute<RGBColor>} */
export function parseColor(str) {
  return parseValue(str, parsePartColor, validateColor)
}

/** @type {(str: string, conversionFn: (RGBColor) => RGBColor) => Attribute<RGBColor>[]} */
export function parseColorArray(str, conversionFn = IDENTITY_FN) {
  return parseArray(str, parsePartColor, validateColor, false, conversionFn)
}

/** @type {(str: string, conversionFn: (RGBColor) => RGBColor) => Attribute<RGBColor>[]} */
export function parseColorSparseArray(str, conversionFn = IDENTITY_FN) {
  return parseArray(str, parsePartColor, validateColor, true, conversionFn)
}

/** @type {(str: string, conversionFn: (number) => number) => Attribute<number>} */
export function parseNumber(str, conversionFn = IDENTITY_FN) {
  return parseValue(str, parsePartNumber, validateNumber, conversionFn)
}

/** @type {(str: string, conversionFn: (number) => number) => Attribute<number>[]} */
export function parseNumberArray(str, conversionFn = IDENTITY_FN) {
  return parseArray(str, parsePartNumber, validateNumber, false, conversionFn)
}

/** @type {(str: string, conversionFn: (number) => number) => Attribute<number>[]} */
export function parseNumberSparseArray(str, conversionFn = IDENTITY_FN) {
  return parseArray(str, parsePartNumber, validateNumber, true, conversionFn)
}

/** @type {(str: string, conversionFn: (value:VecXYZ) => VecXYZ) => Attribute<VecXY>} */
export function parseVec2(str, conversionFn = IDENTITY_FN) {
  return parseValue(str, parsePartVec2, validateVec3, conversionFn)
}

/** @type {(str: string, conversionFn: (value: VecXYZ) => VecXYZ) => Attribute<VecXY>[]} */
export function parseVec2Array(str, conversionFn = IDENTITY_FN) {
  return parseArray(str, parsePartVec2, validateVec3, false, conversionFn)
}

/** @type {(str: string, conversionFn: (value: VecXYZ) => VecXYZ) => Attribute<VecXY>[]} */
export function parseVec2SparseArray(str, conversionFn = IDENTITY_FN) {
  return parseArray(str, parsePartVec2, validateVec3, true, conversionFn)
}

/** @type {(str: string, conversionFn: (value:VecXYZ) => VecXYZ) => Attribute<VecXYZ>} */
export function parseVec3(str, conversionFn = IDENTITY_FN) {
  return parseValue(str, parsePartVec3, validateVec3, conversionFn)
}

/** @type {(str: string, conversionFn: (value: VecXYZ) => VecXYZ) => Attribute<VecXYZ>[]} */
export function parseVec3Array(str, conversionFn = IDENTITY_FN) {
  return parseArray(str, parsePartVec3, validateVec3, false, conversionFn)
}

/** @type {(str: string, conversionFn: (value: VecXYZ) => VecXYZ) => Attribute<VecXYZ>[]} */
export function parseVec3SparseArray(str, conversionFn = IDENTITY_FN) {
  return parseArray(str, parsePartVec3, validateVec3, true, conversionFn)
}

/** @type {(str: string, conversionFn: (value:VecXYZ) => VecXYZ) => Attribute<VecXYZW>} */
export function parseVec4(str, conversionFn = IDENTITY_FN) {
  return parseValue(str, parsePartVec4, validateVec3, conversionFn)
}

/** @type {(str: string, conversionFn: (value: VecXYZ) => VecXYZ) => Attribute<VecXYZW>[]} */
export function parseVec4Array(str, conversionFn = IDENTITY_FN) {
  return parseArray(str, parsePartVec4, validateVec3, false, conversionFn)
}

/** @type {(str: string, conversionFn: (value: VecXYZ) => VecXYZ) => Attribute<VecXYZW>[]} */
export function parseVec4SparseArray(str, conversionFn = IDENTITY_FN) {
  return parseArray(str, parsePartVec4, validateVec3, true, conversionFn)
}

/** 
 * @template T
 * @typedef {{randomFn?: () => number, conversionFn?: (x:T) => T, variables?: {[key:string]:any}, cache?: {[key:string]:any} }} EvalConfig<T> 
 **/

/** @type {(str: string, config?: EvalConfig<number>) => number} */
export function evalNumber(str, config = EMPTY_CONFIG) {
  return evalAttribute(str, parsePartNumber, validateNumber, config)
}

/** @type {(str: string, config?: EvalConfig<number>) => number[]} */
export function evalNumberArray(str, config = EMPTY_CONFIG) {
  return evalAttributeArray(str, parsePartNumber, validateNumber, false, config)
}

/** @type {(str: string, config?: EvalConfig<number>) => (number|undefined)[]} */
export function evalSparseNumberArray(str, config = EMPTY_CONFIG) {
  return evalAttributeArray(str, parsePartNumber, validateNumber, true, config)
}

/** @type {(str: string, config?: EvalConfig<VecXY>) => VecXY} */
export function evalVec2(str, config = EMPTY_CONFIG) {
  return evalAttribute(str, parsePartVec2, validateVec2, config)
}

/** @type {(str: string, config?: EvalConfig<VecXY>) => VecXY[]} */
export function evalVec2Array(str, config = EMPTY_CONFIG) {
  return evalAttributeArray(str, parsePartVec2, validateVec2, false, config)
}

/** @type {(str: string, config?: EvalConfig<VecXY>) => (VecXY|undefined)[]} */
export function evalSparseVec2Array(str, config = EMPTY_CONFIG) {
  return evalAttributeArray(str, parsePartVec2, validateVec2, true, config)
}

/** @type {(str: string, config?: EvalConfig<VecXYZ>) => VecXYZ} */
export function evalVec3(str, config = EMPTY_CONFIG) {
  return evalAttribute(str, parsePartVec3, validateVec3, config)
}

/** @type {(str: string, config?: EvalConfig<VecXYZ>) => VecXYZ[]} */
export function evalVec3Array(str, config = EMPTY_CONFIG) {
  return evalAttributeArray(str, parsePartVec3, validateVec3, false, config)
}

/** @type {(str: string, config?: EvalConfig<VecXYZ>) => (VecXYZ|undefined)[]} */
export function evalSparseVec3Array(str, config = EMPTY_CONFIG) {
  return evalAttributeArray(str, parsePartVec3, validateVec3, true, config)
}

/** @type {(str: string, config?: EvalConfig<VecXYZW>) => VecXYZW} */
export function evalVec4(str, config = EMPTY_CONFIG) {
  return evalAttribute(str, parsePartVec4, validateVec4, config)
}

/** @type {(str: string, config?: EvalConfig<VecXYZW>) => VecXYZW[]} */
export function evalVec4Array(str, config = EMPTY_CONFIG) {
  return evalAttributeArray(str, parsePartVec4, validateVec4, false, config)
}

/** @type {(str: string, config?: EvalConfig<VecXYZW>) => (VecXYZW|undefined)[]} */
export function evalSparseVec4Array(str, config = EMPTY_CONFIG) {
  return evalAttributeArray(str, parsePartVec4, validateVec4, true, config)
}

/** @type {(str: string, config?: EvalConfig<RGBColor>) => RGBColor} */
export function evalColor(str, config = EMPTY_CONFIG) {
  return evalAttribute(str, parsePartColor, validateColor, config)
}

/** @type {(str: string, config?: EvalConfig<RGBColor>) => RGBColor[]} */
export function evalColorArray(str, config = EMPTY_CONFIG) {
  return evalAttributeArray(str, parsePartColor, validateColor, false, config)
}

/** @type {<T>(str: string, config?: EvalConfig<RGBColor>) => (RGBColor|undefined)[]} */
export function evalSparseColorArray(str, config = EMPTY_CONFIG) {
  return evalAttributeArray(str, parsePartColor, validateColor, true, config)
}

/** @type {(str: string, config?: EvalConfig<string>) => string} */
export function evalString(str, config = EMPTY_CONFIG) {
  return evalAttribute(str, parsePartString, validateString, config)
}

/** @type {(str: string, config?: EvalConfig<string>) => string[]} */
export function evalStringArray(str, config = EMPTY_CONFIG) {
  return evalAttributeArray(str, parsePartString, validateString, false, config)
}

/** @type {<T>(str: string, config?: EvalConfig<string>) => (string|undefined)[]} */
export function evalSparseStringArray(str, config = EMPTY_CONFIG) {
  return evalAttributeArray(str, parsePartString, validateString, true, config)
}

const EMPTY_CONFIG = {}

/** 
 * @template T
 * @type {(str: string, parsePartFn: (str:string) => T, validateFn: (x:T) => boolean, config?: EvalConfig<T>) => T} 
 **/
function evalAttribute(str, parsePartFn, validateFn, config = EMPTY_CONFIG) {
  let info
  if (config.cache && config.cache[str]) {
    info = config.cache[str]
  } else {
    info = parseValue(str, parsePartFn, validateFn, config.conversionFn)
  }

  if (info && info.variable && config.variables) {
    str = substitute$(info.variable, config.variables)
    info = parseValue(str, parsePartFn, validateFn, config.conversionFn)
  }

  if (info) {
    // @ts-ignore
    return randomize(info, config.randomFn)
  }
}

/** 
 * @template T
 * @type {(str: string, parsePartFn: (str:string) => T, validateFn: (x:T) => boolean, isSparse: boolean, config?: EvalConfig<T>) => (T|undefined)[]} 
 **/
function evalAttributeArray(str, parsePartFn, validateFn, isSparse = false, config = EMPTY_CONFIG) {
  let info
  if (config.cache && config.cache[str]) {
    info = config.cache[str]
  } else {
    info = parseArray(str, parsePartFn, validateFn, isSparse, config.conversionFn)
  }

  if (info && info.variable && config.variables) {
    str = substitute$(info.variable, config.variables)
    info = parseValue(str, parsePartFn, validateFn, config.conversionFn)
  }

  if (info) {
    // @ts-ignore
    return randomizeArray(info, config.randomFn)
  }
}

export function substitute$( str, variables ) {
  const newStr = str.replace(varRegEx, (_, p1) => {
    const parts = p1.split(".")
    const subst = jsonHelper.getWithPath( variables, parts )
    return typeof subst !== "undefined" ? stringify(subst) : ""
  })

  return newStr
}


/** @type {(rule: Attribute<number>) => number} */
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

/** @type {(rule: Attribute<number>) => number} */
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

const varRegEx = /\$([\.\w]+)\$/g

// Convert a string "1..3" into {range: ["1","3"]}
// Convert a string "1|2|3" into {options: ["1","2","3"]}
// Convert a string "$ab.c.d$" into {variable: "ab.c.d"}
/** @type { (str: string) => {options?: string[], range?: string[], variable?: string} } */
export function parseRangeOptionVariable(str) {
  if (varRegEx.test(str)) {
    return { variable: str }
  }

  const options = str.split(OPTIONS_SEPARATOR)
  if (options.length > 1) {
    return { options }
  }

  const range = str.split(RANGE_SEPARATOR)
  if (range.length > 1) {
    return { range: [ range[0], range[1] ] } 
  }

  return { options }
}

/** @type {(att: Attribute<any>, randomFn: () => number) => any} */
export function randomize(attr, randomFn = Math.random) {
  if (attr && attr.range) {
    const min = attr.range[0]
    const max = attr.range[1]

    if (rgbcolor.isColor(min)) {
      return pseudorandom.color({r:0, g:0, b:0}, /** @type {RGBColor} */ (min), /** @type {RGBColor} */ (max), randomFn)
    } else if (typeof min === "object" && "x" in min && typeof max === "object" && "x" in max) {
      return pseudorandom.vector({x:0, y: 0}, (min), (max), randomFn)
    } else if (typeof min === "number" && typeof max === "number") {
      return pseudorandom.float(min, max, randomFn)
    } else {
      return min
    }
    
  } else if (attr && attr.options) {
    return pseudorandom.entry(attr.options, randomFn)
  }
}

/** @type {<T extends AttributePart>(att: Attribute<T>[], randomFn: () => number) => T[]} */
export function randomizeArray(attrArray, randomFn = Math.random) {
  return attrArray && attrArray.map(part => randomize(part, randomFn))
}

/** @type {(attr: any) => string} */
export function stringify(attr) {
  if (typeof attr === "object") {
    if (attr.range) { return stringify(attr.range[0]) + RANGE_SEPARATOR + stringify(attr.range[1]) }
    if (attr.options) { return attr.options.map(option => stringify(option)).join(OPTIONS_SEPARATOR) }
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

import * as pseudorandom from "./pseudorandom.js"
import * as rgbcolor from "./rgbcolor.js"

/**
 * @typedef {{x: number, y: number}} VecXY
 * @typedef {{x: number, y: number, z: number}} VecXYZ
 * @typedef {{x: number, y: number, z: number, w: number}} VecXYZW
 * @typedef {{r: number, g: number, b: number}} RGBColor
 * @typedef {number | VecXY | VecXYZ | VecXYZW | RGBColor | string} AttributePart
 * @typedef {{range?: AttributePart[], options?: AttributePart[]}} Attribute
 */

/** @type {(str: string) => Attribute} */
export function parse(str) {
  const rangeOption = parseRangeOption(str)
  if (rangeOption.range) {
    return { range: rangeOption.range.map(part => parsePart(part)) }
  } else {
    return { options: rangeOption.options.map(part => parsePart(part)) }
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

function parseValue(str, validateFn) {
  const rangeOption = parse(str)
  return validateRangeOption(rangeOption, validateFn) ? rangeOption : undefined
}

function parseArray(str, validateFn, permitEmpty = false) {
  if (str === "") {
    return []
  }
  
  const rangeOptions = nestedSplit(str, ",").flatMap(partStr => parse(partStr))
  return rangeOptions.every(part => (permitEmpty && part) || validateRangeOption(part, validateFn)) ? rangeOptions : undefined
}

export function parseColor(str) {
  return parseValue(str, validateColor)
}

export function parseColorArray(str, permitEmpty = false) {
  return parseArray(str, validateColor, permitEmpty)
}

export function parseNumber(str) {
  return parseValue(str, validateNumber)
}

export function parseNumberArray(str, permitEmpty = false) {
  return parseArray(str, validateNumber, permitEmpty)
}

export function parseVec3(str) {
  return parseValue(str, validateVec3)
}

export function parseVec3Array(str, permitEmpty = false) {
  return parseArray(str, validateVec3, permitEmpty)
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
  if (attr.range) {
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
    
  } else if (attr.options) {
    return pseudorandom.entry(attr.options, randFn)
  }
}

/** @type {(att: Attribute[], randFn: () => number) => AttributePart[]} */
export function randomizeArray(attrArray, randFn = Math.random) {
  return attrArray.map(part => randomize(part, randFn))
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

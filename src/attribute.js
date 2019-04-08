import * as pseudorandom from "./pseudorandom.js"
import * as rgbcolor from "./rgbcolor.js"

/**
 * @typedef {{r: number, g: number, b: number}} RGBColor
 * @typedef {number[] | RGBColor | string} AttributePart
 * @typedef {{range?: AttributePart[], options?: AttributePart[]}} Attribute
 */

/** @type {(str: string) => Attribute} */
export function parse(str) {
  const rangeOptions = parseRangeOptions(str)
  if (rangeOptions.range) {
    return { range: rangeOptions.range.map(part => parsePart(part)) }
  } else {
    return { options: rangeOptions.options.map(part => parsePart(part)) }
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
      return vec
    }
  
    let col = rgbcolor.parse(str.trim())
    if (col) {
      return col
    }
  
    return str.trim()
  }
})()


// Convert a string "1..3" into {range: ["1","3"]}
// Convert a string "1|2|3" into {options: ["1","2","3"]}
/** @type {(str: string) => {options?: string[], range?: string[]}} */
export function parseRangeOptions(str) {
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

/** @typedef {(att: Attribute, randFn: () => number) => AttributePart} RandomizeFn */
/** @type {RandomizeFn} */
export const randomize = (function() {
  let col = {r: 0, g: 0, b: 0}
  let vec = []

  return /** @type {RandomizeFn} */ function randomize(attr, randFn = Math.random) {
    if (attr.range) {
      const min = attr.range[0]
      const max = attr.range[1]

      if (rgbcolor.isColor(min)) {
        return pseudorandom.color(col, /** @type {RGBColor} */ (min), /** @type {RGBColor} */ (max))
      } else if (Array.isArray(min) && min.length > 0 && typeof min[0] === "number") {
        return pseudorandom.vector(vec, /** @type {number[]} */ (min), /** @type {number[]} */ (max))
      // } else if (typeof min === "number") {
      //   return pseudorandom.float(min, max) // not needed all numbers should be in a float array
      } else {
        return min
      }
      
    } else if (attr.options) {
      return pseudorandom.entry(attr.options, randFn)
    }
  }

})()

/** @type {(attr: any) => string} */
export function stringify(attr) {
  if (typeof attr === "object") {
    if (attr.range) { return stringify(attr.range[0]) + ".." + stringify(attr.range[1]) }
    if (attr.options) { return attr.options.map(option => stringify(option)).join("|") }
    if (rgbcolor.isColor(attr)) { return rgbcolor.toString(attr) }
    if ("x" in attr && "y" in attr) { return attr.x + " " + attr.y + ("z" in attr ? " " + attr.z : "") }
    if (attr.length && "0" in attr) { return typeof attr[0] === "number" ? attr.join(" ") : attr.join(",") }
  }
  return attr.toString()
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

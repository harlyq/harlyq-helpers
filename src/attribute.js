import * as pseudorandom from "./pseudorandom.js"
import * as rgbcolor from "./rgbcolor.js"

export const parse = (function() {
  return function parse(str) {
    const rangeOptions = parseRangeOptions(str)
    if (rangeOptions.range) {
      return { range: rangeOptions.range.map(part => parsePart(part)) }
    } else {
      return { options: rangeOptions.options.map(part => parsePart(part)) }
    }
  }
})()

// Convert a string "1 2 3" into a [1,2,3]
export const parsePart = (function() {
  const toNumber = str => Number(str.trim())
  
  return function parsePart(str) {
    if (str === "") {
      return ""
    }

    let vec = str.split(" ").filter(x => x !== "").map(toNumber)
    if (!vec.some(isNaN)) {
      return new Float32Array(vec)
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

export const randomize = (function() {
  let col = {}
  let vec = new Float32Array()

  return function randomize(attr, randFn = Math.random) {
    if (attr.range) {
      const min = attr.range[0]
      const max = attr.range[1]

      if (rgbcolor.isColor(min)) {
        return pseudorandom.color(col, min, max)
      } else if (min instanceof Float32Array) {
        return pseudorandom.vector(vec, min, max)
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


export function stringify(attr) {
  if (typeof attr === "object") {
    if (attr.range) { return stringify(attr.range[0]) + ".." + stringify(attr.range[1]) }
    if (attr.options) { return attr.options.map(option => stringify(option)).join("|") }
    if (rgbcolor.isColor(attr)) { return rgbcolor.toString(attr) }
    if ("x" in attr && "y" in attr) { return attr.x + " " + attr.y + ("z" in attr ? " " + attr.z : "") }
    if (attr instanceof Float32Array) { return attr.join(" ") }
    if (Array.isArray(attr)) { return attr.join(",") }
  }
  return attr.toString()
}

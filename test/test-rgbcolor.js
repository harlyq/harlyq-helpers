import test from "tape"
import * as rgbcolor from "../src/rgbcolor.js"

/**
 * @typedef {{r: number, g: number, b: number, a: number}} RGBAColor
 */

const TOLERANCE = 0.001

/** @type {(a: any, b: any, tolerance?: number) => boolean} */
const similar = (a,b,tolerance = TOLERANCE) => {
  const typeofA = typeof a
  const typeofB = typeof b
  if (typeofA === "object" && typeofB === "object") {
    const keys = Object.keys(a)
    return keys.length === Object.keys(b).length && keys.every(k => similar(a[k], b[k]))
  }
  if (typeofA === "number" && typeofB === "number") {
    return Math.abs(a - b) < tolerance
  }
  return a == b
}

test("rgbcolor.setHex", (t) => {
  let col = {r:0,g:0,b:0}
  t.deepEquals(rgbcolor.setHex(col, 0x0), {r:0, g:0, b:0}, "black")
  t.deepEquals(rgbcolor.setHex(col, 0xffffff), {r:1, g:1, b:1}, "white")

  rgbcolor.setHex(col, 0x8040c0)
  t.ok(similar(col, {r:0.502, g:0.251, b:0.753}), "color")
  t.end()
})

test("rgbcolor.equals", (t) => {
  t.ok(rgbcolor.equals({r:1, g:.2, b:.5}, {r:1, g:.2, b:.5}), "equal")
  t.notOk(rgbcolor.equals({r:1, g:.2, b:.5}, {r:1, g:.2, b:1}), "not equal")
  t.end()
})

test("rgbcolor.toHex", (t) => {
  t.equals(rgbcolor.toHex({r:0, g:0, b: 0}), 0, "black")
  t.equals(rgbcolor.toHex({r:1, g:1, b: 1}), 0xffffff, "white")
  t.equals(rgbcolor.toHex({r:0.502, g:0.251, b: 0.753}), 0x8040c0, "color")
  t.equals(rgbcolor.toHex( rgbcolor.setHex({r:0,g:0,b:0}, 0x238794) ), 0x238794, "setHex then toHex")
  t.end()
})

test("rgbcolor.toString", (t) => {
  t.equals(rgbcolor.toString({r: 0, g: 0, b: 0}), "#000000", "black")
  t.equals(rgbcolor.toString({r: 1, g: 1, b: 1}), "#ffffff", "white")
  t.equals(rgbcolor.toString( rgbcolor.setHex({r:0,g:0,b:0}, 0x05d9a3) ), "#05d9a3", "setHex then toString")
  t.end()
})

test("rgbcolor.toArray", (t) => {
  t.deepEquals(rgbcolor.toArray([], {r: 0, g: .5, b: 1, a: .2}), [0,.5,1,.2], "rgba")
  t.deepEquals(rgbcolor.toArray([], {r: 0, g: .5, b: 1}), [0,.5,1], "rgb")
  t.deepEquals(rgbcolor.toArray([1,1,1,1], {r: 0, g: .5, b: 1}), [0,.5,1,1], "rgb with alpha from array")
  t.deepEquals(rgbcolor.toArray([1,1,1,1], {r: 0, g: .5, b: 1, a:0}), [0,.5,1,0], "zero alpha")
  t.end()
})

test("rgbcolor.parse", (t) => {
  t.equals(/** @type RGBAColor */(rgbcolor.parse("rgba(255,255,0,0.1)")).a === 0.1 && rgbcolor.toString(rgbcolor.parse("rgba(255,255,0,0.1)")), "#ffff00", "rgba")
  t.equals(rgbcolor.toString(rgbcolor.parse("red")), "#ff0000", "named")
  t.equals(rgbcolor.toString(rgbcolor.parse("#123")), "#112233", "hex")
  t.equals(rgbcolor.toString(rgbcolor.parse("hsl(270,60%,51%)")), "#8237cd", "hsl")
  t.equals(rgbcolor.toString(rgbcolor.parse("rgb(50%,50%,50%)")), "#7f7f7f", "rgb percentage")
  t.notOk(rgbcolor.parse("ted"), "invalid")
  t.notOk(rgbcolor.parse("Red"), "wrong case")

  t.end()
})

test("rgbColor.isColor", (t) => {
  t.notOk(rgbcolor.isColor(""), "empty string")
  t.notOk(rgbcolor.isColor({}), "empty object")
  t.notOk(rgbcolor.isColor(0), "number")
  t.notOk(rgbcolor.isColor([.1,.2,.3]), "array")
  t.notOk(rgbcolor.isColor({r:.1,g:.2}), "partial color")
  t.ok(rgbcolor.isColor({r:.1,b:.5,g:.2}), "color")
  t.ok(rgbcolor.isColor({r:.1,b:.5,g:.2,x:1,y:2}), "extra parameters")

  t.end()
})
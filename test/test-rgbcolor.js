import test from "tape"
import * as rgbcolor from "../src/rgbcolor.js"

const TOLERANCE = 0.001
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
  t.deepEquals(rgbcolor.setHex({}, 0x0), {r:0, g:0, b:0}, "black")
  t.deepEquals(rgbcolor.setHex({}, 0xffffff), {r:1, g:1, b:1}, "white")

  const col = rgbcolor.setHex({}, 0x8040c0)
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
  t.equals(rgbcolor.toHex( rgbcolor.setHex({}, 0x238794) ), 0x238794, "setHex then toHex")
  t.end()
})

test("rgbcolor.toString", (t) => {
  t.equals(rgbcolor.toString({r: 0, g: 0, b: 0}), "#000000", "black")
  t.equals(rgbcolor.toString({r: 1, g: 1, b: 1}), "#ffffff", "white")
  t.equals(rgbcolor.toString( rgbcolor.setHex({}, 0x05d9a3) ), "#05d9a3", "setHex then toString")
  t.end()
})
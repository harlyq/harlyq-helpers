import test from "tape"
import * as attribute from "../src/attribute.js"
import * as rgbcolor from "../src/rgbcolor.js"

/**
 * @typedef {{r: number, g: number, b: number}} RGBColor
 */

test("attribute.parsePart", (t) => {
  t.deepEquals(attribute.parsePart(""), "", "empty")
  t.deepEquals(attribute.parsePart("1"), [1], "single number")
  t.deepEquals(attribute.parsePart(" 2  3  4"), [2,3,4], "vector")
  t.deepEquals(attribute.parsePart(" 2.5 "), [2.5], "decimal number")
  t.deepEquals(attribute.parsePart(" lesser   "), "lesser", "string")
  t.deepEquals(attribute.parsePart(" 2,3 ,4 "), "2,3 ,4", "string with numbers")
  t.equals(rgbcolor.toString(/** @type {RGBColor} */(attribute.parsePart("red"))), "#ff0000", "named color")
  t.equals(rgbcolor.toString(/** @type {RGBColor} */(attribute.parsePart("#123"))), "#112233", "hex color")

  t.end()
})


test("attribute.parseRangeOptions", (t) => {
  t.deepEquals(attribute.parseRangeOptions("1 2 3"), { options: ["1 2 3"]}, "no range or options")
  t.deepEquals(attribute.parseRangeOptions("1 2..3 4 5"), { range: ["1 2","3 4 5"]}, "range")
  t.deepEquals(attribute.parseRangeOptions("a|b|c"), { options: ["a","b","c"]}, "options")
  t.deepEquals(attribute.parseRangeOptions("1 2||3"), { options: ["1 2","","3"]}, "empty option")
  t.deepEquals(attribute.parseRangeOptions("..3"), { range: ["","3"]}, "empty range")
  t.deepEquals(attribute.parseRangeOptions("1..3 | 2.5..6"), { options: ["1..3 "," 2.5..6"]}, "both range and options")
  t.deepEquals(attribute.parseRangeOptions("1..3..-2"), { range: ["1","3"]}, "multiple ranges")

  t.end()
})

test("attribute.parse", (t) => {
  t.deepEquals(attribute.parse(""), { options: [""] }, "empty")
  t.deepEquals(attribute.parse("a"), { options: ["a"] }, "string")
  t.deepEquals(attribute.parse("-1.75"), { options: [[-1.75]] }, "number")
  t.deepEquals(attribute.parse("1.125 2.5 6"), { options: [[1.125,2.5,6]] }, "vector")
  t.deepEquals(attribute.parse("2.25..-6.75"), { range: [[2.25], [-6.75]] }, "range")
  t.deepEquals(attribute.parse("black..#fff"), { range: [{ r:0,g:0,b:0 }, { r:1,g:1,b:1 }] }, "range of color")
  t.deepEquals(attribute.parse("top..bottom"), { range: ["top", "bottom"] }, "range of string")
  t.deepEquals(attribute.parse("9 -1..0 4 .5"), { range: [[9,-1], [0,4,.5]] }, "range of vector")

  t.end()
})

test("attribute.stringify", (t) => {
  t.equals(attribute.stringify(""), "", "empty")
  t.equals(attribute.stringify({ r:1,g:1,b:1 }), "#ffffff", "color")
  t.equals(attribute.stringify({ x:-1,y:.5,z:2 }), "-1 0.5 2", "vecxyz")
  t.equals(attribute.stringify(new Float32Array([1,-2,-.25])), "1 -2 -0.25", "float32array")
  t.equals(attribute.stringify("blah"), "blah", "string")
  t.equals(attribute.stringify(true), "true", "boolean")
  t.equals(attribute.stringify(-10.8), "-10.8", "number")
  t.equals(attribute.stringify([11.7]), "11.7", "vector with one element")
  t.equals(attribute.stringify(["a","b","c"]), "a,b,c", "array of strings")
  t.equals(attribute.stringify({ options: ["a","b","c"] }), "a|b|c", "string options")
  t.equals(attribute.stringify({ range: [10,12.5] }), "10..12.5", "number range")
  t.equals(attribute.stringify({ range: [{ r:0,g:0,b:0 }, { r:1,g:1,b:1 }] }), "#000000..#ffffff", "color range")
  t.equals(attribute.stringify( attribute.parse("9 -1..0 4 .5") ), "9 -1..0 4 0.5", "parse range")
  t.equals(attribute.stringify( attribute.parse("blue||green|red") ), "#0000ff||#008000|#ff0000", "parse color options")
  
  t.end()
})

test("test.nestedsplit", (t) => {
  t.deepEquals(attribute.nestedSplit(""), [""], "empty")
  t.deepEquals(attribute.nestedSplit("a,b"), ["a","b"], "two params")
  t.deepEquals(attribute.nestedSplit(" a , b"), [" a "," b"], "two params, with spacing")
  t.deepEquals(attribute.nestedSplit(" a , b,    c"), [" a "," b","    c"], "three params")
  t.deepEquals(attribute.nestedSplit(" a .. b..    c", ".."), [" a "," b","    c"], ".. split")
  t.deepEquals(attribute.nestedSplit(" (a,b,c) .. [d,e]..    {f}", ".."), [" (a,b,c) "," [d,e]","    {f}"], "nesting")
  t.deepEquals(attribute.nestedSplit(" (a,b,c) .. [{d.1,d.2},e]..    {[f.1,(f.2,f.3)]}", ".."), [" (a,b,c) "," [{d.1,d.2},e]","    {[f.1,(f.2,f.3)]}"], "nested nesting")
  
  t.end()
})
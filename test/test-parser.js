import test from "tape"
import * as parser from "../src/parser.js"
import * as rgbcolor from "../src/rgbcolor.js"

test("parser.parseColor", (t) => {
  t.equals(parser.parseColor("rgba(255,255,0,0.1)").a === 0.1 && rgbcolor.toString(parser.parseColor("rgba(255,255,0,0.1)")), "#ffff00", "rgba")
  t.equals(rgbcolor.toString(parser.parseColor("red")), "#ff0000", "named")
  t.equals(rgbcolor.toString(parser.parseColor("#123")), "#112233", "hex")
  t.equals(rgbcolor.toString(parser.parseColor("hsl(270,60%,51%)")), "#8237cd", "hsl")
  t.equals(rgbcolor.toString(parser.parseColor("rgb(50%,50%,50%)")), "#7f7f7f", "rgb percentage")
  t.notOk(parser.parseColor("ted"), "invalid")
  t.notOk(parser.parseColor("Red"), "wrong case")

  t.end()
})

test("parser.parseValue", (t) => {
  t.deepEquals(parser.parseValue(""), {type: "any", value: ""}, "empty")
  t.deepEquals(parser.parseValue("1"), {type: "numbers", value: [1]}, "single number")
  t.deepEquals(parser.parseValue(" 2  3  4"), {type: "numbers", value: [2,3,4]}, "vector")
  t.deepEquals(parser.parseValue(" 2.5 "), {type: "numbers", value: [2.5]}, "decimal number")
  t.deepEquals(parser.parseValue(" lesser   "), {type: "string", value: "lesser"}, "string")
  t.deepEquals(parser.parseValue(" 2,3 ,4 "), {type: "string", value: "2,3 ,4"}, "string with numbers")
  t.equals(parser.parseValue("red").type, "color", "named color type")
  t.equals(rgbcolor.toString(parser.parseValue("red").value), "#ff0000", "named color")
  t.equals(parser.parseValue("#123").type, "color", "hex color type")
  t.equals(rgbcolor.toString(parser.parseValue("#123").value), "#112233", "hex color")

  t.end()
})


test("parser.parseRangeOptions", (t) => {
  t.deepEqual(parser.parseRangeOptions("1 2 3"), { options: ["1 2 3"]}, "no range or options")
  t.deepEqual(parser.parseRangeOptions("1 2..3 4 5"), { range: ["1 2","3 4 5"]}, "range")
  t.deepEqual(parser.parseRangeOptions("a|b|c"), { options: ["a","b","c"]}, "options")
  t.deepEqual(parser.parseRangeOptions("1 2||3"), { options: ["1 2","","3"]}, "empty option")
  t.deepEqual(parser.parseRangeOptions("..3"), { range: ["","3"]}, "empty range")
  t.deepEqual(parser.parseRangeOptions("1..3 | 2.5..6"), { options: ["1..3 "," 2.5..6"]}, "both range and options")
  t.deepEqual(parser.parseRangeOptions("1..3..-2"), { range: ["1","3"]}, "multiple ranges")

  t.end()
})


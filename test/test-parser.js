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
  t.deepEquals(parser.parseRangeOptions("1 2 3"), { options: ["1 2 3"]}, "no range or options")
  t.deepEquals(parser.parseRangeOptions("1 2..3 4 5"), { range: ["1 2","3 4 5"]}, "range")
  t.deepEquals(parser.parseRangeOptions("a|b|c"), { options: ["a","b","c"]}, "options")
  t.deepEquals(parser.parseRangeOptions("1 2||3"), { options: ["1 2","","3"]}, "empty option")
  t.deepEquals(parser.parseRangeOptions("..3"), { range: ["","3"]}, "empty range")
  t.deepEquals(parser.parseRangeOptions("1..3 | 2.5..6"), { options: ["1..3 "," 2.5..6"]}, "both range and options")
  t.deepEquals(parser.parseRangeOptions("1..3..-2"), { range: ["1","3"]}, "multiple ranges")

  t.end()
})

test("parser.parseSelector", (t) => {
  t.deepEquals(parser.parseSelector(""), {type: "", id: "", classes: [], attrs: {}}, "empty")
  t.deepEquals(parser.parseSelector("xyz"), {type: "xyz", id: "", classes: [], attrs: {}}, "type")
  t.deepEquals(parser.parseSelector("#xyz"), {type: "", id: "xyz", classes: [], attrs: {}}, "id")
  t.deepEquals(parser.parseSelector(".xyz"), {type: "", id: "", classes: ["xyz"], attrs: {}}, "class")
  t.deepEquals(parser.parseSelector("[xyz=1]"), {type: "", id: "", classes: [], attrs: {"xyz": "1"}}, "attributes")
  t.deepEquals(parser.parseSelector("type.class#id[attr=value]"), {type: "type", id: "id", classes: ["class"], attrs: {attr: "value"}}, "everything")
  t.deepEquals(parser.parseSelector(".class#id[]"), {type: "", id: "id", classes: ["class"], attrs: {}}, "class and id")
  t.deepEquals(parser.parseSelector(".class1#id.class2"), {type: "", id: "id", classes: ["class1", "class2"], attrs: {}}, "multiple classes")
  t.deepEquals(parser.parseSelector("[foo=bar][one.two=three.four]"), {type: "", id: "", classes: [], attrs: {"foo": "bar", "one.two": "three.four"}}, "multiple attributes, and dot notation")
  t.deepEquals(parser.parseSelector("xyz[foo=bar]#abc"), {type: "xyz", id: "abc", classes: [], attrs: {"foo": "bar"}}, "id at the end")

  t.end()
})
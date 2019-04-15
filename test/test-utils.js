import test from "tape"
import * as utils from "../src/utils.js"

test("utils.deepEquals", (t) => {
  t.ok(utils.deepEquals({}, {}), "emptry objects")
  t.ok(utils.deepEquals([], new Float32Array()), "empty arrays")
  t.ok(utils.deepEquals(1, 1), "numbers")
  t.notOk(utils.deepEquals([1], [1,2]), "different size arrays")
  t.notOk(utils.deepEquals([1,2], [1]), "different size arrays II")
  t.notOk(utils.deepEquals({x:1}, {y:2,x:1}), "different size objects")
  t.notOk(utils.deepEquals({x:1,y:2}, {y:2}), "different size objects II")
  t.notOk(utils.deepEquals("a", "b"), "different strings")
  t.ok(utils.deepEquals(new Float32Array(3).fill(6), [6,6,6]), "float array vs array, same content")
  t.end()
})

test("utils.clamp", (t) => {
  t.ok(utils.clamp(.5,0,1) === .5, "no clamp")
  t.ok(utils.clamp(-1,0,1) === 0, "clamp min")
  t.ok(utils.clamp(2,0,1) === 1, "clamp max")
  t.ok(utils.clamp(2,0.1,0.9) === 0.9, "clamp max floats")
  t.end()
})

test("utils.range", (t) => {
  t.deepEquals(utils.range(0), [], "empty")
  t.deepEquals(utils.range(1), [0], "0 max")
  t.deepEquals(utils.range(5), [0,1,2,3,4], "max")
  t.deepEquals(utils.range(2,5), [2,3,4,5], "min, max")
  t.deepEquals(utils.range(5,2), [5,4,3,2], "max, min")
  t.deepEquals(utils.range(5,2,-2), [5,3], "max, min, step")
  t.deepEquals(utils.range(1,10,3), [1,4,7,10], "min, max, step")
  t.deepEquals(utils.range(10,-2,-3), [10,7,4,1,-2], "max, min, step through 0")
  t.deepEquals(utils.range(0,10,-1), [], "invalid negative step")
  t.deepEquals(utils.range(10,0,1), [], "invalid positive step")
  t.end()
})

test("utils.getWithPath", (t) => {
  t.equals(utils.getWithPath({a: 1, b: {c: {x: "hello"}, d: 3}}, ["b","c","x"]), "hello", "valid leaf")
  t.equals(utils.getWithPath({a: 1, b: {c: {x: "hello"}, d: 3}}, ["b","c","y"]), undefined, "invalid leaf")
  t.equals(utils.getWithPath({a: 1, b: {c: {x: "hello"}, d: 3}}, ["a"]), 1, "valid first level")
  t.equals(utils.getWithPath({a: 1, b: {c: {x: "hello"}, d: 3}}, ["b","w"]), undefined, "invalid branch")
  t.end()
})

test("utils.deepCopy", (t) => {
  t.deepEquals(utils.deepCopy(""), "", "empty string")
  t.deepEquals(utils.deepCopy(1), 1, "number")
  t.deepEquals(utils.deepCopy([]), [], "empty array")
  t.deepEquals(utils.deepCopy({}), {}, "empty object")
  t.deepEquals(utils.deepCopy({a:1, b:"hello", c:undefined}), {a:1, b:"hello", c:undefined}, "object")
  t.deepEquals(utils.deepCopy([1,"help",false]), [1,"help",false], "array")
  t.deepEquals(utils.deepCopy({x: [1,"help",false], y: 2}), {x: [1,"help",false], y: 2}, "object with array")
  t.end()
})

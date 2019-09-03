import test from "tape"
import * as jsonHelper from "../src/json-helper.js"

test("jsonHelper.deepEquals", (t) => {
  t.ok(jsonHelper.deepEquals({}, {}), "emptry objects")
  t.ok(jsonHelper.deepEquals([], new Float32Array()), "empty arrays")
  t.ok(jsonHelper.deepEquals(1, 1), "numbers")
  t.notOk(jsonHelper.deepEquals([1], [1,2]), "different size arrays")
  t.notOk(jsonHelper.deepEquals([1,2], [1]), "different size arrays II")
  t.notOk(jsonHelper.deepEquals({x:1}, {y:2,x:1}), "different size objects")
  t.notOk(jsonHelper.deepEquals({x:1,y:2}, {y:2}), "different size objects II")
  t.notOk(jsonHelper.deepEquals("a", "b"), "different strings")
  t.ok(jsonHelper.deepEquals(new Float32Array(3).fill(6), [6,6,6]), "float array vs array, same content")
  t.end()
})


test("jsonHelper.getWithPath", (t) => {
  t.equals(jsonHelper.getWithPath({a: 1, b: {c: {x: "hello"}, d: 3}}, ["b","c","x"]), "hello", "valid leaf")
  t.equals(jsonHelper.getWithPath({a: 1, b: {c: {x: "hello"}, d: 3}}, ["b","c","y"]), undefined, "invalid leaf")
  t.equals(jsonHelper.getWithPath({a: 1, b: {c: {x: "hello"}, d: 3}}, ["a"]), 1, "valid first level")
  t.equals(jsonHelper.getWithPath({a: 1, b: {c: {x: "hello"}, d: 3}}, ["b","w"]), undefined, "invalid branch")
  t.equals(jsonHelper.getWithPath(undefined, undefined), undefined, "undefined")
  t.end()
})

test("jsonHelper.deepCopy", (t) => {
  t.deepEquals(jsonHelper.deepCopy(""), "", "empty string")
  t.deepEquals(jsonHelper.deepCopy(1), 1, "number")
  t.deepEquals(jsonHelper.deepCopy([]), [], "empty array")
  t.deepEquals(jsonHelper.deepCopy({}), {}, "empty object")
  t.deepEquals(jsonHelper.deepCopy({a:1, b:"hello", c:undefined}), {a:1, b:"hello", c:undefined}, "object")
  t.deepEquals(jsonHelper.deepCopy([1,"help",false]), [1,"help",false], "array")
  t.deepEquals(jsonHelper.deepCopy({x: [1,"help",false], y: 2}), {x: [1,"help",false], y: 2}, "object with array")
  t.end()
})


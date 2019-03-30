import test from "tape"
import * as utils from "../src/utils"

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
  t.deepEquals(utils.range(0), [])
  t.deepEquals(utils.range(1), [0])
  t.deepEquals(utils.range(5), [0,1,2,3,4])
  t.deepEquals(utils.range(2,5), [2,3,4,5])
  t.deepEquals(utils.range(5,2), [5,4,3,2])
  t.deepEquals(utils.range(5,2,-2), [5,3])
  t.deepEquals(utils.range(1,10,3), [1,4,7,10])
  t.deepEquals(utils.range(10,-2,-3), [10,7,4,1,-2])
  t.end()
})
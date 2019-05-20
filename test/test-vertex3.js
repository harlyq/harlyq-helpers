import test from "tape"
import * as vertex3 from "../src/vertex3.js"

test("vertex3.set", (t) => {
  t.deepEquals(vertex3.set([],1,-2,3), [1,-2,3], "3 values")
  t.deepEquals(vertex3.set([],1,-2), [1,-2,0], "2 values")
  t.deepEquals(vertex3.set([],1), [1,0,0], "1 value")
  t.deepEquals(vertex3.set([],8,9,10,3), [,,,8,9,10], "offset")
})

test("vertex3.average", (t) => {
  let out = new Float32Array(3)
  t.deepEquals(vertex3.average(out, [0,0,0]), [0,0,0], "zero")
  t.deepEquals(vertex3.average(out, [0,0,0, 1,1,1, 2,2,2, 3,3,3]), [3,3,3], "+ve vertices")
  t.deepEquals(vertex3.average(out, [-1,-2,-3, 3,2,1]), [-1,0,1], "vertices")
})

test("vertex3.add", (t) => {
  let out = new Float32Array(3)
  t.deepEquals(vertex3.add(out, [0,0,0], [0,0,0]), [0,0,0], "zero")
  t.deepEquals(vertex3.add(out, [0,0,0, 1,1,1, 2,2,2, 3,3,3], [-1,-2,-3], 3), [3,3,3], "offset in a")
  t.deepEquals(vertex3.add(out, [-1,-2,-3, 3,2,1], [4,5,6, 7,8,9], 3, 3), [10,10,10], "offset in both")
})
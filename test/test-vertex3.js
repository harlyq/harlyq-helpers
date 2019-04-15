import test from "tape"
import * as vertex3 from "../src/vertex3.js"

test("vertex3.set", (t) => {
  t.deepEquals(vertex3.set([],1,-2,3), [1,-2,3], "3 values")
  t.deepEquals(vertex3.set([],1,-2), [1,-2,0], "2 values")
  t.deepEquals(vertex3.set([],1), [1,0,0], "1 value")
  t.deepEquals(vertex3.set([],8,9,10,3), [,,,8,9,10], "offset")
})

test("vertex3.average", (t) => {
  t.deepEquals(vertex3.average([0,0,0]), [0,0,0], "zero")
  t.deepEquals(vertex3.average([0,0,0, 1,1,1, 2,2,2, 3,3,3]), [3,3,3], "+ve vertices")
  t.deepEquals(vertex3.average([-1,-2,-3, 3,2,1]), [-1,0,1], "vertices")
})
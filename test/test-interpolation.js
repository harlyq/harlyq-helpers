import test from "tape"
import * as interpolate from "../src/interpolation.js"

test("interpolate.lerp", (t) => {
  t.equals(interpolate.lerp(1,2,0), 1, "to start")
  t.equals(interpolate.lerp(1,2,1), 2, "to end")
  t.equals(interpolate.lerp(1,2,-1), 0, "before start")
  t.equals(interpolate.lerp(1,2,2), 3, "after end")
  t.equals(interpolate.lerp(1,2,.5), 1.5, "middle")
  t.equals(interpolate.lerp(1,2,.25), 1.25, "lerp")
  t.equals(interpolate.lerp(1,-2,.5), -0.5, "backwards")
  t.end()
})

test("interpolate.lerpArray", (t) => {
  t.deepEquals(interpolate.lerpArray([],[],.5), [], "no values")
  t.deepEquals(interpolate.lerpArray([1],[-1],.5), [0], "one value")
  t.deepEquals(interpolate.lerpArray([1,2],[2,-2],.75), [1.75, -1], "two values")
  t.deepEquals(interpolate.lerpArray([1],[2,-2],.75), [1.75, -2], "a smaller than b")
  t.deepEquals(interpolate.lerpArray([1,2],[2],.75), [1.75, 2], "a larger than b")
  t.end()
})

test("interpolate.lerpObject", (t) => {
  t.deepEquals(interpolate.lerpObject({},{}, .25), {}, "no values")
  t.deepEquals(interpolate.lerpObject({a:0, b:1},{a:10, b:-5}, .5), {a:5, b:-2}, "two values")
  t.deepEquals(interpolate.lerpObject({a:0},{a:10, b:-5}, .5), {a:5, b:-5}, "a smaller than b")
  t.deepEquals(interpolate.lerpObject({a:0, b:1},{b:-5}, .5), {a:0, b:-2}, "a larger than b")
  t.end()
})

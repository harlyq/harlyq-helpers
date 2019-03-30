import test from "tape"
import * as hull from "../src/hull.js"

const ascendingFn = (a,b) => a - b

test("hull.generateHullIndices", (t) => {
  let vertices = [-1,-1,-1, -1,-1,1, -1,1,1, -1,1,-1, 1,-1,-1, 1,-1,1, 1,1,1, 1,1,-1]
  t.deepEquals(hull.generateHullIndices(vertices).sort(ascendingFn), [0,3,6,9,12,15,18,21], "box hull" )
  
  vertices = [-1,-1,-1, 0,0,0, -1,-1,1, -1,1,1, -1,1,-1, 1,-1,-1, 1,-1,1, 1,1,1, 1,1,-1, -.5,-.5,-.5, .5,.5,.5]
  t.deepEquals(hull.generateHullIndices(vertices).sort(ascendingFn), [0,6,9,12,15,18,21,24], "box hull with extras" )

  t.end()
})


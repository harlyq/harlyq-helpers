import test from "tape"
import * as intersection from "../src/intersection.js"

test("intersection.lineAndPlane", (t) => {
  t.equal(intersection.lineAndPlane({x:0,y:0,z:0}, {x:1,y:0,z:0}, {x:0,y:0,z:1}, 0), 0, "parallel")
  t.equal(intersection.lineAndPlane({x:0,y:0,z:1}, {x:1,y:0,z:1}, {x:0,y:0,z:1}, 0), undefined, "parallel off the plane")
  t.equal(intersection.lineAndPlane({x:1,y:1,z:1}, {x:1,y:1,z:-1}, {x:0,y:0,z:1}, 0), .5, "perpendicular")
  t.equal(intersection.lineAndPlane({x:1,y:1,z:1}, {x:1,y:1,z:2}, {x:0,y:0,z:1}, 0), -1, "perpendicular, above plane")
  t.equal(intersection.lineAndPlane({x:1,y:1,z:-2}, {x:1,y:1,z:-1}, {x:0,y:0,z:1}, 0), 2, "perpendicular, below plane")
  t.equal(intersection.lineAndPlane({x:-2,y:-2,z:-2}, {x:2,y:2,z:2}, {x:0,y:0,z:1}, 0), .5, "through the plane")

  t.end()
})
import test from "tape"
import * as proximity from "../src/proximity.js"

const identity = () => new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1])
const numberSimilar = (a,b) => Math.abs(a - b) < 1e-5

test("proximity.pointToBox", (t) => {
  let m = identity()
  t.ok( numberSimilar(proximity.pointToBox({x:0,y:0,z:0}, {x:-1,y:-2,z:-3}, {x:2,y:4,z:6}, m), -1), "point inside" )
  t.ok( numberSimilar(proximity.pointToBox({x:-2,y:-3,z:-4}, {x:-1,y:-2,z:-3}, {x:2,y:4,z:6}, m), Math.sqrt(3)), "point min ouside" )
  t.ok( numberSimilar(proximity.pointToBox({x:3,y:5,z:7}, {x:-1,y:-2,z:-3}, {x:2,y:4,z:6}, m), Math.sqrt(3)), "point max ouside" )

  m = identity()
  m[12] = m[13] = m[14] = 4 // translate box to (4,4,4)
  t.ok( numberSimilar(proximity.pointToBox({x:1,y:1,z:1}, {x:-1,y:-1,z:-1}, {x:1,y:1,z:1}, m), Math.sqrt(12)), "point ouside - translated box" )
  t.end()
})

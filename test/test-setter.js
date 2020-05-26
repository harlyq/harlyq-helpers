import test from "tape"
import * as setter from "../src/setter.js"

test("createSetter object", (t) => {
  const pos = {x:0, y:0, z:0}
  const setPos = setter.createSetter({object: pos, value: {x:10, y:-5, z:.3}})
  const setPartialPos = setter.createSetter({object: pos, value: {x:5}})
  const setOtherPos = setter.createSetter({object: pos, value: {w:.6}})

  t.equal(setter.updateSetter(setPos,0), true, "no duration object, completes")
  t.deepEqual(pos, {x:10,y:-5,z:.3}, "no duration object")

  t.equal(setter.updateSetter(setPartialPos,0), true, "no duration partial object, completes")
  t.deepEqual(pos, {x:5,y:-5,z:.3}, "no duration partial object")

  t.equal(setter.updateSetter(setOtherPos,0), true, "no duration new property, completes")
  t.deepEqual(pos, {x:5,y:-5,z:.3,w:.6}, "no duration new property")

  const offset = {x:0, y:0, z:0}
  const setOffset = setter.createSetter({object: offset, value: {x:10, y:-10, z:0}, duration: 4})

  t.equal(setter.updateSetter(setOffset,0), false, "0/4 incomplete")
  t.deepEqual(offset, {x:0,y:0,z:0}, "0/4")
  t.equal(setter.updateSetter(setOffset,1), false, "1/4 incomplete")
  t.deepEqual(offset, {x:2.5,y:-2.5,z:0}, "1/4")
  t.equal(setter.updateSetter(setOffset,1), false, "2/4 incomplete")
  t.deepEqual(offset, {x:5,y:-5,z:0}, "2/4")
  t.equal(setter.updateSetter(setOffset,1), false, "3/4 incomplete")
  t.deepEqual(offset, {x:7.5,y:-7.5,z:0}, "3/4")
  t.equal(setter.updateSetter(setOffset,1), true, "4/4 complete")
  t.deepEqual(offset, {x:10,y:-10,z:0}, "4/4")
  t.equal(setter.updateSetter(setOffset,1), true, "4/4 still complete")
  t.deepEqual(offset, {x:10,y:-10,z:0}, "4/4 still")
  t.equal(setter.updateSetter(setOffset,-1), false, "3/4 reverse incomplete")
  t.deepEqual(offset, {x:7.5,y:-7.5,z:0}, "3/4 reverse")
  t.equal(setter.updateSetter(setOffset,-1), false, "2/4 reverse incomplete")
  t.deepEqual(offset, {x:5,y:-5,z:0}, "2/4 reverse")
  t.equal(setter.updateSetter(setOffset,-1), false, "1/4 reverse incomplete")
  t.deepEqual(offset, {x:2.5,y:-2.5,z:0}, "1/4 reverse")
  t.equal(setter.updateSetter(setOffset,-1), false, "0/4 reverse incomplete")
  t.deepEqual(offset, {x:0,y:0,z:0}, "0/4 reverse")
  t.equal(setter.updateSetter(setOffset,-1), false, "0/4 reverse still incomplete")
  t.deepEqual(offset, {x:0,y:0,z:0}, "0/4 reverse still")

  t.end()
})

test("createSetter array", (t) => {
  const array = [0,1,2,3]
  const setArray = setter.createSetter({object: array, value: [0,-1,4,-3], duration: 2})

  t.equal(setter.updateSetter(setArray,0), false, "0/2 incomplete")
  t.deepEqual(array, [0,1,2,3], "0/2")
  t.equal(setter.updateSetter(setArray,1), false, "1/2 incomplete")
  t.deepEqual(array, [0,0,3,0], "1/2")
  t.equal(setter.updateSetter(setArray,10), true, "2/2 complete")
  t.deepEqual(array, [0,-1,4,-3], "2/2")

  const list = [5,,6,.3]
  const setList = setter.createSetter({object: list, value: [-5,1,0,,4], duration: 2})

  t.equal(setter.updateSetter(setList,0), false, "0/2 list incomplete")
  t.deepEqual(list, [5,,6,.3], "0/2 list")
  t.equal(setter.updateSetter(setList,1), false, "1/2 list incomplete")
  t.deepEqual(list, [0,,3,.3], "1/2 list")
  t.equal(setter.updateSetter(setList,1), true, "2/2 list complete")
  t.deepEqual(list, [-5,1,0,.3,4], "2/2 list")
  t.equal(setter.updateSetter(setList,-10), false, "0/2 list reverse incomplete")
  t.deepEqual(list, [5,1,6,.3,4], "0/2 list reverse keeps new values")

  const partial = [1,2,3]
  const setPartial = setter.createSetter({object: partial, value: [3], duration: 2})

  t.equal(setter.updateSetter(setPartial,2), true, "2/2 partial complete")
  t.deepEqual(partial, [3,2,3], "2/2 partial")

  t.end()
})

test("createSetter easing", (t) => {
  const array = [1,2,3]
  const setArray = setter.createSetter({object: array, value: [2,4,6], duration: 1, easingFn: r => 2*r})

  t.equal(setter.updateSetter(setArray,.5), true, "double speed complete")
  t.deepEqual(array, [2,4,6], "double speed")
  
  t.end()
})

test("createKeyframes", (t) => {
  let posKeysComplete = false
  let posKeysLoopComplete = false

  const pos = {x:0,y:0,z:0}
  const posKeys = setter.createKeyframes({object: pos, values: [,{x:1},{x:2}], loops: 1, onLoop: () => {posKeysLoopComplete = true}, onComplete: () => {posKeysComplete = true} })

  t.equal(posKeys.isForward, true, "is forward")
  t.equal(posKeys.loopCount, 0, "starting from 0")
  t.equal(posKeys.loops, 1, "only 1 loop")
  t.deepEqual(posKeys.loopValues, [{x:0,y:0,z:0},{x:1},{x:2}], "sequence x = 0,1,2")

  t.equal(setter.updateKeyframes(posKeys, .25), false, ".25 object incomplete")
  t.deepEqual(pos, {x:.5,y:0,z:0}, ".25 object")
  t.equal(setter.updateKeyframes(posKeys, .25), false, ".5 object incomplete")
  t.deepEqual(pos, {x:1,y:0,z:0}, ".5 object")
  t.equal(setter.updateKeyframes(posKeys, .25), false, ".75 object incomplete")
  t.deepEqual(pos, {x:1.5,y:0,z:0}, ".75 object")
  t.equal(setter.updateKeyframes(posKeys, .25), true, "1 object complete")
  t.deepEqual(pos, {x:2,y:0,z:0}, "object complete")
  t.equal(posKeysComplete, true, "complete callback")
  t.equal(posKeysLoopComplete, false, "no loop complete callback")
  
  t.end()
})

test("createKeyframes alternate", (t) => {
  let alternateKeysComplete = false
  let alternateKeysLoopComplete = false

  const pos = {x:0, y:0, z:0}
  const alternateKeys = setter.createKeyframes({object: pos, values: [,{x:1},{x:2}], loops: 2, direction: 'alternate', onLoop: () => {alternateKeysLoopComplete = true}, onComplete: () => {alternateKeysComplete = true} })

  t.equal(alternateKeys.isForward, true, "is forward")
  t.equal(alternateKeys.loopCount, 0, "starting from 0")
  t.equal(alternateKeys.loops, 2, "2 loops")
  t.equal(alternateKeys.direction, 'alternate', "aternating loops")
  t.deepEqual(alternateKeys.loopValues, [{x:0,y:0,z:0},{x:1},{x:2}], "sequence x = 0,1,2")

  t.equal(setter.updateKeyframes(alternateKeys, .25), false, ".25 object incomplete")
  t.deepEqual(pos, {x:.5,y:0,z:0}, ".25 object")
  t.equal(setter.updateKeyframes(alternateKeys, .25), false, ".5 object incomplete")
  t.deepEqual(pos, {x:1,y:0,z:0}, ".5 object")
  t.equal(setter.updateKeyframes(alternateKeys, .25), false, ".75 object incomplete")
  t.deepEqual(pos, {x:1.5,y:0,z:0}, ".75 object")
  t.equal(setter.updateKeyframes(alternateKeys, .25), false, "1 object first loop")
  t.deepEqual(pos, {x:2,y:0,z:0}, "object first loop")
  t.equal(alternateKeysComplete, false, "no complete callback")
  t.equal(alternateKeysLoopComplete, true, "loop complete callback")
  t.equal(setter.updateKeyframes(alternateKeys, .25), false, ".75 object second loop")
  t.deepEqual(pos, {x:1.5,y:0,z:0}, "object second loop")
  t.equal(setter.updateKeyframes(alternateKeys, .25), false, ".5 object second loop")
  t.deepEqual(pos, {x:1,y:0,z:0}, "object second loop")
  t.equal(setter.updateKeyframes(alternateKeys, .25), false, ".25 object second loop")
  t.deepEqual(pos, {x:.5,y:0,z:0}, "object second loop")
  t.equal(setter.updateKeyframes(alternateKeys, .25), true, "0 object second loop complete")
  t.deepEqual(pos, {x:0,y:0,z:0}, "object second loop")
  t.equal(alternateKeysComplete, true, "complete callback")

  t.end()
})

test("createKeyframes alternate", (t) => {
  let forwardKeysComplete = false
  let forwardKeysLoopComplete = false

  const pos = {x:0, y:0, z:0}
  const forwardKeys = setter.createKeyframes({object: pos, values: [,{x:1},{x:2}], loops: 2, direction: 'forward', onLoop: () => {forwardKeysLoopComplete = true}, onComplete: () => {forwardKeysComplete = true} })

  t.equal(forwardKeys.isForward, true, "is forward")
  t.equal(forwardKeys.loopCount, 0, "starting from 0")
  t.equal(forwardKeys.loops, 2, "2 loops")
  t.equal(forwardKeys.direction, 'forward', "forward loops")
  t.deepEqual(forwardKeys.loopValues, [{x:0,y:0,z:0},{x:1},{x:2}], "sequence x = 0,1,2")

  t.equal(setter.updateKeyframes(forwardKeys, .25), false, ".25 object incomplete")
  t.deepEqual(pos, {x:.5,y:0,z:0}, ".25 object")
  t.equal(setter.updateKeyframes(forwardKeys, .25), false, ".5 object incomplete")
  t.deepEqual(pos, {x:1,y:0,z:0}, ".5 object")
  t.equal(setter.updateKeyframes(forwardKeys, .25), false, ".75 object incomplete")
  t.deepEqual(pos, {x:1.5,y:0,z:0}, ".75 object")
  t.equal(setter.updateKeyframes(forwardKeys, .25), false, "1 object first loop")
  t.deepEqual(pos, {x:0,y:0,z:0}, "object first loop") // it loops back to the start
  t.equal(forwardKeysComplete, false, "no complete callback")
  t.equal(forwardKeysLoopComplete, true, "loop complete callback")
  t.equal(setter.updateKeyframes(forwardKeys, .25), false, ".75 object second loop")
  t.deepEqual(pos, {x:.5,y:0,z:0}, "object second loop")
  t.equal(setter.updateKeyframes(forwardKeys, .25), false, ".5 object second loop")
  t.deepEqual(pos, {x:1,y:0,z:0}, "object second loop")
  t.equal(setter.updateKeyframes(forwardKeys, .25), false, ".25 object second loop")
  t.deepEqual(pos, {x:1.5,y:0,z:0}, "object second loop")
  t.equal(setter.updateKeyframes(forwardKeys, .25), true, "0 object second loop complete")
  t.deepEqual(pos, {x:2,y:0,z:0}, "object second loop") // it terminates
  t.equal(forwardKeysComplete, true, "complete callback")

  t.end()
})

test("createKeyframes infinite", (t) => {
  let loopCount = 0

  const pos = {x:0}
  const infiniteKeys = setter.createKeyframes({object: pos, values: [{x:-1},{x:1}], onLoop: (count) => loopCount = count})

  for (let i = 1; i <= 3; i++) {
    t.equal(setter.updateKeyframes(infiniteKeys, 1), false, "never ends")
    t.deepEqual(pos, {x:-1}, "always at the beginning")
    t.equal(loopCount, i, "each iteration is one loop")  
  }

  t.end()
})

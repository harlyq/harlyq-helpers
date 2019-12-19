import test from "tape"
import * as utils from "../src/utils.js"

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

test("utils.count", (t) => {
  t.equals(utils.count([], () => false), 0, "empty")
  t.equals(utils.count([1,2,3,4], (v) => v > 3), 1, "some numbers")
  t.equals(utils.count([1,2,3,4], (v) => v > 0), 4, "all numbers")
  t.equals(utils.count(["aa","ab","ca","d"], (v) => v.includes("a")), 3, "strings")
  t.end()
})

test("utils.blocks", (t) => {
  const noBlocks = utils.blocks(0)
  t.equals(noBlocks.maxUsed(), 0, "empty, none used")
  t.equals(noBlocks.allocate(1), undefined, "empty, cannot allocate")
  t.equals(noBlocks.release(1), 0, "empty, cannot release")
  t.equals(noBlocks.maxUsed(), 0, "empty, still none used")

  const oneBlock = utils.blocks(1)
  t.equals(oneBlock.maxUsed(), 0, "one block, unused")
  t.equals(oneBlock.allocate(1), 0, "one block, allocated")
  t.equals(oneBlock.maxUsed(), 1, "one block, one used")
  t.equals(oneBlock.allocate(1), undefined, "one block, cannot allocate two blocks")
  t.equals(oneBlock.release(1), 0, "one block, cannot free past the end")
  t.equals(oneBlock.maxUsed(), 1, "one block, still one used")
  t.equals(oneBlock.release(0), 1, "one block, free allocated block")
  t.equals(oneBlock.maxUsed(), 0, "one block, all available")

  const twoBlock = utils.blocks(20)
  t.equals(twoBlock.allocate(10), 0, "two block, one allocated")
  t.equals(twoBlock.maxUsed(), 10, "two block, confirm one allocated")
  t.equals(twoBlock.allocate(10), 10, "two block, second allocate")
  t.equals(twoBlock.maxUsed(), 20, "two block, confirm all allocated")
  t.equals(twoBlock.release(0), 10, "two block, free first block")
  t.equals(twoBlock.maxUsed(), 20, "two block, last block still allocated")
  t.equals(twoBlock.release(10), 10, "two block, free second block")
  t.equals(twoBlock.maxUsed(), 0, "two block, all blocks free")
  t.equals(twoBlock.allocate(20), 0, "two block, allocate all blocks")
  t.equals(twoBlock.maxUsed(), 20, "two block, all blocks used")

  const threeBlock = utils.blocks(300)
  t.equals(threeBlock.allocate(100), 0, "three block, first allocated")
  t.equals(threeBlock.allocate(100), 100, "three block, second allocated")
  t.equals(threeBlock.allocate(100), 200, "three block, third allocated")
  t.equals(threeBlock.release(0), 100, "three block, release the first block")
  t.equals(threeBlock.allocate(100), 0, "three block, reallocate first block")
  t.equals(threeBlock.release(100), 100, "three block, release the second block")
  t.equals(threeBlock.allocate(100), 100, "three block, reallocate second block")
  t.equals(threeBlock.release(200), 100, "three block, release the third block")
  t.equals(threeBlock.allocate(100), 200, "three block, reallocate third block")
  t.equals(threeBlock.release(200), 100, "three block, free last block")
  t.equals(threeBlock.maxUsed(), 200, "three block, confirm last block free")
  t.equals(threeBlock.release(0), 100, "three block, free first block")
  t.equals(threeBlock.maxUsed(), 200, "three block, confirm last block still free")
  t.equals(threeBlock.release(100), 100, "three block, free second block")
  t.equals(threeBlock.maxUsed(), 0, "three block, confirm all blocks free")
  t.equals(threeBlock.allocate(100), 0, "three block, re-allocate first")
  t.equals(threeBlock.allocate(100), 100, "three block, re-allocate second")
  t.equals(threeBlock.allocate(100), 200, "three block, re-allocate third")
  t.equals(threeBlock.release(100), 100, "three block, free second")
  t.equals(threeBlock.maxUsed(), 300, "three block, confirm max at third block")
  t.equals(threeBlock.release(200), 100, "three block, free third")
  t.equals(threeBlock.maxUsed(), 100, "three block, confirm second and third block freed")
  t.equals(threeBlock.release(0), 100, "three block, free first")
  t.equals(threeBlock.maxUsed(), 0, "three block, confirm no allocations")
  t.end()

  const tenBlocks = utils.blocks(30)
  for (let i = 0; i < 10; i++) { 
    tenBlocks.allocate(3) 
  }
  t.equals(tenBlocks.maxUsed(), 30, "ten blocks, all allocated part 1")
  for (let i = 0; i < 10; i++) {
    tenBlocks.release(i*3)
  }
  t.equals(tenBlocks.maxUsed(), 0, "ten blocks, all released from the beginning")

  for (let i = 0; i < 10; i++) { 
    tenBlocks.allocate(3) 
  }
  t.equals(tenBlocks.maxUsed(), 30, "ten blocks, all allocated part 2")
  for (let i = 9; i >= 0; i--) {
    tenBlocks.release(i*3)
  }
  t.equals(tenBlocks.maxUsed(), 0, "ten blocks, all released from the end")

  for (let i = 0; i < 10; i++) { 
    tenBlocks.allocate(3) 
  }
  t.equals(tenBlocks.maxUsed(), 30, "ten blocks, all allocated part 3")
  for (let i of [2,0,9,5,8,1,3,4,7,6]) {
    tenBlocks.release(i*3)
  }
  t.equals(tenBlocks.maxUsed(), 0, "ten blocks, all released non-sequentially")

})

test("utils.shuffle", (t) => {
  const numerics = [1,2,3,4,5]
  const words = ["cat","sat","on","the","mat"]
  const shuffled1 = utils.shuffle(numerics)
  const shuffled2 = utils.shuffle(numerics)

  t.deepEquals(utils.shuffle([]), [], "empty")
  t.notDeepEqual(utils.shuffle(numerics), numerics, "shuffled numbers")
  t.notDeepEqual(utils.shuffle(words), words, "shuffled words")
  t.ok(shuffled1.every(v => numerics.indexOf(v) !== -1), "all elements present")
  t.ok(shuffled1.length == numerics.length, "same number of elements")
  t.ok(shuffled1.length === shuffled2.length, "consecutive shuffles are same size")
  t.ok(shuffled2.some((v,i) => shuffled1[i] !== v), "consecutive shuffles are different")
  t.end()
})

import test from "tape"
import * as slidingHelper from "../src/sliding-helper.js"

test("slidingHelper.create", (t) => {
  try {
    t.notok(slidingHelper.create(0,0), "invalid size")
  } catch {
    t.pass("invalid size")
  }

  t.deepEquals(slidingHelper.create(2,2), {
    tiles: [{id: 0, row: 0, col: 0}, {id: 1, row: 0, col: 1}, {id: 2, row: 1, col: 0}, {id: 3, row: 1, col: 1}],
    slidingInfos: [],
    sliding: undefined,
    numRows: 2,
    numCols: 2,
    missingTile: {id: 3, row: 1, col: 1},
  }, "2x2 puzzle")

  t.end()
})

test("slidingHelper.slideTiles", (t) => {
  const puzzleA = slidingHelper.create(2,2)
  const puzzleB = slidingHelper.create(2,2)
  const puzzleC = slidingHelper.create(3,3)
  
  slidingHelper.slideTiles(puzzleA, puzzleA.tiles[0], "col", 1)
  slidingHelper.recalculateMissingTile(puzzleA)

  t.deepEquals(puzzleA, {
    tiles: [{id: 0, row: 0, col: 0}, {id: 1, row: 0, col: 1}, {id: 2, row: 1, col: 0}, {id: 3, row: 1, col: 1}],
    slidingInfos: [],
    sliding: undefined,
    numRows: 2,
    numCols: 2,
    missingTile: {id: 3, row: 1, col: 1},
  }, "immovable")

  slidingHelper.slideTiles(puzzleA, puzzleA.tiles[1], "col", 1)
  slidingHelper.recalculateMissingTile(puzzleA)

  t.deepEquals(puzzleA, {
    tiles: [{id: 0, row: 0, col: 0}, {id: 1, row: 1, col: 1}, {id: 2, row: 1, col: 0}, {id: 3, row: 0, col: 1}],
    slidingInfos: [],
    sliding: undefined,
    numRows: 2,
    numCols: 2,
    missingTile: {id: 3, row: 0, col: 1},
  }, "full slide last column of 2x2")

  slidingHelper.slideTiles(puzzleB, puzzleB.tiles[1], "col", .5)
  slidingHelper.recalculateMissingTile(puzzleB)

  t.deepEquals(puzzleB, {
    tiles: [{id: 0, row: 0, col: 0}, {id: 1, row: 0, col: 1}, {id: 2, row: 1, col: 0}, {id: 3, row: 1, col: 1}],
    slidingInfos: [{tile: {id: 1, row: 0, col: 1}, row: .5, col: 0}],
    sliding: "col",
    numRows: 2,
    numCols: 2,
    missingTile: {id: 3, row: 1, col: 1},
  }, "partial slide last column of 2x2")

  slidingHelper.slideTiles(puzzleC, puzzleC.tiles[2], "col", .5)
  slidingHelper.recalculateMissingTile(puzzleC)

  t.deepEquals(puzzleC, {
    tiles: [{id: 0, row: 0, col: 0}, {id: 1, row: 0, col: 1}, {id: 2, row: 0, col: 2}, {id: 3, row: 1, col: 0}, {id: 4, row: 1, col: 1}, {id: 5, row: 1, col: 2}, {id: 6, row: 2, col: 0}, {id: 7, row: 2, col: 1}, {id: 8, row: 2, col: 2}],
    slidingInfos: [{tile: {id: 2, row: 0, col: 2}, row: .5, col: 0}, {tile: {id: 5, row: 1, col: 2}, row: .5, col: 0}],
    sliding: "col",
    numRows: 3,
    numCols: 3,
    missingTile: {id: 8, row: 2, col: 2},
  }, "partial slide of row 0, col 2 down")

  slidingHelper.slideTiles(puzzleC, puzzleC.tiles[2], "col", 0)
  slidingHelper.recalculateMissingTile(puzzleC)

  t.deepEquals(puzzleC, {
    tiles: [{id: 0, row: 0, col: 0}, {id: 1, row: 0, col: 1}, {id: 2, row: 0, col: 2}, {id: 3, row: 1, col: 0}, {id: 4, row: 1, col: 1}, {id: 5, row: 1, col: 2}, {id: 6, row: 2, col: 0}, {id: 7, row: 2, col: 1}, {id: 8, row: 2, col: 2}],
    slidingInfos: [{tile: {id: 2, row: 0, col: 2}, row: 0, col: 0}, {tile: {id: 5, row: 1, col: 2}, row: .5, col: 0}],
    sliding: "col",
    numRows: 3,
    numCols: 3,
    missingTile: {id: 8, row: 2, col: 2},
  }, "partial slide of row 0, col 2 up")

  slidingHelper.slideTiles(puzzleC, puzzleC.tiles[5], "col", 1)
  slidingHelper.recalculateMissingTile(puzzleC)

  t.deepEquals(puzzleC, {
    tiles: [{id: 0, row: 0, col: 0}, {id: 1, row: 0, col: 1}, {id: 2, row: 0, col: 2}, {id: 3, row: 1, col: 0}, {id: 4, row: 1, col: 1}, {id: 5, row: 2, col: 2}, {id: 6, row: 2, col: 0}, {id: 7, row: 2, col: 1}, {id: 8, row: 1, col: 2}],
    slidingInfos: [],
    sliding: undefined,
    numRows: 3,
    numCols: 3,
    missingTile: {id: 8, row: 1, col: 2},
  }, "slide row 1, col 2 down")

  slidingHelper.slideTiles(puzzleC, puzzleC.tiles[5], "col", 1)
  slidingHelper.recalculateMissingTile(puzzleC)

  t.deepEquals(puzzleC, {
    tiles: [{id: 0, row: 0, col: 0}, {id: 1, row: 0, col: 1}, {id: 2, row: 0, col: 2}, {id: 3, row: 1, col: 0}, {id: 4, row: 1, col: 1}, {id: 5, row: 2, col: 2}, {id: 6, row: 2, col: 0}, {id: 7, row: 2, col: 1}, {id: 8, row: 1, col: 2}],
    slidingInfos: [],
    sliding: undefined,
    numRows: 3,
    numCols: 3,
    missingTile: {id: 8, row: 1, col: 2},
  }, "ignore slide away from the missingTile")

  slidingHelper.slideTiles(puzzleC, puzzleC.tiles[8], "row", -1)
  slidingHelper.recalculateMissingTile(puzzleC)

  t.deepEquals(puzzleC, {
    tiles: [{id: 0, row: 0, col: 0}, {id: 1, row: 0, col: 1}, {id: 2, row: 0, col: 2}, {id: 3, row: 1, col: 0}, {id: 4, row: 1, col: 1}, {id: 5, row: 2, col: 2}, {id: 6, row: 2, col: 0}, {id: 7, row: 2, col: 1}, {id: 8, row: 1, col: 2}],
    slidingInfos: [],
    sliding: undefined,
    numRows: 3,
    numCols: 3,
    missingTile: {id: 8, row: 1, col: 2},
  }, "ignore slide on missingTile")

  slidingHelper.slideTiles(puzzleC, puzzleC.tiles[3], "row", .2)
  slidingHelper.recalculateMissingTile(puzzleC)

  t.deepEquals(puzzleC, {
    tiles: [{id: 0, row: 0, col: 0}, {id: 1, row: 0, col: 1}, {id: 2, row: 0, col: 2}, {id: 3, row: 1, col: 0}, {id: 4, row: 1, col: 1}, {id: 5, row: 2, col: 2}, {id: 6, row: 2, col: 0}, {id: 7, row: 2, col: 1}, {id: 8, row: 1, col: 2}],
    slidingInfos: [{tile: {id: 3, row: 1, col: 0}, row: 0, col: .2}, {tile: {id: 4, row: 1, col: 1}, row: 0, col: .2}],
    sliding: "row",
    numRows: 3,
    numCols: 3,
    missingTile: {id: 8, row: 1, col: 2},
  }, "part slide the middle row")

  slidingHelper.slideTiles(puzzleC, puzzleC.tiles[2], "col", 1)
  slidingHelper.recalculateMissingTile(puzzleC)

  t.deepEquals(puzzleC, {
    tiles: [{id: 0, row: 0, col: 0}, {id: 1, row: 0, col: 1}, {id: 2, row: 0, col: 2}, {id: 3, row: 1, col: 0}, {id: 4, row: 1, col: 1}, {id: 5, row: 2, col: 2}, {id: 6, row: 2, col: 0}, {id: 7, row: 2, col: 1}, {id: 8, row: 1, col: 2}],
    slidingInfos: [{tile: {id: 3, row: 1, col: 0}, row: 0, col: .2}, {tile: {id: 4, row: 1, col: 1}, row: 0, col: .2}],
    sliding: "row",
    numRows: 3,
    numCols: 3,
    missingTile: {id: 8, row: 1, col: 2},
  }, "ignore column slide on partially slid row")

  slidingHelper.slideTiles(puzzleC, puzzleC.tiles[3], "row", 1)
  slidingHelper.recalculateMissingTile(puzzleC)
  
  t.deepEquals(puzzleC, {
    tiles: [{id: 0, row: 0, col: 0}, {id: 1, row: 0, col: 1}, {id: 2, row: 0, col: 2}, {id: 3, row: 1, col: 1}, {id: 4, row: 1, col: 2}, {id: 5, row: 2, col: 2}, {id: 6, row: 2, col: 0}, {id: 7, row: 2, col: 1}, {id: 8, row: 1, col: 0}],
    slidingInfos: [],
    sliding: undefined,
    numRows: 3,
    numCols: 3,
    missingTile: {id: 8, row: 1, col: 0},
  }, "complete slide of the middle row")


  t.end()
})
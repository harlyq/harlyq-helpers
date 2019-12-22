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

test("slidingHelper.set", (t) => {
  const puzzleA = slidingHelper.create(2,2)

  try {
    t.notok(slidingHelper.set(puzzleA,[]), "empty")
  } catch {
    t.pass("empty")
  }

  try {
    t.notok(slidingHelper.set(puzzleA, [0,1,2,3,4]), "invalid size")
  } catch {
    t.pass("invalid size")
  }

  try {
    t.notok(slidingHelper.set(puzzleA, [0,1,1,1]), "missing entries")
  } catch {
    t.pass("missing entries")
  }


  t.deepEqual(slidingHelper.set(slidingHelper.create(2,2), [0,1,2,3]), {
    tiles: [{id: 0, row: 0, col: 0}, {id: 1, row: 0, col: 1}, {id: 2, row: 1, col: 0}, {id: 3, row: 1, col: 1}],
    slidingInfos: [],
    sliding: undefined,
    numRows: 2,
    numCols: 2,
    missingTile: {id: 3, row: 1, col: 1},
  }, "valid 2x2")

  const layout = [6,3,2,0,9,8,1,7,5,10,4,11]
  t.deepEqual(slidingHelper.get(slidingHelper.set(slidingHelper.create(3,4), layout)), layout, "3x4")

  t.end()
})

test("slidingHelper.isSolveable", (t) => {
  const puzzleA = slidingHelper.set(slidingHelper.create(4,4), [5,0,9,1,6,10,3,13,4,15,8,14,7,11,12,2])
  const puzzleB = slidingHelper.set(slidingHelper.create(4,4), [0,1,2,3,4,5,6,7,8,9,10,11,12,14,13,15])
  const puzzleC = slidingHelper.set(slidingHelper.create(4,4), [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15])

  t.equal(slidingHelper.isSolveable(puzzleA), true, "solveable")
  t.equal(slidingHelper.isSolveable(puzzleB), false, "unsolveable")
  t.equal(slidingHelper.isSolveable(puzzleC), true, "solveable ii")
  t.end()
})

test("slidingHelper.shuffle", (t) => {
  const puzzleOrigin = slidingHelper.create(3,3)
  const puzzleA = slidingHelper.create(3,3)
  const puzzleB = slidingHelper.create(3,3)
  slidingHelper.shuffle(puzzleA)
  slidingHelper.shuffle(puzzleB)

  t.notDeepEqual(puzzleA, puzzleOrigin, "shuffle")
  t.notDeepEqual(puzzleA, puzzleB, "two different shuffles")
  t.equal(puzzleA.missingTile.id, puzzleA.numCols*puzzleA.numRows - 1, "missing tile is last")
  t.equal(puzzleB.missingTile.id, puzzleB.numCols*puzzleA.numRows - 1, "missing tile is last (ii)")

  for (let i = 0; i < 20; i++) {
    slidingHelper.shuffle(puzzleA)
    t.equal(slidingHelper.isSolveable(puzzleA), true, `shuffle is solveable - ${i}`)
  }
  
  t.end()
})

test("slidingHelper.slideTiles", (t) => {
  const puzzleA = slidingHelper.create(2,2)
  const puzzleB = slidingHelper.create(2,2)
  const puzzleC = slidingHelper.create(3,3)
  const puzzleD = slidingHelper.create(4,4)
  const ascendingId = (a,b) => "tile" in a ? (a.tile.id - b.tile.id): (a.id - b.id)

  slidingHelper.slideTiles(puzzleA, puzzleA.tiles[0], "col", 1)
  slidingHelper.recalculateMissingTile(puzzleA)

  t.deepEqual({
    tiles: puzzleA.tiles.slice().sort(ascendingId),
    slidingInfos: puzzleA.slidingInfos.slice().sort(ascendingId),
    sliding: puzzleA.sliding,
    missingTile: puzzleA.missingTile,
  }, {
    tiles: [{id: 0, row: 0, col: 0}, {id: 1, row: 0, col: 1}, {id: 2, row: 1, col: 0}, {id: 3, row: 1, col: 1}],
    slidingInfos: [],
    sliding: undefined,
    missingTile: {id: 3, row: 1, col: 1}
   }, "immovable")

  slidingHelper.slideTiles(puzzleA, puzzleA.tiles[1], "col", 1)
  slidingHelper.recalculateMissingTile(puzzleA)

  t.deepEquals({
    tiles: puzzleA.tiles.slice().sort(ascendingId),
    slidingInfos: puzzleA.slidingInfos.slice().sort(ascendingId),
    sliding: puzzleA.sliding,
    missingTile: puzzleA.missingTile,
  }, {
    tiles: [{id: 0, row: 0, col: 0}, {id: 1, row: 1, col: 1}, {id: 2, row: 1, col: 0}, {id: 3, row: 0, col: 1}],
    slidingInfos: [],
    sliding: undefined,
    missingTile: {id: 3, row: 0, col: 1},
  }, "full slide last column of 2x2")

  slidingHelper.slideTiles(puzzleB, puzzleB.tiles[1], "col", .5)
  slidingHelper.recalculateMissingTile(puzzleB)

  t.deepEquals({
    tiles: puzzleB.tiles.slice().sort(ascendingId),
    slidingInfos: puzzleB.slidingInfos.slice().sort(ascendingId),
    sliding: puzzleB.sliding,
    missingTile: puzzleB.missingTile,
  }, {
    tiles: [{id: 0, row: 0, col: 0}, {id: 1, row: 0, col: 1}, {id: 2, row: 1, col: 0}, {id: 3, row: 1, col: 1}],
    slidingInfos: [{tile: {id: 1, row: 0, col: 1}, row: .5, col: 0}],
    sliding: "col",
    missingTile: {id: 3, row: 1, col: 1},
  }, "partial slide last column of 2x2")

  slidingHelper.slideTiles(puzzleC, puzzleC.tiles[2], "col", .5)
  slidingHelper.recalculateMissingTile(puzzleC)

  t.deepEquals({
    tiles: puzzleC.tiles.slice().sort(ascendingId),
    slidingInfos: puzzleC.slidingInfos.slice().sort(ascendingId),
    sliding: puzzleC.sliding,
    missingTile: puzzleC.missingTile,
  }, {
    tiles: [{id: 0, row: 0, col: 0}, {id: 1, row: 0, col: 1}, {id: 2, row: 0, col: 2}, {id: 3, row: 1, col: 0}, {id: 4, row: 1, col: 1}, {id: 5, row: 1, col: 2}, {id: 6, row: 2, col: 0}, {id: 7, row: 2, col: 1}, {id: 8, row: 2, col: 2}],
    slidingInfos: [{tile: {id: 2, row: 0, col: 2}, row: .5, col: 0}, {tile: {id: 5, row: 1, col: 2}, row: .5, col: 0}],
    sliding: "col",
    missingTile: {id: 8, row: 2, col: 2},
  }, "partial slide of row 0, col 2 down")

  slidingHelper.slideTiles(puzzleC, puzzleC.tiles[2], "col", 0)
  slidingHelper.recalculateMissingTile(puzzleC)

  t.deepEquals({
    tiles: puzzleC.tiles.slice().sort(ascendingId),
    slidingInfos: puzzleC.slidingInfos.slice().sort(ascendingId),
    sliding: puzzleC.sliding,
    missingTile: puzzleC.missingTile,
  }, {
    tiles: [{id: 0, row: 0, col: 0}, {id: 1, row: 0, col: 1}, {id: 2, row: 0, col: 2}, {id: 3, row: 1, col: 0}, {id: 4, row: 1, col: 1}, {id: 5, row: 1, col: 2}, {id: 6, row: 2, col: 0}, {id: 7, row: 2, col: 1}, {id: 8, row: 2, col: 2}],
    slidingInfos: [{tile: {id: 2, row: 0, col: 2}, row: 0, col: 0}, {tile: {id: 5, row: 1, col: 2}, row: .5, col: 0}],
    sliding: "col",
    missingTile: {id: 8, row: 2, col: 2},
  }, "partial slide of row 0, col 2 up")

  slidingHelper.slideTiles(puzzleC, puzzleC.tiles[5], "col", 1)
  slidingHelper.recalculateMissingTile(puzzleC)

  t.deepEquals({
    tiles: puzzleC.tiles.slice().sort(ascendingId),
    slidingInfos: puzzleC.slidingInfos.slice().sort(ascendingId),
    sliding: puzzleC.sliding,
    missingTile: puzzleC.missingTile,
  }, {
    tiles: [{id: 0, row: 0, col: 0}, {id: 1, row: 0, col: 1}, {id: 2, row: 0, col: 2}, {id: 3, row: 1, col: 0}, {id: 4, row: 1, col: 1}, {id: 5, row: 2, col: 2}, {id: 6, row: 2, col: 0}, {id: 7, row: 2, col: 1}, {id: 8, row: 1, col: 2}],
    slidingInfos: [],
    sliding: undefined,
    missingTile: {id: 8, row: 1, col: 2},
  }, "slide row 1, col 2 down")

  slidingHelper.slideTiles(puzzleC, puzzleC.tiles[5], "col", 1)
  slidingHelper.recalculateMissingTile(puzzleC)

  t.deepEquals({
    tiles: puzzleC.tiles.slice().sort(ascendingId),
    slidingInfos: puzzleC.slidingInfos.slice().sort(ascendingId),
    sliding: puzzleC.sliding,
    missingTile: puzzleC.missingTile,
  }, {
    tiles: [{id: 0, row: 0, col: 0}, {id: 1, row: 0, col: 1}, {id: 2, row: 0, col: 2}, {id: 3, row: 1, col: 0}, {id: 4, row: 1, col: 1}, {id: 5, row: 2, col: 2}, {id: 6, row: 2, col: 0}, {id: 7, row: 2, col: 1}, {id: 8, row: 1, col: 2}],
    slidingInfos: [],
    sliding: undefined,
    missingTile: {id: 8, row: 1, col: 2},
  }, "ignore slide away from the missingTile")

  slidingHelper.slideTiles(puzzleC, puzzleC.tiles[8], "row", -1)
  slidingHelper.recalculateMissingTile(puzzleC)

  t.deepEquals({
    tiles: puzzleC.tiles.slice().sort(ascendingId),
    slidingInfos: puzzleC.slidingInfos.slice().sort(ascendingId),
    sliding: puzzleC.sliding,
    missingTile: puzzleC.missingTile,
  }, {
    tiles: [{id: 0, row: 0, col: 0}, {id: 1, row: 0, col: 1}, {id: 2, row: 0, col: 2}, {id: 3, row: 1, col: 0}, {id: 4, row: 1, col: 1}, {id: 5, row: 2, col: 2}, {id: 6, row: 2, col: 0}, {id: 7, row: 2, col: 1}, {id: 8, row: 1, col: 2}],
    slidingInfos: [],
    sliding: undefined,
    missingTile: {id: 8, row: 1, col: 2},
  }, "ignore slide on missingTile")

  slidingHelper.slideTiles(puzzleC, puzzleC.tiles[3], "row", .2)
  slidingHelper.recalculateMissingTile(puzzleC)

  t.deepEquals({
    tiles: puzzleC.tiles.slice().sort(ascendingId),
    slidingInfos: puzzleC.slidingInfos.slice().sort(ascendingId),
    sliding: puzzleC.sliding,
    missingTile: puzzleC.missingTile,
  }, {
    tiles: [{id: 0, row: 0, col: 0}, {id: 1, row: 0, col: 1}, {id: 2, row: 0, col: 2}, {id: 3, row: 1, col: 0}, {id: 4, row: 1, col: 1}, {id: 5, row: 2, col: 2}, {id: 6, row: 2, col: 0}, {id: 7, row: 2, col: 1}, {id: 8, row: 1, col: 2}],
    slidingInfos: [{tile: {id: 3, row: 1, col: 0}, row: 0, col: .2}, {tile: {id: 4, row: 1, col: 1}, row: 0, col: .2}],
    sliding: "row",
    missingTile: {id: 8, row: 1, col: 2},
  }, "part slide the middle row")

  slidingHelper.slideTiles(puzzleC, puzzleC.tiles[2], "col", 1)
  slidingHelper.recalculateMissingTile(puzzleC)

  t.deepEquals({
    tiles: puzzleC.tiles.slice().sort(ascendingId),
    slidingInfos: puzzleC.slidingInfos.slice().sort(ascendingId),
    sliding: puzzleC.sliding,
    missingTile: puzzleC.missingTile,
  }, {
    tiles: [{id: 0, row: 0, col: 0}, {id: 1, row: 0, col: 1}, {id: 2, row: 0, col: 2}, {id: 3, row: 1, col: 0}, {id: 4, row: 1, col: 1}, {id: 5, row: 2, col: 2}, {id: 6, row: 2, col: 0}, {id: 7, row: 2, col: 1}, {id: 8, row: 1, col: 2}],
    slidingInfos: [{tile: {id: 3, row: 1, col: 0}, row: 0, col: .2}, {tile: {id: 4, row: 1, col: 1}, row: 0, col: .2}],
    sliding: "row",
    missingTile: {id: 8, row: 1, col: 2},
  }, "ignore column slide on partially slid row")

  slidingHelper.slideTiles(puzzleC, puzzleC.tiles[3], "row", 1)
  slidingHelper.recalculateMissingTile(puzzleC)
  
  t.deepEquals({
    tiles: puzzleC.tiles.slice().sort(ascendingId),
    slidingInfos: puzzleC.slidingInfos.slice().sort(ascendingId),
    sliding: puzzleC.sliding,
    missingTile: puzzleC.missingTile,
  }, {
    tiles: [{id: 0, row: 0, col: 0}, {id: 1, row: 0, col: 1}, {id: 2, row: 0, col: 2}, {id: 3, row: 1, col: 1}, {id: 4, row: 1, col: 2}, {id: 5, row: 2, col: 2}, {id: 6, row: 2, col: 0}, {id: 7, row: 2, col: 1}, {id: 8, row: 1, col: 0}],
    slidingInfos: [],
    sliding: undefined,
    missingTile: {id: 8, row: 1, col: 0},
  }, "complete slide of the middle row")

  slidingHelper.slideTiles(puzzleD, puzzleD.tiles[3], "col", 1)
  t.deepEqual(puzzleD.slidingInfos.slice().sort((a,b) => a.tile.id - b.tile.id), [{tile: {id: 3, row: 0, col: 3}, row: 1, col: 0}, {tile: {id: 7, row: 1, col: 3}, row: 1, col: 0}, {tile: {id: 11, row: 2, col: 3}, row: 1, col: 0}], "4x4 last column down")
  slidingHelper.recalculateMissingTile(puzzleD)
  t.deepEqual(puzzleD.missingTile, {id: 15, row: 0, col: 3}, "4x4 last column down - missing tile")

  slidingHelper.slideTiles(puzzleD, puzzleD.tiles[11], "col", -1)
  t.deepEqual(puzzleD.slidingInfos.slice().sort((a,b) => a.tile.id - b.tile.id), [{tile: {id: 3, row: 1, col: 3}, row: -1, col: 0}, {tile: {id: 7, row: 2, col: 3}, row: -1, col: 0}, {tile: {id: 11, row: 3, col: 3}, row: -1, col: 0}], "4x4 last column up")
  slidingHelper.recalculateMissingTile(puzzleD)
  t.deepEqual(puzzleD.missingTile, {id: 15, row: 3, col: 3}, "4x4 last up down - missing tile")

  slidingHelper.slideTiles(puzzleD, puzzleD.tiles[14], "row", .2)
  slidingHelper.slideTiles(puzzleD, puzzleD.tiles[14], "row", -20)
  slidingHelper.recalculateMissingTile(puzzleD)
  t.deepEqual({
    tileIds: slidingHelper.get(puzzleD),
    slidingInfos: puzzleD.slidingInfos,
    sliding: puzzleD.sliding,
    missingTile: puzzleD.missingTile
  }, {
    tileIds: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15],
    slidingInfos: [],
    sliding: undefined,
    missingTile: {id: 15, row: 3, col: 3}
  }, "partial slide then large reverse slide")

  t.end()
})

test("slidingHelper.findTileBySlidingRowCol", (t) => {
  const puzzleA = slidingHelper.create(2,2)

  t.deepEqual(slidingHelper.findTileBySlidingRowCol(puzzleA, -1, 0), undefined, "outside")
  t.deepEqual(slidingHelper.findTileBySlidingRowCol(puzzleA, 10, 10), undefined, "outside ii")
  t.deepEqual(slidingHelper.findTileBySlidingRowCol(puzzleA, 0, 0).id, 0, "inside")
  t.deepEqual(slidingHelper.findTileBySlidingRowCol(puzzleA, 1, 1).id, 3, "inside, missing tile")
  t.deepEqual(slidingHelper.findTileBySlidingRowCol(puzzleA, 1.5, .5).id, 2, "fractional")

  slidingHelper.slideTiles(puzzleA, puzzleA.tiles[1], "col", .5)
  t.deepEqual(slidingHelper.findTileBySlidingRowCol(puzzleA, 0.1, 1), undefined, "fractional, but not on slide tile")
  t.deepEqual(slidingHelper.findTileByRowCol(puzzleA, 0, 1).id, 1, "ignoring sliding")
  t.deepEqual(slidingHelper.findTileBySlidingRowCol(puzzleA, 0.6, 1).id, 1, "fractional, on slide tile in original non-slide")
  t.deepEqual(slidingHelper.findTileBySlidingRowCol(puzzleA, 1.2, 1).id, 1, "fractional, on slide tile in next non-slide")

  t.end()
})


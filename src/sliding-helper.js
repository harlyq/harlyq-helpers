import * as utils from "./utils.js"
import { info } from "./aframe-helper.js"

export function create(numRows, numCols) {
  if (numRows <= 0 || numCols <= 0) {
    throw Error(`rows and cols must be larger than 0`)
  }
  const numTiles = numRows*numCols
  const tiles = Array.from( { length: numTiles }, (_,i) => ({ id: i, row: Math.floor(i/numCols), col: i % numCols }) )

  const puzzle = {
    tiles,
    slidingInfos: [],
    sliding: undefined,
    numRows,
    numCols,
    missingTile: tiles[numTiles - 1],
  }

  return puzzle
}

export function shuffle(puzzle) {
  puzzle.tiles = utils.shuffle( puzzle.tiles )
  puzzle.tiles.forEach( (tile,i) => tile.id = i ) // assign id to the shuffled index
  puzzle.slidingInfos.length = 0
  puzzle.sliding = undefined
  puzzle.missingTile = puzzle.tiles[puzzle.tiles.length - 1]
  return puzzle
}

export function findTile(puzzle, id) {
  return puzzle.tiles.find(tile => tile.id === id)
}

export function findTileByRowCol(puzzle, row, col) {
  return puzzle.tiles.find(tile => tile.row === row && tile.col === col)
}

export function slideTiles(puzzle, tile, axis, delta) {
  const missingTile = puzzle.missingTile
  if (tile[axis] !== puzzle.missingTile[axis]) {
    return puzzle // can't move if not on a missingTile axis
  }

  if (tile == puzzle.missingTile) {
    return puzzle
  }

  if (puzzle.sliding && puzzle.sliding !== axis) {
    return puzzle // can't move in the opposite direction to an existing move
  }

  const altAxis = axis === "row" ? "col" : "row"
  const gapDirection = Math.sign(missingTile[altAxis] - tile[altAxis])
  const clampDelta = gapDirection > 0 ? utils.clamp(delta, 0, 1) : utils.clamp(delta, -1, 0)

  if (clampDelta === 0 && delta !== 0) {
    return puzzle // moving in the wrong direction
  }

  let tileInfo = puzzle.slidingInfos.find(info => info.tile === tile)
  if (!tileInfo) {
    tileInfo = {tile, row: 0, col: 0}
    puzzle.slidingInfos.push(tileInfo)
  }

  const slideDirection = Math.sign(clampDelta - tileInfo[altAxis])
  const gap = Math.abs(missingTile[altAxis] - tile[altAxis])

  tileInfo[altAxis] = clampDelta

  for (let i = 1; i < gap; i++) {
    const slidingTile = axis === "row" ? findTileByRowCol(puzzle, missingTile.row, tile.col + i*gapDirection) : findTileByRowCol(puzzle, tile.row + i*gapDirection, missingTile.col)
    const info = puzzle.slidingInfos.find(info => info.tile === slidingTile)
    if (!info) {
      puzzle.slidingInfos.push( {tile: slidingTile, row: 0, col: 0} )
    }
  }

  for (let info of puzzle.slidingInfos) {
    if (info === tileInfo) {
      continue
    }

    if ( slideDirection > 0 ? (info.tile[altAxis] < tile[altAxis]) : (info.tile[altAxis] > tile[altAxis]) ) {
      continue // tile not in the path of the moving tiles
    }

    if ( slideDirection > 0 ? (info[altAxis] > clampDelta) : (info[altAxis] < clampDelta) ) {
      continue // tile will not be bumped by the moving tile
    }

    info[altAxis] = clampDelta
  }

  puzzle.sliding = axis

  return puzzle
}

export function recalculateMissingTile(puzzle) {
  if (puzzle.slidingInfos.length === 0) {
    return false
  }

  const altAxis = puzzle.sliding === "col" ? "row" : "col"
  const COMPLETE_DELTAS = [0,1,-1]
  const isComplete = puzzle.slidingInfos.every( info => COMPLETE_DELTAS.includes( info[altAxis] ) ) // true if empty

  if (isComplete) {
    const missingTile = puzzle.missingTile

    // lock everything into it's new position
    for (let info of puzzle.slidingInfos) {
      info.tile[altAxis] += info[altAxis]
    }

    // determine the missing tile's new location (it may not have moved)
    if (altAxis === "row") {
      for (let i = 0; i < puzzle.numRows; i++) {
        if (!findTileByRowCol(puzzle, i, missingTile.col)) {
          missingTile.row = i
          break
        }
      }
    } else {
      for (let i = 0; i < puzzle.numCols; i++) {
        if (!findTileByRowCol(puzzle, missingTile.row, i)) {
          missingTile.col = i
          break
        }
      }
    }

    puzzle.sliding = undefined
    puzzle.slidingInfos.length = 0
  }

  return isComplete
}
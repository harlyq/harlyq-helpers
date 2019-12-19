import * as utils from "./utils.js"

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
  const gap = missingTile[altAxis] - tile[altAxis]
  const gapDirection = Math.sign(gap)
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
  tileInfo[altAxis] = clampDelta

  for (let i = 1; i < gap; i++) {
    const slidingTile = axis === "row" ? findTileByRowCol(puzzle, missingTile.row, tile.col + i) : findTileByRowCol(puzzle, tile.row + i, missingTile.col)
    const info = puzzle.slidingInfos.find(info => info.tile === slidingTile)
    if (!info) {
      puzzle.slidingInfos.push( {tile: slidingTile, row: 0, col: 0} )
    }
  }

  const COMPLETE_DELTAS = [0,1,-1]
  let isComplete = COMPLETE_DELTAS.includes(clampDelta)

  for (let info of puzzle.slidingInfos) {
    if (info === tileInfo) {
      continue
    }

    if ( slideDirection > 0 ? (info.tile[altAxis] < tile[altAxis]) : (info.tile[altAxis] > tile[altAxis]) ) {
      isComplete = isComplete && COMPLETE_DELTAS.includes(info[altAxis])
      continue // tile not in the path of the moving tiles
    }

    if ( slideDirection > 0 ? (info[altAxis] > clampDelta) : (info[altAxis] < clampDelta) ) {
      isComplete = isComplete && COMPLETE_DELTAS.includes(info[altAxis])
      continue // tile will not be bumped by the moving tile
    }

    info[altAxis] = clampDelta
  }

  if (isComplete) {
    missingTile[altAxis] = tile[altAxis]

    // lock everything into it's new position and move the missingTile to the starting tile's location
    for (let info of puzzle.slidingInfos) {
      info.tile[altAxis] += info[altAxis]
    }

    puzzle.sliding = undefined
    puzzle.slidingInfos.length = 0

  } else {
    puzzle.sliding = axis
  }

  return puzzle
}

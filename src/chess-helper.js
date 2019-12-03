const FEN_CODES = "prnbqkPRNBQK"
const CASTLE_REGEX = /(O\-O)(\-O)?([\#|\+]?)/
const SAN_REGEX = /([RNBKQ]?[a-h]?[1-8]?)(x?)([a-h][1-8])(=[RNBQ])?([\#|\+]?)/
const PGN_RESULT_REGEX = /1\-0|0\-1|1\/2\-1\/2|\*/
const PGN_TAG_REGEX = /\[\s*(\w+)\s*\"([^\"]*)\"\s*\]/
const PGN_MOVETEXT_REGEX = /([\d\.]+)\s+([\w\=\#\+\-\/\*]+)\s+([\w\=\#\+\-\/\*]+)?\s*(\d\-\/\*)?\s*/

parsePGN(`[a "hello"] [b "goodbye"] 1. e4 e5 2. Nf3 Nc6 3. e8 *`)

function decodeFile(fileStr) {
  return fileStr.charCodeAt(0) - 96
}

function decodeRank(rankStr) {
  return rankStr.charCodeAt(0) - 48
}

// rank "a"->"h" => 1->8, file "1"->"8" -> 1->8
export function coordToFileRank(coord) {
  return coord.length === 2 ? [decodeFile(coord[0]), decodeRank(coord[1])] : undefined
}

// rank 1->8 => "a"->"h", file 1->8 -> "1"->"8"
export function fileRankToCoord(rank, file) {
  return String.fromCharCode(rank + 96, file + 48)
}

export function parseFEN(fen) {
  const syntax = { moves: [], player: "white", whiteKingCastle: false, whiteQueenCastle: false, blackKingCastle: false, blackQueenCastle: false, enPassant: undefined, halfMove: 0, fullMove: 1 }
  const chunks = fen.split(" ")

  if (chunks.length < 5) {
    throw Error(`malformed fen`)
  }

  const rankChunks = chunks[0].split("/")

  function appendRank(layout, rank, rankChunk) {
    let file = 1
    for (let i = 0; i < rankChunk.length; i++) {
      const c = rankChunk[i]
      if (FEN_CODES.includes(c)) {
        layout.push( { code: c, file, rank } )
        file++
      } else if (Number(c) == c) {
        file += Number(c)
      } else {
        throw Error(`unknown letter "${c}" in fen rank chunk "${rankChunk}"`)
      }
    }
  }

  const numRanks = rankChunks.length
  for (let i = 0; i < numRanks; i++) {
    const rankChunk = rankChunks[i]
    appendRank(syntax.moves, numRanks - i, rankChunk) // chunks start with the highest rank, all ranks numbered from 1 up
  }

  syntax.player = chunks[1] === "b" ? "black" : "white"

  syntax.whiteKingCastle = chunks[2].includes("K")
  syntax.whiteQueenCastle = chunks[2].includes("Q")
  syntax.blackKingCastle = chunks[2].includes("k")
  syntax.blackQueenCastle = chunks[2].includes("q")

  if (chunks[3] && chunks[3] !== "-") {
    const [file, rank] = coordToFileRank(chunks[3])
    syntax.enPassant = {file, rank}
  }

  syntax.halfMove = chunks[4] ? Number(chunks[4]) : 0
  syntax.fullMove = chunks[5] ? Number(chunks[5]) : 1

  return syntax
}

export function decodeSAN(player, san) {
  const isWhite = player === "white"
  const castleParts = san.match(CASTLE_REGEX)
  
  if (castleParts) {
    const code = isWhite ? "K" : "k"
    const castle = castleParts[2] ? (isWhite ? "Q" : "q") : (isWhite ? "K" : "k")
    const toFile = castleParts[2] ? 3 : 7
    const toRank = isWhite ? 1 : 8

    return {
      code, // k for black king, K for white king
      fromFile: undefined,
      fromRank: undefined,
      capture: false,
      toFile,
      toRank,
      promotion: "",
      castle, // one of kqKQ, uppercase for white, k for king side, q for queen side
      check: castleParts[3], // + # or empty
    }
  }

  const parts = san.match(SAN_REGEX)
  if (!parts) {
    return undefined
  }

  const pieceStr = parts[1]
  const c0 = pieceStr[0]

  let code = undefined
  let fromRank = undefined
  let fromFile = undefined
  let fileRankOffset = 0

  if ("PRNBKQ".includes(c0)) {
    code = isWhite ? c0.toUpperCase() : c0.toLowerCase()
    fileRankOffset = 1
  } else {
    code = isWhite ? "P" : "p"
  }

  if (fileRankOffset < pieceStr.length) {
    fromFile = decodeFile(pieceStr[fileRankOffset])
    fromRank = decodeRank(pieceStr[pieceStr.length - 1]) // rank is always last, if used
    fromFile = fromFile >= 1 && fromFile <= 8 ? fromFile : undefined
    fromRank = fromRank >= 1 && fromRank <= 8 ? fromRank : undefined
  }

  const [toFile, toRank] = coordToFileRank(parts[3])
  const promotion = !parts[4] ? "" : isWhite ? parts[4][1].toUpperCase() : parts[4][1].toLowerCase()
  
  return parts ? {
    code: code, // one of prnbqkPRNBQK (upper case for white)
    fromFile, // may be undefined or in the range (1,8)
    fromRank, // may be undefined or in the range (1,8)
    capture: parts[2] === "x", // true or false
    toFile, // in the range (1,8)
    toRank, // in the range (1,8)
    promotion, // one of rnbqRNBQ or empty (upper case for white)
    castle: "",
    check: parts[5], // + # or empty
  } : undefined
}

// is a move feasible for this piece, given it's current location? 
// Note, it may include illegal moves e.g. en passant without another pawn,
// or moving through other pieces
// Bote, both rank and file are numbers between 1 and 8 inclusive
export function isMovePossible(code, pieceFile, pieceRank, toFile, toRank, isCapture) {
  if (pieceFile === toFile && pieceRank === toRank) {
    return false
  }

  switch(code) {
    case "p":
    case "P":
      const isBlack = code === code.toLowerCase()
      if (pieceFile === toFile && !isCapture) {
        if (isBlack && pieceRank === 7) {
          return toRank === 6 || toRank === 5
        } else if (!isBlack && pieceRank === 2) {
          return toRank === 3 || toRank === 4
        } else {
          return toRank === pieceRank + (isBlack ? -1 : 1)
        }
      } else if ( isCapture && (pieceFile - 1 === toFile || pieceFile + 1 === toFile) ) {
        return toRank === pieceRank + (isBlack ? -1 : 1)
      }
      return false

    case "r":
    case "R":
      return pieceFile === toFile || pieceRank === toRank

    case "n":
    case "N": {
      const colDelta = Math.abs(pieceFile - toFile)
      const rowDelta = Math.abs(pieceRank - toRank)
      return (colDelta === 2 && rowDelta === 1) || (colDelta === 1 && rowDelta === 2)
    }

    case "b":
    case "B":
      return Math.abs(pieceFile - toFile) === Math.abs(pieceRank - toRank)

    case "q":
    case "Q":
      return Math.abs(pieceFile - toFile) === Math.abs(pieceRank - toRank) || pieceFile === toFile || pieceRank === toRank

    case "k":
    case "K":
      return Math.abs(pieceFile - toFile) <= 1 && Math.abs(pieceRank - toRank) <= 1
  }
}

export function parsePGN(pgn) {
  let game = {moves: []}
  const text = pgn.replace(/\r\n|\n/, " ")

  let i = 0
  while (i < text.length) {
    const nextText = text.slice(i)
    const tagMatch = nextText.match(PGN_TAG_REGEX)
    if (tagMatch) {
      game[tagMatch[1]] = tagMatch[2]
      i += tagMatch[0].length + tagMatch.index
      continue
    }

    const moveMatch = nextText.match(PGN_MOVETEXT_REGEX)
    if (moveMatch) {
      let player = moveMatch[1].includes("...") ? "black" : "white"
      game.moves.push( decodeSAN(player, moveMatch[2]) )
  
      if ( moveMatch[3] && player === "white" && !PGN_RESULT_REGEX.test(moveMatch[3]) ) {
        game.moves.push( decodeSAN("black", moveMatch[3]) )
      }
  
      i += moveMatch[0].length + moveMatch.index
      continue
    }

    break
  }

  return game
}
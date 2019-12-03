const FEN_CODES = "prnbqkPRNBQK"
const CASTLE_REGEX = /(O\-O)(\-O)?([\#|\+]?)/
const SAN_REGEX = /([RNBKQ]?[a-h]?[1-8]?)(x?)([a-h][1-8])(=[RNBQ])?([\#|\+]?)/
const PGN_RESULT_REGEX = /1\-0|0\-1|1\/2\-1\/2|\*/
const PGN_TAG_REGEX = /\[\s*(\w+)\s*\"([^\"]*)\"\s*\]/
const PGN_MOVETEXT_REGEX = /([\d\.]+)\s*([a-zA-Z][\w\=\#\+\-\/\*]*)\s+([a-zA-Z][\w\=\#\+\-\/\*]*)?\s*(\d\-\/\*)?\s*(\{[^\}*]\})?\s*/

function decodeFile(fileStr) {
  return fileStr.charCodeAt(0) - 96
}

function decodeRank(rankStr) {
  return rankStr.charCodeAt(0) - 48
}

function fileToString(file) {
  return String.fromCharCode(file + 96)
}

function rankToString(rank) {
  return String.fromCharCode(rank + 48)
}

function moveNumberToMoveOffset(number, player) {
  return (number - 1)*2 + (player === "white" ? 0 : 1)
}

function moveOffsetToMoveNumber(offset) {
  return Math.floor(offset/2) + 1
}

// rank "a"->"h" => 1->8, file "1"->"8" -> 1->8
export function coordToFileRank(coord) {
  return coord.length === 2 ? [decodeFile(coord[0]), decodeRank(coord[1])] : undefined
}

// rank 1->8 => "a"->"h", file 1->8 -> "1"->"8"
export function fileRankToCoord(file, rank) {
  return String.fromCharCode(file + 96, rank + 48)
}

export function parseFEN(fenStr) {
  const syntax = { layout: [], player: "white", whiteKingCastle: false, whiteQueenCastle: false, blackKingCastle: false, blackQueenCastle: false, enPassant: undefined, halfMove: 0, fullMove: 1 }
  const chunks = fenStr.split(" ")

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
    appendRank(syntax.layout, numRanks - i, rankChunk) // chunks start with the highest rank, all ranks numbered from 1 up
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

export function fenToString(fen) {
  if (!fen) {
    return undefined
  }

  const sortedPieces = fen.layout.sort((a,b) => (b.rank - a.rank)*10 + a.file - b.file) // descending rank, ascending file

  let rankChunks = []
  let chunk = ""
  let file = 1
  let rank = 8
  let pieceIndex = 0
  let piece = sortedPieces[0]

  while (rank >= 1) {
    if (!piece || rank !== piece.rank) {
      if (file <= 8) {
        chunk += ((8 - file) + 1)
      }
      rankChunks.push(chunk)
      chunk = ""
      file = 1
      rank--
    }

    while (piece && piece.rank === rank) {
      if (piece.file > file) {
        chunk += (piece.file - file)
      }
      
      chunk += piece.code
      file = piece.file + 1
      piece = sortedPieces[++pieceIndex]
    }
  }

  const starting = fen.player === "white" ? "w" : "b"
  let castle = (fen.whiteKingCastle ? "K" : "") + (fen.whiteQueenCastle ? "Q" : "") + (fen.blackKingCastle ? "k" : "") + (fen.blackQueenCastle ? "q" : "")
  castle = castle ? castle : "-"
  const enPassant = fen.enPassant ? fileRankToCoord(fen.enPassant.file, fen.enPassant.rank) : "-"
  return `${rankChunks.join("/")} ${starting} ${castle} ${enPassant} ${fen.halfMove} ${fen.fullMove}`
}

export function decodeSAN(player, sanStr) {
  const isWhite = player === "white"
  const castleParts = sanStr.match(CASTLE_REGEX)
  
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

  const parts = sanStr.match(SAN_REGEX)
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

export function sanToString(san) {
  if (san) {
    const code = san.code.toUpperCase() !== "P" && !san.castle ? san.code.toUpperCase() : ""
    const fromFile = san.fromFile ? fileToString(san.fromFile) : ""
    const fromRank = san.fromRank ? rankToString(san.fromRank) : ""
    const to = !san.castle ? fileRankToCoord(san.toFile, san.toRank) : ""
    const promotion = san.promotion ? "=" + san.promotion.toUpperCase() : ""
    const capture = san.capture ? "x" : ""
    const castle = !san.castle ? "" : san.castle.toUpperCase() === "K" ? "O-O" : "O-O-O"
    return code + fromFile + fromRank + capture + to + promotion + castle + san.check
  }
}

// is a move feasible for this piece, given it's current location? 
// Note, it may include illegal moves e.g. en passant without another pawn,
// moving through other pieces, moving through check for castling
// Bote, both rank and file are numbers between 1 and 8 inclusive
export function isMovePossible(code, pieceFile, pieceRank, toFile, toRank, isCapture = false, isCastle = false) {
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
      if (isCastle) {
        const isBlack = code === code.toLowerCase()
        return pieceFile === 5 && (pieceRank === (isBlack ? 8 : 1)) && (toFile === 3 || toFile === 7) && (pieceRank === toRank)
      } else {
        return Math.abs(pieceFile - toFile) <= 1 && Math.abs(pieceRank - toRank) <= 1
      }
  }
}

export function parsePGN(pgn) {
  let game = {moves: []}
  const text = pgn.replace(/\r\n|\n/, " ")

  let i = 0
  let lookForTags = true
  let lookForMoves = true

  while (lookForTags && i < text.length) {
    const nextText = text.slice(i)
    const tagMatch = nextText.match(PGN_TAG_REGEX)
    if (tagMatch) {
      game[tagMatch[1]] = tagMatch[2]
      i += tagMatch[0].length + tagMatch.index
    } else {
      lookForTags = false
    }
  }


  while (lookForMoves && i < text.length) {
    const nextText = text.slice(i)
    const moveMatch = nextText.match(PGN_MOVETEXT_REGEX)
    if (moveMatch) {
      let player = moveMatch[1].includes("...") ? "black" : "white"

      if (game.moves.length === 0) {
        const moveNumber = Number( moveMatch[1].slice( 0, moveMatch[1].indexOf(".") ) )
        game.moveOffset = moveNumberToMoveOffset(moveNumber, player)
      }

      game.moves.push( decodeSAN(player, moveMatch[2]) )
  
      if ( moveMatch[3] && player === "white" && !PGN_RESULT_REGEX.test(moveMatch[3]) ) {
        game.moves.push( decodeSAN("black", moveMatch[3]) )
      }
  
      i += moveMatch[0].length + moveMatch.index
    } else {
      lookForMoves = false
    }
  }

  return game
}

export function pgnToString(pgn) {
  if (!pgn) {
    return undefined
  }

  let str = ""

  for (let tag in pgn) {
    if (tag !== "moves" && tag !== "moveOffset") {
      str += `[${tag} "${pgn[tag]}"]\n`
    }
  }

  str += "\n"

  if (pgn.moves) {
    const n = pgn.moves.length

    for (let i = 0; i < n; ) {
      const moveOffset = i + pgn.moveOffset
      const moveNumber = moveOffsetToMoveNumber(moveOffset)
      if (moveOffset % 2 === 1) { 
        // black
        str += `${moveNumber}... ${sanToString(pgn.moves[i++])}` 
      } else { 
        // white
        str += `${moveNumber}. ${sanToString(pgn.moves[i++])}`
        if (i < n) {
          str += ` ${sanToString(pgn.moves[i++])}`
        }
      }

      if (i === n) {
        // game over
        str += ` ${pgn["Result"]}`
      }
      
      str += " "
    }
  }

  return str
}
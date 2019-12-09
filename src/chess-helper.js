export const FEN_DEFAULT = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"

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
  const syntax = { 
    layout: [],
    player: "white",
    whiteKingCastle: false,
    whiteQueenCastle: false,
    blackKingCastle: false,
    blackQueenCastle: false,
    enPassant: undefined,
    halfMove: 0,
    fullMove: 1,
    capturedPieces: []
  }
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

function findEnPassantPiece(fen) {
  if (fen.enPassant) {
    const piece = findPieceByFileRank(fen.layout, fen.enPassant.file, fen.enPassant.rank === 6 ? 5 : 4)
    return piece && piece.code.toLowerCase() === "p" ? piece : undefined
  }
}

export function decodeCoordMove(fen, moveStr) {
  const fromFile = moveStr.charCodeAt(0) - 96
  const fromRank = moveStr.charCodeAt(1) - 48
  const toFile = moveStr.charCodeAt(2) - 96
  const toRank = moveStr.charCodeAt(3) - 48
  const promotion = moveStr[4]

  const movePiece = findPieceByFileRank(fen.layout, fromFile, fromRank)
  if (!movePiece) {
    throw Error(`unable to find piece for move ${moveStr}`)
  }
  const enPassantPiece = (fen.enPassant && movePiece.code.toLowerCase() === "p" && toFile === fen.enPassant.file && toRank === fen.enPassant.rank) ? findEnPassantPiece(fen) : undefined
  const capturedPiece = findPieceByFileRank(fen.layout, toFile, toRank) || enPassantPiece

  const isBlack = movePiece.code === movePiece.code.toLowerCase()
  const isCastle = (movePiece.code === "k" || movePiece.code === "K") && Math.abs(fromFile - toFile) === 2
  const kingside = toFile > fromFile
  const castle = !isCastle ? "" : ( isBlack ? (kingside ? "k" : "q") : (kingside ? "K" : "Q") )
  const promote = !promotion ? "" : ( isBlack ? promotion.toLowerCase() : promotion.toUpperCase() )

  return {
    code: movePiece.code, // k for black king, K for white king
    fromFile,
    fromRank,
    capture: !!capturedPiece,
    toFile,
    toRank,
    promote,
    castle,
    check: "", // unknown
  }
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
      promote: "",
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
  const promote = !parts[4] ? "" : isWhite ? parts[4][1].toUpperCase() : parts[4][1].toLowerCase()
  
  return parts ? {
    code: code, // one of prnbqkPRNBQK (upper case for white)
    fromFile, // may be undefined or in the range (1,8)
    fromRank, // may be undefined or in the range (1,8)
    capture: parts[2] === "x", // true or false
    toFile, // in the range (1,8)
    toRank, // in the range (1,8)
    promote, // one of rnbqRNBQ or empty (upper case for white)
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
    const promote = san.promote ? "=" + san.promote.toUpperCase() : ""
    const capture = san.capture ? "x" : ""
    if (san.castle) {
      return (san.castle.toUpperCase() === "K" ? "O-O" : "O-O-O") + san.check
    } else {
      return code + fromFile + fromRank + capture + to + promote + san.check
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

// is a move feasible for this piece, given it's current location? 
// Note, it may include illegal moves e.g. en passant without another pawn,
// moving through other pieces, moving through check for castling
// Bote, both rank and file are numbers between 1 and 8 inclusive
export function isMovePossible(piece, move) {
  const fromFile = piece.file
  const fromRank = piece.rank
  const toFile = move.toFile
  const toRank = move.toRank

  if (fromFile === toFile && fromRank === toRank) {
    return false
  }

  const isBlack = piece.code === piece.code.toLowerCase()

  switch(piece.code) {
    case "p":
    case "P":
      if (fromFile === toFile && !move.capture) {
        if (isBlack && fromRank === 7) {
          return toRank === 6 || toRank === 5
        } else if (!isBlack && fromRank === 2) {
          return toRank === 3 || toRank === 4
        } else {
          return toRank === fromRank + (isBlack ? -1 : 1)
        }
      } else if ( move.capture && (fromFile - 1 === toFile || fromFile + 1 === toFile) ) {
        return toRank === fromRank + (isBlack ? -1 : 1)
      }
      return false

    case "r":
    case "R":
      return fromFile === toFile || fromRank === toRank

    case "n":
    case "N": {
      const colDelta = Math.abs(fromFile - toFile)
      const rowDelta = Math.abs(fromRank - toRank)
      return (colDelta === 2 && rowDelta === 1) || (colDelta === 1 && rowDelta === 2)
    }

    case "b":
    case "B":
      return Math.abs(fromFile - toFile) === Math.abs(fromRank - toRank)

    case "q":
    case "Q":
      return Math.abs(fromFile - toFile) === Math.abs(fromRank - toRank) || fromFile === toFile || fromRank === toRank

    case "k":
    case "K":
      return (Math.abs(fromFile - toFile) <= 1 && Math.abs(fromRank - toRank) <= 1) || // king move
        ( !move.capture && fromFile === 5 && (fromRank === (isBlack ? 8 : 1)) && (toFile === 3 || toFile === 7) && (fromRank === toRank) ) // castle
  }
}

export function isMoveBlocked(layout, piece, move) {
  if (piece.code.toUpperCase() !== "N") {
    const fileDelta = Math.sign(move.toFile - piece.file)
    const rankDelta = Math.sign(move.toRank - piece.rank)
    let file = piece.file + fileDelta // don't check (piece.file,piece.rank)
    let rank = piece.rank + rankDelta

    while (file !== move.toFile || rank !== move.toRank) {
      if (findPieceByFileRank(layout, file, rank)) {
        return true
      }
      file += fileDelta
      rank += rankDelta
    }  
  }

  return move.capture ? false : !!findPieceByFileRank(layout, move.toFile, move.toRank) // only check (move.toFile,move.toRank) for captures
}

export function findPieceByFileRank(layout, file, rank) {
  return layout.find(piece => {
    return piece.file === file && piece.rank === rank
  })
}

export function findPieceByMove(layout, move) {
  return layout.find(piece => {
    if (piece.code === move.code) {
      if (isMovePossible(piece, move)) {
        if (!move.fromFile && !move.fromRank) {
          return !isMoveBlocked(layout, piece, move)
        } else {
          return (!move.fromFile || piece.file === move.fromFile) && (!move.fromRank || piece.rank === move.fromRank)
        }
      }
    }
  })
}

export function applyMove(fen, move) {
  const actions = []

  const piece = findPieceByMove(fen.layout, move)
  if (!piece) {
    throw Error(`unable to find piece for move`)
  }

  const isPawn = piece.code === "P" || piece.code === "p"
  const isBlack = piece.code === piece.code.toLowerCase()

  if (move.castle) {
    const kingside = move.castle.toUpperCase() === 'K'
    const rook = findPieceByFileRank(fen.layout, kingside ? 8 : 1, isBlack ? 8 : 1)
    if (!rook) {
      throw Error(`unable to find rook to castle`)
    }

    actions.push({ type: 'castle', king: piece, rook, kingside })

    piece.file = kingside ? 7 : 3
    rook.file = kingside ? 6 : 4

  } else {

    actions.push({ type: 'move', piece, fromFile: piece.file, fromRank: piece.rank, toFile: move.toFile, toRank: move.toRank } )

    if (isPawn && Math.abs(piece.rank - move.toRank) == 2) {
      fen.enPassant = { file: piece.file, rank: (piece.rank + move.toRank)/2 }
    } else {
      fen.enPassant = undefined
    }
  

    if (move.capture) {
      const capturedPiece = findPieceByFileRank(fen.layout, move.toFile, move.toRank)
      if (!capturedPiece) {
        throw Error(`unable to find piece to capture`)
      }
  
      actions.push({ type: "capture", capturedPiece, capturedIndex: fen.capturedPieces.length })
  
      fen.capturedPieces.push(capturedPiece)  
      fen.layout.splice( fen.layout.indexOf(capturedPiece), 1 )
  
    }

    // must be after the capturedPiece check
    piece.file = move.toFile
    piece.rank = move.toRank

    if (move.promote) {
      const newPiece = {code: move.promote, file: move.toFile, rank: move.toRank}
  
      actions.push({ type: "promote", piece, newPiece, file: move.toFile, rank: move.toRank, capturedIndex: fen.capturedPieces.length })

      fen.layout.splice( fen.layout.indexOf(piece), 1 )
      fen.capturedPieces.push(piece)
      fen.layout.push(newPiece)
    }

  }

  if (!isPawn && !move.capture) {
    fen.halfMove++
  } else {
    fen.halfMove = 0
  }

  if (isBlack) {
    fen.blackKingCastle = fen.blackKingCastle && piece.code !== "k" && (piece.code !== "r" || piece.file !== 8)
    fen.blackQueenCastle = fen.blackKingCastle && piece.code !== "k" && (piece.code !== "r" || piece.file !== 1)
    fen.fullMove++
  } else {
    fen.whiteKingCastle = fen.whiteKingCastle && piece.code !== "K" && (piece.code !== "R" || piece.file !== 8)
    fen.whiteQueenCastle = fen.whiteKingCastle && piece.code !== "K" && (piece.code !== "R" || piece.file !== 1)
  }

  return actions
}

const SAN_REGEX_STR = /([RNBKQ]?[a-h]?[1-8]?)(x?)([a-h][1-8])(=[RNBQ])?([\#|\+]?)/
const SAN_REGEX = new RegExp(SAN_REGEX_STR)

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

export function decodeSAN(player, san) {
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
    code = player === "white" ? c0.toUpperCase() : c0.toLowerCase()
    fileRankOffset = 1
  } else {
    code = player === "white" ? "P" : "p"
  }

  if (fileRankOffset < pieceStr.length) {
    fromFile = decodeFile(pieceStr[fileRankOffset])
    fromRank = decodeRank(pieceStr[pieceStr.length - 1]) // rank is always last, if used
    fromFile = fromFile >= 1 && fromFile <= 8 ? fromFile : undefined
    fromRank = fromRank >= 1 && fromRank <= 8 ? fromRank : undefined
  }

  const [toFile, toRank] = coordToFileRank(parts[3])
  const promotion = !parts[4] ? "" : player === "white" ? parts[4][1].toUpperCase() : parts[4][1].toLowerCase()
  
  return parts ? {
    code: code, // one of prnbqkPRNBQK (upper case for white)
    fromFile, // may be undefined or in the range (1,8)
    fromRank, // may be undefined or in the range (1,8)
    capture: parts[2] === "x", // true or false
    toFile, // in the range (1,8)
    toRank, // in the range (1,8)
    promotion, // one of rnbqRNBQ (upper case for white)
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

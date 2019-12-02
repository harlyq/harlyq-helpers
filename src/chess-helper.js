const SAN_REGEX_STR = /([RNBKQ]?[a-h]?[1-8]?)(x?)([a-h][1-8])(=[RNBQ])?([\#|\+]?)/
const SAN_REGEX = new RegExp(SAN_REGEX_STR)

// rank "a"->"h" => 1->8, file "1"->"8" -> 1->8
export function coordToFileRank(coord) {
  return coord.length === 2 ? [coord.charCodeAt(0) - 96, coord.charCodeAt(1) - 48] : undefined
}

// rank 1->8 => "a"->"h", file 1->8 -> "1"->"8"
export function fileRankToCoord(rank, file) {
  return String.fromCharCode(rank + 96, file + 48)
}

export function decodeSAN(san) {
  const parts = san.match(SAN_REGEX)
  return parts ? {
    pieceSAN: parts[1],
    capture: parts[2] === "x",
    to: parts[3],
    promotion: parts[4] ? parts[4][1] : "",
    check: parts[5],
  } : undefined
}

// is a move feasible for this piece, given it's current location? 
// Note, it may include illegal moves e.g. en passant without another pawn,
// or moving through other pieces
// Bote, both rank and file are numbers between 1 and 8 inclusive
export function isMovePossible(code, pieceFile, pieceRank, toFile, toRank) {
  if (pieceFile === toFile && pieceRank === toRank) {
    return false
  }

  switch(code) {
    case "p":
    case "P":
      const isBlack = code === code.toLowerCase()
      if (pieceFile === toFile) {
        if (isBlack && pieceRank === 7) {
          return toRank === 6 || toRank === 5
        } else if (!isBlack && pieceRank === 2) {
          return toRank === 3 || toRank === 4
        } else {
          return toRank === pieceRank + (isBlack ? -1 : 1)
        }
      } else if (pieceFile - 1 === toFile || pieceFile + 1 === toFile) {
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

import test from "tape"
import * as chessHelper from "../src/chess-helper.js"

test("chessHelper.coordToFileRank", (t) => {
  t.deepEquals(chessHelper.coordToFileRank(""), undefined, "empty")
  t.deepEquals(chessHelper.coordToFileRank("a1"), [1,1], "a1")
  t.deepEquals(chessHelper.coordToFileRank("b1"), [2,1], "b1")
  t.deepEquals(chessHelper.coordToFileRank("a2"), [1,2], "a2")
  t.deepEquals(chessHelper.coordToFileRank("a8"), [1,8], "a8")
  t.deepEquals(chessHelper.coordToFileRank("h1"), [8,1], "h1")
  t.deepEquals(chessHelper.coordToFileRank("e5"), [5,5], "e5")

  t.end()
})

test("chessHelper.fileRankToCoord", (t) => {
  t.deepEquals(chessHelper.fileRankToCoord(1,1), "a1", "a1")
  t.deepEquals(chessHelper.fileRankToCoord(2,1), "b1", "b1")
  t.deepEquals(chessHelper.fileRankToCoord(1,2), "a2", "a2")
  t.deepEquals(chessHelper.fileRankToCoord(1,8), "a8", "a8")
  t.deepEquals(chessHelper.fileRankToCoord(8,1), "h1", "h1")
  t.deepEquals(chessHelper.fileRankToCoord(5,5), "e5", "e5")

  t.end()
})

test("chessHelper.decodeSAN", (t) => {
  t.deepEquals(chessHelper.decodeSAN("white", ""), undefined, "empty")
  t.deepEquals(chessHelper.decodeSAN("white", "e4"), {code:"P", fromFile: undefined, fromRank: undefined, capture: false, toFile: 5, toRank: 4, promotion: "", check: ""}, "e4")
  t.deepEquals(chessHelper.decodeSAN("black", "Nf3"), {code:"n", fromFile: undefined, fromRank: undefined, capture: false, toFile: 6, toRank: 3, promotion: "", check: ""}, "Nf3")
  t.deepEquals(chessHelper.decodeSAN("black", "Re1"), {code:"r", fromFile: undefined, fromRank: undefined, capture: false, toFile: 5, toRank: 1, promotion: "", check: ""}, "Re1")
  t.deepEquals(chessHelper.decodeSAN("white", "cxb5"), {code:"P", fromFile: 3, fromRank: undefined, capture: true, toFile: 2, toRank: 5, promotion: "", check: ""}, "cxb5")
  t.deepEquals(chessHelper.decodeSAN("white", "Bxe7"), {code:"B", fromFile: undefined, fromRank: undefined, capture: true, toFile: 5, toRank: 7, promotion: "", check: ""}, "Bxe7")
  t.deepEquals(chessHelper.decodeSAN("black", "Rxe1+"), {code:"r", fromFile: undefined, fromRank: undefined, capture: true, toFile: 5, toRank: 1, promotion: "", check: "+"}, "Rxe1+")
  t.deepEquals(chessHelper.decodeSAN("white", "Qxg5"), {code:"Q", fromFile: undefined, fromRank: undefined, capture: true, toFile: 7, toRank: 5, promotion: "", check: ""}, "Qxg5")
  t.deepEquals(chessHelper.decodeSAN("black", "Ra6+"), {code:"r", fromFile: undefined, fromRank: undefined, capture: false, toFile: 1, toRank: 6, promotion: "", check: "+"}, "Ra6+")
  t.deepEquals(chessHelper.decodeSAN("black", "Rda6+"), {code:"r", fromFile: 4, fromRank: undefined, capture: false, toFile: 1, toRank: 6, promotion: "", check: "+"}, "Rda6+")
  t.deepEquals(chessHelper.decodeSAN("white", "fxe8=Q+"), {code:"P", fromFile: 6, fromRank: undefined, capture: true, toFile: 5, toRank: 8, promotion: "Q", check: "+"}, "fxe8=Q+")
  t.deepEquals(chessHelper.decodeSAN("black", "axb1=Q+"), {code:"p", fromFile: 1, fromRank: undefined, capture: true, toFile: 2, toRank: 1, promotion: "q", check: "+"}, "axb1=Q+")

  t.end()
})

test("chessHelper.isMovePossible", (t) => {
  t.equals(chessHelper.isMovePossible("P", 2, 2, 2, 2, false), false, "pawn no move")
  t.equals(chessHelper.isMovePossible("k", 2, 2, 2, 2, false), false, "king no move")
  t.equals(chessHelper.isMovePossible("P", 3, 2, 3, 3, false), true, "white pawn 1")
  t.equals(chessHelper.isMovePossible("P", 3, 2, 3, 4, false), true, "white pawn 2, first move")
  t.equals(chessHelper.isMovePossible("P", 3, 3, 3, 5, false), false, "white pawn 2, not first move")
  t.equals(chessHelper.isMovePossible("P", 3, 2, 3, 5, false), false, "white pawn 3")
  t.equals(chessHelper.isMovePossible("P", 4, 2, 5, 3, true), true, "white pawn capture e")
  t.equals(chessHelper.isMovePossible("P", 4, 3, 3, 4, true), true, "white pawn capture w")
  t.equals(chessHelper.isMovePossible("P", 5, 7, 6, 8, true), true, "white pawn capture last row")
  t.equals(chessHelper.isMovePossible("P", 5, 2, 5, 1, false), false, "white pawn backwards")
  t.equals(chessHelper.isMovePossible("P", 5, 2, 1, 1, false), false, "white pawn teleport")
  t.equals(chessHelper.isMovePossible("p", 3, 7, 3, 6, false), true, "black pawn 1")
  t.equals(chessHelper.isMovePossible("p", 3, 7, 3, 5, false), true, "black pawn 2, first move")
  t.equals(chessHelper.isMovePossible("p", 3, 6, 3, 4, false), false, "black pawn 2, not first move")
  t.equals(chessHelper.isMovePossible("p", 3, 7, 3, 4, false), false, "black pawn 3")
  t.equals(chessHelper.isMovePossible("p", 4, 7, 5, 6, true), true, "black pawn capture e")
  t.equals(chessHelper.isMovePossible("p", 4, 7, 3, 6, true), true, "black pawn capture w")
  t.equals(chessHelper.isMovePossible("p", 5, 2, 6, 1, true), true, "black pawn capture last row")
  t.equals(chessHelper.isMovePossible("p", 5, 2, 5, 3, false), false, "black pawn backwards")
  t.equals(chessHelper.isMovePossible("P", 5, 2, 1, 1, false), false, "black pawn teleport")
  t.equals(chessHelper.isMovePossible("r", 5, 3, 5, 1, false), true, "rook long s")
  t.equals(chessHelper.isMovePossible("R", 5, 3, 5, 8, false), true, "rook long n")
  t.equals(chessHelper.isMovePossible("r", 5, 6, 1, 6, false), true, "rook long w")
  t.equals(chessHelper.isMovePossible("R", 5, 1, 8, 1, false), true, "rook long e")
  t.equals(chessHelper.isMovePossible("R", 5, 3, 8, 6, false), false, "rook long ne")
  t.equals(chessHelper.isMovePossible("R", 5, 3, 7, 1, false), false, "rook long se")
  t.equals(chessHelper.isMovePossible("r", 5, 6, 3, 8, false), false, "rook long nw")
  t.equals(chessHelper.isMovePossible("r", 5, 6, 2, 3, false), false, "rook long sw")
  t.equals(chessHelper.isMovePossible("B", 5, 1, 7, 2, false), false, "rook L")
  t.equals(chessHelper.isMovePossible("b", 5, 3, 8, 6, false), true, "bishop long ne")
  t.equals(chessHelper.isMovePossible("b", 5, 3, 7, 1, false), true, "bishop long se")
  t.equals(chessHelper.isMovePossible("B", 5, 6, 3, 8, false), true, "bishop long nw")
  t.equals(chessHelper.isMovePossible("B", 5, 6, 2, 3, false), true, "bishop long sw")
  t.equals(chessHelper.isMovePossible("b", 5, 3, 5, 1, false), false, "bishop long s")
  t.equals(chessHelper.isMovePossible("B", 5, 3, 5, 8, false), false, "bishop long n")
  t.equals(chessHelper.isMovePossible("b", 5, 6, 1, 6, false), false, "bishop long w")
  t.equals(chessHelper.isMovePossible("B", 5, 1, 8, 1, false), false, "bishop long e")
  t.equals(chessHelper.isMovePossible("B", 5, 1, 7, 2, false), false, "bishop L")
  t.equals(chessHelper.isMovePossible("q", 5, 3, 8, 6, false), true, "queen long ne")
  t.equals(chessHelper.isMovePossible("q", 5, 3, 7, 1, false), true, "queen long se")
  t.equals(chessHelper.isMovePossible("q", 5, 6, 3, 8, false), true, "queen long nw")
  t.equals(chessHelper.isMovePossible("Q", 5, 6, 2, 3, false), true, "queen long sw")
  t.equals(chessHelper.isMovePossible("Q", 5, 3, 5, 1, false), true, "queen long s")
  t.equals(chessHelper.isMovePossible("Q", 5, 3, 5, 8, false), true, "queen long n")
  t.equals(chessHelper.isMovePossible("q", 5, 6, 1, 6, false), true, "queen long w")
  t.equals(chessHelper.isMovePossible("q", 5, 1, 8, 1, false), true, "queen long e")
  t.equals(chessHelper.isMovePossible("q", 5, 1, 7, 2, false), false, "queen L")
  t.equals(chessHelper.isMovePossible("K", 5, 3, 6, 4, false), true, "king ne")
  t.equals(chessHelper.isMovePossible("k", 5, 3, 6, 2, false), true, "king se")
  t.equals(chessHelper.isMovePossible("K", 5, 6, 4, 7, false), true, "king nw")
  t.equals(chessHelper.isMovePossible("k", 5, 6, 4, 5, false), true, "king sw")
  t.equals(chessHelper.isMovePossible("K", 5, 3, 5, 2, false), true, "king s")
  t.equals(chessHelper.isMovePossible("k", 5, 3, 5, 4, false), true, "king n")
  t.equals(chessHelper.isMovePossible("K", 5, 6, 4, 6, false), true, "king w")
  t.equals(chessHelper.isMovePossible("k", 5, 1, 6, 1, false), true, "king e")
  t.equals(chessHelper.isMovePossible("K", 5, 3, 8, 6, false), false, "king long ne")
  t.equals(chessHelper.isMovePossible("k", 5, 3, 7, 1, false), false, "king long se")
  t.equals(chessHelper.isMovePossible("K", 5, 6, 3, 8, false), false, "king long nw")
  t.equals(chessHelper.isMovePossible("k", 5, 6, 2, 3, false), false, "king long sw")
  t.equals(chessHelper.isMovePossible("K", 5, 3, 5, 1, false), false, "king long s")
  t.equals(chessHelper.isMovePossible("k", 5, 3, 5, 8, false), false, "king long n")
  t.equals(chessHelper.isMovePossible("K", 5, 6, 1, 6, false), false, "king long w")
  t.equals(chessHelper.isMovePossible("k", 5, 1, 5, 8, false), false, "king long e")
  t.equals(chessHelper.isMovePossible("N", 3, 4, 4, 6, false), true, "knight L ne")
  t.equals(chessHelper.isMovePossible("N", 3, 4, 2, 6, false), true, "knight L nw")
  t.equals(chessHelper.isMovePossible("n", 3, 4, 5, 5, false), true, "knight L en")
  t.equals(chessHelper.isMovePossible("n", 3, 4, 5, 3, false), true, "knight L es")
  t.equals(chessHelper.isMovePossible("n", 3, 4, 4, 2, false), true, "knight L se")
  t.equals(chessHelper.isMovePossible("n", 3, 4, 2, 2, false), true, "knight L sw")
  t.equals(chessHelper.isMovePossible("N", 3, 4, 1, 5, false), true, "knight L wn")
  t.equals(chessHelper.isMovePossible("N", 3, 4, 1, 3, false), true, "knight L ws")
  t.equals(chessHelper.isMovePossible("n", 5, 3, 8, 6, false), false, "knight long ne")
  t.equals(chessHelper.isMovePossible("N", 5, 3, 7, 1, false), false, "knight long se")
  t.equals(chessHelper.isMovePossible("N", 5, 6, 3, 8, false), false, "knight long nw")
  t.equals(chessHelper.isMovePossible("n", 5, 6, 2, 3, false), false, "knight long sw")
  t.equals(chessHelper.isMovePossible("n", 5, 3, 5, 1, false), false, "knight long s")
  t.equals(chessHelper.isMovePossible("n", 5, 3, 5, 8, false), false, "knight long n")
  t.equals(chessHelper.isMovePossible("n", 5, 6, 1, 6, false), false, "knight long w")
  t.equals(chessHelper.isMovePossible("N", 5, 1, 8, 1, false), false, "knight long e")
  t.equals(chessHelper.isMovePossible("N", 5, 1, 6, 2, false), false, "knight ne")

  t.end()
})

test("chessHelper.parseFEN", (t) => {
  try {
    t.deepEquals(chessHelper.parseFEN(""), [], "empty string")
  } catch {
    t.pass("empty string")
  }

  try {
    t.deepEquals(chessHelper.parseFEN("blah"), [], "invalid")
  } catch {
    t.pass("invalid")
  }

  t.deepEquals(chessHelper.parseFEN("8/8/8/8/8/8/8/8 w - - 0 1"), {
    moves: [],
    player: "white",
    whiteKingCastle: false,
    whiteQueenCastle: false,
    blackKingCastle: false,
    blackQueenCastle: false,
    enPassant: undefined,
    halfMove: 0,
    fullMove: 1
  }, "empty board")

  t.deepEquals(chessHelper.parseFEN("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"), {
    moves: [
      {code:"r",file:1,rank:8},
      {code:"n",file:2,rank:8},
      {code:"b",file:3,rank:8},
      {code:"q",file:4,rank:8},
      {code:"k",file:5,rank:8},
      {code:"b",file:6,rank:8},
      {code:"n",file:7,rank:8},
      {code:"r",file:8,rank:8},
      {code:"p",file:1,rank:7},
      {code:"p",file:2,rank:7},
      {code:"p",file:3,rank:7},
      {code:"p",file:4,rank:7},
      {code:"p",file:5,rank:7},
      {code:"p",file:6,rank:7},
      {code:"p",file:7,rank:7},
      {code:"p",file:8,rank:7},
      {code:"P",file:1,rank:2},
      {code:"P",file:2,rank:2},
      {code:"P",file:3,rank:2},
      {code:"P",file:4,rank:2},
      {code:"P",file:5,rank:2},
      {code:"P",file:6,rank:2},
      {code:"P",file:7,rank:2},
      {code:"P",file:8,rank:2},
      {code:"R",file:1,rank:1},
      {code:"N",file:2,rank:1},
      {code:"B",file:3,rank:1},
      {code:"Q",file:4,rank:1},
      {code:"K",file:5,rank:1},
      {code:"B",file:6,rank:1},
      {code:"N",file:7,rank:1},
      {code:"R",file:8,rank:1},
    ],
    player: "white",
    whiteKingCastle: true,
    whiteQueenCastle: true,
    blackKingCastle: true,
    blackQueenCastle: true,
    enPassant: undefined,
    halfMove: 0,
    fullMove: 1
  }, "standard")

  t.deepEquals(chessHelper.parseFEN("rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1"), {
    moves: [
      {code:"r",file:1,rank:8},
      {code:"n",file:2,rank:8},
      {code:"b",file:3,rank:8},
      {code:"q",file:4,rank:8},
      {code:"k",file:5,rank:8},
      {code:"b",file:6,rank:8},
      {code:"n",file:7,rank:8},
      {code:"r",file:8,rank:8},
      {code:"p",file:1,rank:7},
      {code:"p",file:2,rank:7},
      {code:"p",file:3,rank:7},
      {code:"p",file:4,rank:7},
      {code:"p",file:5,rank:7},
      {code:"p",file:6,rank:7},
      {code:"p",file:7,rank:7},
      {code:"p",file:8,rank:7},
      {code:"P",file:5,rank:4},
      {code:"P",file:1,rank:2},
      {code:"P",file:2,rank:2},
      {code:"P",file:3,rank:2},
      {code:"P",file:4,rank:2},
      {code:"P",file:6,rank:2},
      {code:"P",file:7,rank:2},
      {code:"P",file:8,rank:2},
      {code:"R",file:1,rank:1},
      {code:"N",file:2,rank:1},
      {code:"B",file:3,rank:1},
      {code:"Q",file:4,rank:1},
      {code:"K",file:5,rank:1},
      {code:"B",file:6,rank:1},
      {code:"N",file:7,rank:1},
      {code:"R",file:8,rank:1},
    ],
    player: "black",
    whiteKingCastle: true,
    whiteQueenCastle: true,
    blackKingCastle: true,
    blackQueenCastle: true,
    enPassant: {file: 5, rank: 3},
    halfMove: 0,
    fullMove: 1
  }, "e4 opening")

  t.deepEquals(chessHelper.parseFEN("5k2/pp4pp/3bpp2/8/1P6/P2KP3/5PPP/2B5 w - - 0 29"), {
    moves: [
      {code:"k",file:6,rank:8},
      {code:"p",file:1,rank:7},
      {code:"p",file:2,rank:7},
      {code:"p",file:7,rank:7},
      {code:"p",file:8,rank:7},
      {code:"b",file:4,rank:6},
      {code:"p",file:5,rank:6},
      {code:"p",file:6,rank:6},
      {code:"P",file:2,rank:4},
      {code:"P",file:1,rank:3},
      {code:"K",file:4,rank:3},
      {code:"P",file:5,rank:3},
      {code:"P",file:6,rank:2},
      {code:"P",file:7,rank:2},
      {code:"P",file:8,rank:2},
      {code:"B",file:3,rank:1},
    ],
    player: "white",
    whiteKingCastle: false,
    whiteQueenCastle: false,
    blackKingCastle: false,
    blackQueenCastle: false,
    enPassant: undefined,
    halfMove: 0,
    fullMove: 29
  }, "partial")

  t.end()
})

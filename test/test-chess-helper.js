import test from "tape"
import * as chessHelper from "../src/chess-helper.js"

const PGN1 = `
[Event "F/S Return Match"]
[Site "Belgrade, Serbia JUG"]
[Date "1992.11.04"]
[Round "29"]
[White "Fischer, Robert J."]
[Black "Spassky, Boris V."]
[Result "1/2-1/2"]

1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 {This opening is called the Ruy Lopez.}
4. Ba4 Nf6 5. O-O Be7 6. Re1 b5 7. Bb3 d6 8. c3 O-O 9. h3 Nb8 10. d4 Nbd7
11. c4 c6 12. cxb5 axb5 13. Nc3 Bb7 14. Bg5 b4 15. Nb1 h6 16. Bh4 c5 17. dxe5
Nxe4 18. Bxe7 Qxe7 19. exd6 Qf6 20. Nbd2 Nxd6 21. Nc4 Nxc4 22. Bxc4 Nb6
23. Ne5 Rae8 24. Bxf7+ Rxf7 25. Nxf7 Rxe1+ 26. Qxe1 Kxf7 27. Qe3 Qg5 28. Qxg5
hxg5 29. b3 Ke6 30. a3 Kd6 31. axb4 cxb4 32. Ra5 Nd5 33. f3 Bc8 34. Kf2 Bf5
35. Ra7 g6 36. Ra6+ Kc5 37. Ke1 Nf4 38. g3 Nxh3 39. Kd2 Kb5 40. Rd6 Kc5 41. Ra6
Nf2 42. g4 Bd3 43. Re6 1/2-1/2  
`
const PGN_PARTIAL = `
[Event "TCh-CHN 2012"]
[Site "Taizhou CHN"]
[Date "2012.06.29"]
[Round "7"]
[White "Zhai Mo"]
[Black "Guo Qi"]
[Result "1-0"]
[WhiteElo "2262"]
[BlackElo "2351"]
[WhiteTitle "WFM"]
[BlackTitle "WGM"]
[ECO "B19"]
[Opening "Caro-Kann"]
[Variation "classical, Spassky variation"]
[WhiteTeam "Hebei"]
[BlackTeam "Jiangsu"]
[WhiteFideId "8600201"]
[BlackFideId "8604002"]
[EventDate "2012.04.28"]
[FEN "2r2rk1/pp1n1pp1/1q3b1p/2pp2PP/2P5/Q4N2/PP1B1P2/1K1R3R b - - 0 20 "]

20...hxg5 21. h6 g4 22. hxg7 Bxg7 23. cxd5 Qa6 24. Qxa6 bxa6 25. Nh4 Rb8 26. Bc1 f5 27. Rde1 c4 28. Ng6 Rf6 29. Ne7+ Kf8 30. Ng6+ Kg8 31. Ne7+ Kf8 32. Nc6 Rb5 33. Bg5 c3 34. b3 Rxd5 35. Bxf6 Nxf6 36. Ne7 Rc5 37. Ng6+ Kf7 38. Ne5+ Kg8 39. Nd3 Rd5 40. Ne5 Rc5 41. Nd3 Rd5 42. Kc2 Ne4 43. Re2 Ng5 44. Nf4 Ra5 45. a4 Nf3 46. Re8+ Kf7 47. Ra8 Nd4+ 48. Kxc3 Nc6+ 49. Kd2 Kf6 50. Nh5+ Kg6 51. Rg8 Rd5+ 52. Ke3 Re5+ 53. Kf4 Re4+ 54. Kg3 Re7 55. Rxg7+ Rxg7 56. Nxg7 Kxg7 57. Rc1 Nd4 58. Rc7+ Kg6 59. Rxa7 Kg5 60. Rxa6 f4+ 61. Kg2 f3+ 62. Kf1 Nxb3 63. Ra8 Nd2+ 64. Kg1 Ne4 65. a5 g3 66. fxg3 Kg4 67. a6 Kxg3 68. Rg8+  1-0
`

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
  t.deepEquals(chessHelper.decodeSAN("white", "e4"), {code:"P", fromFile: undefined, fromRank: undefined, capture: false, toFile: 5, toRank: 4, promote: "", castle: "", check: ""}, "e4")
  t.deepEquals(chessHelper.decodeSAN("black", "Nf3"), {code:"n", fromFile: undefined, fromRank: undefined, capture: false, toFile: 6, toRank: 3, promote: "", castle: "", check: ""}, "Nf3")
  t.deepEquals(chessHelper.decodeSAN("black", "Re1"), {code:"r", fromFile: undefined, fromRank: undefined, capture: false, toFile: 5, toRank: 1, promote: "", castle: "", check: ""}, "Re1")
  t.deepEquals(chessHelper.decodeSAN("white", "cxb5"), {code:"P", fromFile: 3, fromRank: undefined, capture: true, toFile: 2, toRank: 5, promote: "", castle: "", check: ""}, "cxb5")
  t.deepEquals(chessHelper.decodeSAN("white", "Bxe7"), {code:"B", fromFile: undefined, fromRank: undefined, capture: true, toFile: 5, toRank: 7, promote: "", castle: "", check: ""}, "Bxe7")
  t.deepEquals(chessHelper.decodeSAN("black", "Rxe1+"), {code:"r", fromFile: undefined, fromRank: undefined, capture: true, toFile: 5, toRank: 1, promote: "", castle: "", check: "+"}, "Rxe1+")
  t.deepEquals(chessHelper.decodeSAN("white", "Qxg5"), {code:"Q", fromFile: undefined, fromRank: undefined, capture: true, toFile: 7, toRank: 5, promote: "", castle: "", check: ""}, "Qxg5")
  t.deepEquals(chessHelper.decodeSAN("black", "Ra6+"), {code:"r", fromFile: undefined, fromRank: undefined, capture: false, toFile: 1, toRank: 6, promote: "", castle: "", check: "+"}, "Ra6+")
  t.deepEquals(chessHelper.decodeSAN("black", "Rda6+"), {code:"r", fromFile: 4, fromRank: undefined, capture: false, toFile: 1, toRank: 6, promote: "", castle: "", check: "+"}, "Rda6+")
  t.deepEquals(chessHelper.decodeSAN("white", "fxe8=Q+"), {code:"P", fromFile: 6, fromRank: undefined, capture: true, toFile: 5, toRank: 8, promote: "Q", castle: "", check: "+"}, "fxe8=Q+")
  t.deepEquals(chessHelper.decodeSAN("black", "axb1=Q+"), {code:"p", fromFile: 1, fromRank: undefined, capture: true, toFile: 2, toRank: 1, promote: "q", castle: "", check: "+"}, "axb1=Q+")
  t.deepEquals(chessHelper.decodeSAN("black", "O-O"), {code:"k", fromFile: undefined, fromRank: undefined, capture: false, toFile: 7, toRank: 8, promote: "", castle: "k", check: ""}, "O-O")
  t.deepEquals(chessHelper.decodeSAN("black", "O-O-O#"), {code:"k", fromFile: undefined, fromRank: undefined, capture: false, toFile: 3, toRank: 8, promote: "", castle: "q", check: "#"}, "O-O-O#")
  t.deepEquals(chessHelper.decodeSAN("white", "O-O+"), {code:"K", fromFile: undefined, fromRank: undefined, capture: false, toFile: 7, toRank: 1, promote: "", castle: "K", check: "+"}, "O-O+")
  t.deepEquals(chessHelper.decodeSAN("white", "O-O-O"), {code:"K", fromFile: undefined, fromRank: undefined, capture: false, toFile: 3, toRank: 1, promote: "", castle: "Q", check: ""}, "O-O-O")

  t.end()
})

test("chessHelper.sanToString", (t) => {
  t.equals(chessHelper.sanToString( chessHelper.decodeSAN("white", "e3") ), "e3", "e3")
  t.equals(chessHelper.sanToString( chessHelper.decodeSAN("black", "Re2") ), "Re2", "Re2")
  t.equals(chessHelper.sanToString( chessHelper.decodeSAN("black", "fxe8=Q+") ), "fxe8=Q+", "fxe8=Q+")
  t.equals(chessHelper.sanToString( chessHelper.decodeSAN("white", "O-O-O#") ), "O-O-O#", "O-O-O#")
  t.equals(chessHelper.sanToString( chessHelper.decodeSAN("black", "O-O") ), "O-O", "O-O")
  t.equals(chessHelper.sanToString( chessHelper.decodeSAN("white", "cxb5") ), "cxb5", "cxb5")

  t.end()
})


test("chessHelper.isMovePossible", (t) => {
  const simplePiece = (code, file, rank) => ( {code, file, rank} )
  const simpleMove = (toFile, toRank, capture) => ( {code: "", fromFile: undefined, fromRank: undefined, capture, toFile, toRank, promote: "", castle: "", check: ""} )

  t.equals(chessHelper.isMovePossible( simplePiece("P", 2, 2), simpleMove(2, 2, false) ), false, "pawn no move")
  t.equals(chessHelper.isMovePossible( simplePiece("k", 2, 2), simpleMove(2, 2, false) ), false, "king no move")
  t.equals(chessHelper.isMovePossible( simplePiece("P", 3, 2), simpleMove(3, 3, false) ), true, "white pawn 1")
  t.equals(chessHelper.isMovePossible( simplePiece("P", 3, 2), simpleMove(3, 4, false) ), true, "white pawn 2, first move")
  t.equals(chessHelper.isMovePossible( simplePiece("P", 3, 3), simpleMove(3, 5, false) ), false, "white pawn 2, not first move")
  t.equals(chessHelper.isMovePossible( simplePiece("P", 3, 2), simpleMove(3, 5, false) ), false, "white pawn 3")
  t.equals(chessHelper.isMovePossible( simplePiece("P", 4, 2), simpleMove(5, 3, true) ), true, "white pawn capture e")
  t.equals(chessHelper.isMovePossible( simplePiece("P", 4, 3), simpleMove(3, 4, true) ), true, "white pawn capture w")
  t.equals(chessHelper.isMovePossible( simplePiece("P", 5, 7), simpleMove(6, 8, true) ), true, "white pawn capture last row")
  t.equals(chessHelper.isMovePossible( simplePiece("P", 5, 2), simpleMove(5, 1, false) ), false, "white pawn backwards")
  t.equals(chessHelper.isMovePossible( simplePiece("P", 5, 2), simpleMove(1, 1, false) ), false, "white pawn teleport")
  t.equals(chessHelper.isMovePossible( simplePiece("p", 3, 7), simpleMove(3, 6, false) ), true, "black pawn 1")
  t.equals(chessHelper.isMovePossible( simplePiece("p", 3, 7), simpleMove(3, 5, false) ), true, "black pawn 2, first move")
  t.equals(chessHelper.isMovePossible( simplePiece("p", 3, 6), simpleMove(3, 4, false) ), false, "black pawn 2, not first move")
  t.equals(chessHelper.isMovePossible( simplePiece("p", 3, 7), simpleMove(3, 4, false) ), false, "black pawn 3")
  t.equals(chessHelper.isMovePossible( simplePiece("p", 4, 7), simpleMove(5, 6, true) ), true, "black pawn capture e")
  t.equals(chessHelper.isMovePossible( simplePiece("p", 4, 7), simpleMove(3, 6, true) ), true, "black pawn capture w")
  t.equals(chessHelper.isMovePossible( simplePiece("p", 5, 2), simpleMove(6, 1, true) ), true, "black pawn capture last row")
  t.equals(chessHelper.isMovePossible( simplePiece("p", 5, 2), simpleMove(5, 3, false) ), false, "black pawn backwards")
  t.equals(chessHelper.isMovePossible( simplePiece("P", 5, 2), simpleMove(1, 1, false) ), false, "black pawn teleport")
  t.equals(chessHelper.isMovePossible( simplePiece("r", 5, 3), simpleMove(5, 1, false) ), true, "rook long s")
  t.equals(chessHelper.isMovePossible( simplePiece("R", 5, 3), simpleMove(5, 8, false) ), true, "rook long n")
  t.equals(chessHelper.isMovePossible( simplePiece("r", 5, 6), simpleMove(1, 6, false) ), true, "rook long w")
  t.equals(chessHelper.isMovePossible( simplePiece("R", 5, 1), simpleMove(8, 1, false) ), true, "rook long e")
  t.equals(chessHelper.isMovePossible( simplePiece("R", 5, 3), simpleMove(8, 6, false) ), false, "rook long ne")
  t.equals(chessHelper.isMovePossible( simplePiece("R", 5, 3), simpleMove(7, 1, false) ), false, "rook long se")
  t.equals(chessHelper.isMovePossible( simplePiece("r", 5, 6), simpleMove(3, 8, false) ), false, "rook long nw")
  t.equals(chessHelper.isMovePossible( simplePiece("r", 5, 6), simpleMove(2, 3, false) ), false, "rook long sw")
  t.equals(chessHelper.isMovePossible( simplePiece("B", 5, 1), simpleMove(7, 2, false) ), false, "rook L")
  t.equals(chessHelper.isMovePossible( simplePiece("b", 5, 3), simpleMove(8, 6, false) ), true, "bishop long ne")
  t.equals(chessHelper.isMovePossible( simplePiece("b", 5, 3), simpleMove(7, 1, false) ), true, "bishop long se")
  t.equals(chessHelper.isMovePossible( simplePiece("B", 5, 6), simpleMove(3, 8, false) ), true, "bishop long nw")
  t.equals(chessHelper.isMovePossible( simplePiece("B", 5, 6), simpleMove(2, 3, false) ), true, "bishop long sw")
  t.equals(chessHelper.isMovePossible( simplePiece("b", 5, 3), simpleMove(5, 1, false) ), false, "bishop long s")
  t.equals(chessHelper.isMovePossible( simplePiece("B", 5, 3), simpleMove(5, 8, false) ), false, "bishop long n")
  t.equals(chessHelper.isMovePossible( simplePiece("b", 5, 6), simpleMove(1, 6, false) ), false, "bishop long w")
  t.equals(chessHelper.isMovePossible( simplePiece("B", 5, 1), simpleMove(8, 1, false) ), false, "bishop long e")
  t.equals(chessHelper.isMovePossible( simplePiece("B", 5, 1), simpleMove(7, 2, false) ), false, "bishop L")
  t.equals(chessHelper.isMovePossible( simplePiece("q", 5, 3), simpleMove(8, 6, false) ), true, "queen long ne")
  t.equals(chessHelper.isMovePossible( simplePiece("q", 5, 3), simpleMove(7, 1, false) ), true, "queen long se")
  t.equals(chessHelper.isMovePossible( simplePiece("q", 5, 6), simpleMove(3, 8, false) ), true, "queen long nw")
  t.equals(chessHelper.isMovePossible( simplePiece("Q", 5, 6), simpleMove(2, 3, false) ), true, "queen long sw")
  t.equals(chessHelper.isMovePossible( simplePiece("Q", 5, 3), simpleMove(5, 1, false) ), true, "queen long s")
  t.equals(chessHelper.isMovePossible( simplePiece("Q", 5, 3), simpleMove(5, 8, false) ), true, "queen long n")
  t.equals(chessHelper.isMovePossible( simplePiece("q", 5, 6), simpleMove(1, 6, false) ), true, "queen long w")
  t.equals(chessHelper.isMovePossible( simplePiece("q", 5, 1), simpleMove(8, 1, false) ), true, "queen long e")
  t.equals(chessHelper.isMovePossible( simplePiece("q", 5, 1), simpleMove(7, 2, false) ), false, "queen L")
  t.equals(chessHelper.isMovePossible( simplePiece("K", 5, 3), simpleMove(6, 4, false) ), true, "king ne")
  t.equals(chessHelper.isMovePossible( simplePiece("k", 5, 3), simpleMove(6, 2, false) ), true, "king se")
  t.equals(chessHelper.isMovePossible( simplePiece("K", 5, 6), simpleMove(4, 7, false) ), true, "king nw")
  t.equals(chessHelper.isMovePossible( simplePiece("k", 5, 6), simpleMove(4, 5, false) ), true, "king sw")
  t.equals(chessHelper.isMovePossible( simplePiece("K", 5, 3), simpleMove(5, 2, false) ), true, "king s")
  t.equals(chessHelper.isMovePossible( simplePiece("k", 5, 3), simpleMove(5, 4, false) ), true, "king n")
  t.equals(chessHelper.isMovePossible( simplePiece("K", 5, 6), simpleMove(4, 6, false) ), true, "king w")
  t.equals(chessHelper.isMovePossible( simplePiece("k", 5, 1), simpleMove(6, 1, false) ), true, "king e")
  t.equals(chessHelper.isMovePossible( simplePiece("K", 5, 3), simpleMove(8, 6, false) ), false, "king long ne")
  t.equals(chessHelper.isMovePossible( simplePiece("k", 5, 3), simpleMove(7, 1, false) ), false, "king long se")
  t.equals(chessHelper.isMovePossible( simplePiece("K", 5, 6), simpleMove(3, 8, false) ), false, "king long nw")
  t.equals(chessHelper.isMovePossible( simplePiece("k", 5, 6), simpleMove(2, 3, false) ), false, "king long sw")
  t.equals(chessHelper.isMovePossible( simplePiece("K", 5, 3), simpleMove(5, 1, false) ), false, "king long s")
  t.equals(chessHelper.isMovePossible( simplePiece("k", 5, 3), simpleMove(5, 8, false) ), false, "king long n")
  t.equals(chessHelper.isMovePossible( simplePiece("K", 5, 6), simpleMove(1, 6, false) ), false, "king long w")
  t.equals(chessHelper.isMovePossible( simplePiece("k", 5, 1), simpleMove(5, 8, false) ), false, "king long e")
  t.equals(chessHelper.isMovePossible( simplePiece("k", 5, 8), simpleMove(3, 8, false) ), true, "black kingside castle")
  t.equals(chessHelper.isMovePossible( simplePiece("k", 5, 8), simpleMove(7, 8, false) ), true, "black queenside castle")
  t.equals(chessHelper.isMovePossible( simplePiece("K", 5, 1), simpleMove(3, 1, false) ), true, "white kingside castle")
  t.equals(chessHelper.isMovePossible( simplePiece("K", 5, 1), simpleMove(7, 1, false) ), true, "white queenside castle")
  t.equals(chessHelper.isMovePossible( simplePiece("k", 5, 8), simpleMove(7, 7, false) ), false, "king teleport")
  t.equals(chessHelper.isMovePossible( simplePiece("N", 3, 4), simpleMove(4, 6, false) ), true, "knight L ne")
  t.equals(chessHelper.isMovePossible( simplePiece("N", 3, 4), simpleMove(2, 6, false) ), true, "knight L nw")
  t.equals(chessHelper.isMovePossible( simplePiece("n", 3, 4), simpleMove(5, 5, false) ), true, "knight L en")
  t.equals(chessHelper.isMovePossible( simplePiece("n", 3, 4), simpleMove(5, 3, false) ), true, "knight L es")
  t.equals(chessHelper.isMovePossible( simplePiece("n", 3, 4), simpleMove(4, 2, false) ), true, "knight L se")
  t.equals(chessHelper.isMovePossible( simplePiece("n", 3, 4), simpleMove(2, 2, false) ), true, "knight L sw")
  t.equals(chessHelper.isMovePossible( simplePiece("N", 3, 4), simpleMove(1, 5, false) ), true, "knight L wn")
  t.equals(chessHelper.isMovePossible( simplePiece("N", 3, 4), simpleMove(1, 3, false) ), true, "knight L ws")
  t.equals(chessHelper.isMovePossible( simplePiece("n", 5, 3), simpleMove(8, 6, false) ), false, "knight long ne")
  t.equals(chessHelper.isMovePossible( simplePiece("N", 5, 3), simpleMove(7, 1, false) ), false, "knight long se")
  t.equals(chessHelper.isMovePossible( simplePiece("N", 5, 6), simpleMove(3, 8, false) ), false, "knight long nw")
  t.equals(chessHelper.isMovePossible( simplePiece("n", 5, 6), simpleMove(2, 3, false) ), false, "knight long sw")
  t.equals(chessHelper.isMovePossible( simplePiece("n", 5, 3), simpleMove(5, 1, false) ), false, "knight long s")
  t.equals(chessHelper.isMovePossible( simplePiece("n", 5, 3), simpleMove(5, 8, false) ), false, "knight long n")
  t.equals(chessHelper.isMovePossible( simplePiece("n", 5, 6), simpleMove(1, 6, false) ), false, "knight long w")
  t.equals(chessHelper.isMovePossible( simplePiece("N", 5, 1), simpleMove(8, 1, false) ), false, "knight long e")
  t.equals(chessHelper.isMovePossible( simplePiece("N", 5, 1), simpleMove(6, 2, false) ), false, "knight ne")

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
    layout: [],
    player: "white",
    whiteKingCastle: false,
    whiteQueenCastle: false,
    blackKingCastle: false,
    blackQueenCastle: false,
    enPassant: undefined,
    halfMove: 0,
    fullMove: 1,
    capturedPieces: [],
  }, "empty board")

  t.deepEquals(chessHelper.parseFEN(chessHelper.FEN_DEFAULT), {
    layout: [
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
    fullMove: 1,
    capturedPieces: [],
  }, "standard")

  t.deepEquals(chessHelper.parseFEN("rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1"), {
    layout: [
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
    fullMove: 1,
    capturedPieces: [],
  }, "e4 opening")

  t.deepEquals(chessHelper.parseFEN("5k2/pp4pp/3bpp2/8/1P6/P2KP3/5PPP/2B5 w - - 0 29"), {
    layout: [
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
    fullMove: 29,
    capturedPieces: [],
  }, "partial")

  const FEN1 = "5k2/pp4pp/3bpp2/8/1P6/P2KP3/5PPP/2B5 w - - 0 29"
  const FEN2 = "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1"
  const FEN3 = "8/pppppppp/8/8/8/8/8/8 b - - 0 1"
  t.equals(chessHelper.fenToString( chessHelper.parseFEN(FEN1) ), FEN1, "fen1 parseFEN => fenToString")
  t.equals(chessHelper.fenToString( chessHelper.parseFEN(FEN2) ), FEN2, "fen2 parseFEN => fenToString")
  t.equals(chessHelper.fenToString( chessHelper.parseFEN(FEN3) ), FEN3, "fen3 parseFEN => fenToString")

  t.end()
})


test("chessHelper.parsePGN", (t) => {
  t.deepEquals(chessHelper.parsePGN(""), {moves: []}, "empty")

  const pgn1 = chessHelper.parsePGN(PGN1)
  t.equals(pgn1.moves.length, 85, "pgn1 move count")
  t.equals(pgn1.moveOffset, 0, "pgn1 moveOffset")
  t.deepEquals(pgn1.moves[(43-1)*2], {code:"R", fromFile: undefined, fromRank: undefined, capture: false, toFile: 5, toRank: 6, promote: "", castle: "", check: ""}, "pgn1 43. white")
  t.deepEquals(pgn1.moves[(19-1)*2], {code:"P", fromFile: 5, fromRank: undefined, capture: true, toFile: 4, toRank: 6, promote: "", castle: "", check: ""}, "pgn1 19. white")
  t.deepEquals(pgn1.moves[(25-1)*2+1], {code:"r", fromFile: undefined, fromRank: undefined, capture: true, toFile: 5, toRank: 1, promote: "", castle: "", check: "+"}, "pgn1 25. black")
  t.deepEquals(pgn1.moves[(24-1)*2], {code:"B", fromFile: undefined, fromRank: undefined, capture: true, toFile: 6, toRank: 7, promote: "", castle: "", check: "+"}, "pgn1 24. white")
  t.deepEquals(pgn1.moves[(20-1)*2], {code:"N", fromFile: 2, fromRank: undefined, capture: false, toFile: 4, toRank: 2, promote: "", castle: "", check: ""}, "pgn1 20. white")
  t.equals(chessHelper.pgnToString(pgn1).replace(/\s/g, ""), PGN1.replace(/\s/g, "").replace(/\{[^\}]*\}/g, ""), "pgn1 parsePGN => pgnToSTring")

  const pgn_partial = chessHelper.parsePGN(PGN_PARTIAL)
  t.equals(pgn_partial.moveOffset, 39, "partial game starting on 20")
  t.equals(chessHelper.pgnToString(pgn_partial).replace(/\s/g, ""), PGN_PARTIAL.replace(/\s/g, ""), "pgn_partial parsePGN => pgnToSTring")

  t.end()
})

test("chessHelper.findPieceByFileRank", (t) => {
  const fenDefault = chessHelper.parseFEN(chessHelper.FEN_DEFAULT)
  t.deepEquals(chessHelper.findPieceByFileRank(fenDefault.layout, -1, -1), undefined, "off board")
  t.deepEquals(chessHelper.findPieceByFileRank(fenDefault.layout, 9, 2), undefined, "off board 2")
  t.deepEquals(chessHelper.findPieceByFileRank(fenDefault.layout, 3, -1), undefined, "off board 3")
  t.deepEquals(chessHelper.findPieceByFileRank(fenDefault.layout, 1, 1), {code: "R", file: 1, rank: 1}, "bottom left")
  t.deepEquals(chessHelper.findPieceByFileRank(fenDefault.layout, 8, 8), {code: "r", file: 8, rank: 8}, "top right")
  t.deepEquals(chessHelper.findPieceByFileRank(fenDefault.layout, 3, 1), {code: "B", file: 3, rank: 1}, "white bishop")
  t.deepEquals(chessHelper.findPieceByFileRank(fenDefault.layout, 5, 5), undefined, "no piece")
  t.end()
})

test("chessHelper.findPieceByMove", (t) => {
  t.deepEquals( chessHelper.findPieceByMove(chessHelper.parseFEN("8/pppppppp/8/8/8/8/8/8 b - - 0 1").layout, chessHelper.decodeSAN("black", "e6")), {code: "p", file: 5, rank: 7}, "pawn advance")
  t.deepEquals( chessHelper.findPieceByMove(chessHelper.parseFEN("r3b2r/8/8/8/8/8/8/8 b - - 0 1").layout, chessHelper.decodeSAN("black", "Rb8")), {code: "r", file: 1, rank: 8}, "queen rook")
  t.deepEquals( chessHelper.findPieceByMove(chessHelper.parseFEN("r3b2r/8/8/8/8/8/8/8 b - - 0 1").layout, chessHelper.decodeSAN("black", "Rf8")), {code: "r", file: 8, rank: 8}, "king rook")
  t.end()
})

test("chessHelper.applyMove", (t) => {
  const fenA = chessHelper.parseFEN("r3kbnr/ppppppp1/8/8/8/8/7p/6R1 b - - 0 1")
  t.deepEquals( chessHelper.applyMove(fenA, chessHelper.decodeSAN("black", "e6")), [{type: "move", piece: {code: "p", file: 5, rank: 6}, fromFile: 5, fromRank: 7, toFile: 5, toRank: 6}], "pawn advance" )
  t.deepEquals( chessHelper.applyMove(fenA, chessHelper.decodeSAN("black", "e5")), [{type: "move", piece: {code: "p", file: 5, rank: 5}, fromFile: 5, fromRank: 6, toFile: 5, toRank: 5}], "same pawn again" )
  t.deepEquals( chessHelper.applyMove(fenA, chessHelper.decodeSAN("black", "Nh6")), [{type: "move", piece: {code: "n", file: 8, rank: 6}, fromFile: 7, fromRank: 8, toFile: 8, toRank: 6}], "knight advance" )
  t.deepEquals( chessHelper.applyMove(fenA, chessHelper.decodeSAN("black", "xg1=Q")), [
    {type: "move", piece: {code: "p", file: 7, rank: 1}, fromFile: 8, fromRank: 2, toFile: 7, toRank: 1},
    {type: "capture", capturedPiece: {code: "R", file: 7, rank: 1}, capturedIndex: 0},
    {type: "promote", piece: {code: "p", file: 7, rank: 1}, newPiece: {code: "q", file: 7, rank: 1}, file: 7, rank: 1, capturedIndex: 1},
  ], "pawn capture and promotion" )
  t.deepEquals( chessHelper.applyMove(fenA, chessHelper.decodeSAN("black", "O-O-O")), [
    {type: "castle", king: {code: "k", file: 3, rank: 8}, rook: {code: "r", file: 4, rank: 8}, kingside: false},
  ], "queenside castle" )

  const pgn1 = chessHelper.parsePGN(PGN1)
  const fen1 = chessHelper.parseFEN(chessHelper.FEN_DEFAULT)

  for (let move of pgn1.moves) {
    chessHelper.applyMove(fen1, move)
  }

  t.equals(chessHelper.fenToString(fen1), "8/8/4R1p1/2k3p1/1p4P1/1P1b1P2/3K1n2/8 w - - 2 43", "play PGN1")

  const pgnPartial = chessHelper.parsePGN(PGN_PARTIAL)
  const fenPartial = chessHelper.parseFEN(pgnPartial.FEN)

  for (let move of pgnPartial.moves) {
    chessHelper.applyMove(fenPartial, move)
  }

  t.equals(chessHelper.fenToString(fenPartial), "6R1/8/P7/8/4n3/5pk1/8/6K1 b - - 1 68", "play PGN_PARTIAL")

  t.end()
})
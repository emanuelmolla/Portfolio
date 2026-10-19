import { Chess, DEFAULT_POSITION, type Move, type Square } from 'chess.js'
import openings from './openings.json'

export type Promotion = 'q' | 'r' | 'b' | 'n'
export function frame(move: Move) {
  return {
    san: move.san,
    fromSquare: move.from,
    toSquare: move.to,
    beforeFen: move.before,
    afterFen: move.after,
    isCastling: move.isKingsideCastle() || move.isQueensideCastle(),
    isCapture: move.isCapture() || move.isEnPassant(),
    isEnPassant: move.isEnPassant(),
  }
}

// Move record: https://lichess.org/study/GwkmQE5K/Fvpz4C8b
// Historical context: https://www.chess.com/terms/opera-game-chess
export const OPERA_PGN =
  '1. e4 e5 2. Nf3 d6 3. d4 Bg4 4. dxe5 Bxf3 5. Qxf3 dxe5 6. Bc4 Nf6 7. Qb3 Qe7 8. Nc3 c6 9. Bg5 b5 10. Nxb5 cxb5 11. Bxb5+ Nbd7 12. O-O-O Rd8 13. Rxd7 Rxd7 14. Rd1 Qe6 15. Bxd7+ Nxd7 16. Qb8+ Nxb8 17. Rd8# 1-0'
const opera = new Chess()
opera.loadPgn(OPERA_PGN)
export const replays = [
  {
    id: 'opera-game',
    title: 'The Opera Game · 1858',
    initialFen: DEFAULT_POSITION,
    plies: opera.history({ verbose: true }).map(frame),
    source: 'https://www.chess.com/terms/opera-game-chess',
    description:
      'Paul Morphy vs. Duke Karl and Count Isouard. A complete game, ending in checkmate.',
  },
  ...openings.sequences.map((sequence) => ({
    ...sequence,
    title: sequence.id.replaceAll('-', ' '),
    source: '',
    description: 'A short opening study.',
  })),
]

export function gameFromMoves(
  moves: readonly string[],
  initialFen = DEFAULT_POSITION,
) {
  const game = new Chess(initialFen)
  for (const move of moves) game.move(move)
  return game
}

export function legalDestinations(game: Chess, square: string) {
  return game.moves({ square: square as Square, verbose: true })
}

export function attemptMove(
  game: Chess,
  from: string,
  to: string,
  promotion?: Promotion,
) {
  if (game.isGameOver()) return { kind: 'invalid' as const }
  const candidates = legalDestinations(game, from).filter(
    (move) => move.to === to,
  )
  if (!candidates.length) return { kind: 'invalid' as const }
  if (candidates.some((move) => move.isPromotion()) && !promotion)
    return { kind: 'promotion' as const }
  const move = game.move({ from, to, ...(promotion ? { promotion } : {}) })
  return { kind: 'moved' as const, san: move.san }
}

export function gameStatus(game: Chess) {
  const side = game.turn() === 'w' ? 'White' : 'Black'
  if (game.isCheckmate())
    return `Checkmate. ${side === 'White' ? 'Black' : 'White'} wins.`
  if (game.isStalemate()) return 'Draw by stalemate.'
  if (game.isThreefoldRepetition()) return 'Draw by threefold repetition.'
  if (game.isInsufficientMaterial()) return 'Draw, insufficient material.'
  if (game.isDrawByFiftyMoves()) return 'Draw, fifty-move rule.'
  if (game.isDraw()) return 'Draw.'
  return game.isCheck() ? `${side} is in check.` : `${side} to move.`
}

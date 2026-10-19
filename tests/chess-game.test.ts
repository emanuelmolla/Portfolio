import assert from 'node:assert/strict'
import test from 'node:test'
import { Chess } from 'chess.js'
import { attemptMove, frame, gameFromMoves, gameStatus, replays } from '../themes/chess/game'
import { readLocalGame, saveLocalGame, subscribeLocalGame } from '../themes/chess/live-game-store'

test('the complete replay ends in checkmate and all study moves are legal', () => {
  assert.equal(replays[0].plies.length, 33)
  for (const replay of replays) {
    const game = new Chess(replay.initialFen)
    for (const ply of replay.plies) {
      assert.equal(game.fen(), ply.beforeFen)
      game.move(ply.san)
      assert.equal(game.fen(), ply.afterFen)
    }
  }
  assert.ok(gameFromMoves(replays[0].plies.map(ply => ply.san)).isCheckmate())
})

test('local play rejects illegal moves without changing the position', () => {
  const game = new Chess()
  const before = game.fen()
  assert.equal(attemptMove(game, 'e2', 'e5').kind, 'invalid')
  assert.equal(game.fen(), before)
  assert.deepEqual(attemptMove(game, 'e2', 'e4'), { kind: 'moved', san: 'e4' })
  assert.equal(game.turn(), 'b')
})

test('castling and en passant are represented in animation frames', () => {
  const castle = gameFromMoves(['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Nf6', 'O-O'])
  assert.equal(frame(castle.history({ verbose: true }).at(-1)!).isCastling, true)
  assert.equal(castle.get('g1')?.type, 'k')
  assert.equal(castle.get('f1')?.type, 'r')
  const capture = gameFromMoves(['e4', 'a6', 'e5', 'd5', 'exd6'])
  assert.equal(frame(capture.history({ verbose: true }).at(-1)!).isEnPassant, true)
  assert.equal(capture.get('d5'), undefined)
})

test('promotion requires an explicit piece choice', () => {
  const game = new Chess('7k/P7/8/8/8/8/8/7K w - - 0 1')
  assert.equal(attemptMove(game, 'a7', 'a8').kind, 'promotion')
  assert.equal(game.get('a7')?.type, 'p')
  assert.equal(attemptMove(game, 'a7', 'a8', 'r').kind, 'moved')
  assert.equal(game.get('a8')?.type, 'r')
})

test('a finished game refuses further moves', () => {
  const game = gameFromMoves(['f3', 'e5', 'g4', 'Qh4#'])
  assert.match(gameStatus(game), /checkmate/i)
  assert.equal(attemptMove(game, 'e2', 'e4').kind, 'invalid')
})

test('local game store notifies subscribers and copies submitted moves', () => {
  let notifications = 0
  const unsubscribe = subscribeLocalGame(() => notifications++)
  const moves = ['e4']
  saveLocalGame(moves)
  moves.push('e5')
  assert.deepEqual(readLocalGame(), ['e4'])
  assert.equal(notifications, 1)
  unsubscribe()
  saveLocalGame([])
  assert.equal(notifications, 1)
})

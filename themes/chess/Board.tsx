'use client'

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react'
import Image from 'next/image'
import { Chess, DEFAULT_POSITION, type Square } from 'chess.js'
import { positionAt } from './position'
import { StudyClock } from './Clock'
import {
  attemptMove,
  frame,
  gameFromMoves,
  gameStatus,
  legalDestinations,
  replays,
  type Promotion,
} from './game'
import {
  emptyGame,
  readLocalGame,
  saveLocalGame,
  subscribeLocalGame,
} from './live-game-store'
import { useClubMotion } from './motion-context'

const promotionNames: Record<Promotion, string> = {
  q: 'Queen',
  r: 'Rook',
  b: 'Bishop',
  n: 'Knight',
}

export function Board() {
  const { paused } = useClubMotion()
  const [mode, setMode] = useState<'replay' | 'play'>('replay')
  const [line, setLine] = useState(0)
  const [ply, setPly] = useState(0)
  const [autoplay, setAutoplay] = useState(false)
  const [flipped, setFlipped] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)
  const [focusSquare, setFocusSquare] = useState('e2')
  const [notice, setNotice] = useState('')
  const [promotion, setPromotion] = useState<{
    from: string
    to: string
  } | null>(null)
  const grid = useRef<HTMLDivElement>(null)
  const promotionFocus = useRef<HTMLButtonElement>(null)
  const localMoves = useSyncExternalStore(
    subscribeLocalGame,
    readLocalGame,
    () => emptyGame,
  )
  const live = useMemo(() => gameFromMoves(localMoves), [localMoves])
  const sequence = replays[line]
  const replayFen = ply ? sequence.plies[ply - 1].afterFen : sequence.initialFen
  const game = mode === 'play' ? live : new Chess(replayFen)
  const liveFrames = useMemo(
    () => live.history({ verbose: true }).map(frame),
    [live],
  )
  const currentSequence =
    mode === 'play'
      ? { initialFen: DEFAULT_POSITION, plies: liveFrames }
      : sequence
  const position = positionAt(
    currentSequence,
    mode === 'play' ? liveFrames.length : ply,
  )
  const next = sequence.plies[ply]
  const last = mode === 'play' ? liveFrames.at(-1) : sequence.plies[ply - 1]
  const destinations =
    mode === 'play' && selected ? legalDestinations(live, selected) : []
  const playing = mode === 'replay' && autoplay && !!next && !paused
  const squares = Array.from(
    { length: 64 },
    (_, i) =>
      `${'abcdefgh'[flipped ? 7 - (i % 8) : i % 8]}${flipped ? Math.floor(i / 8) + 1 : 8 - Math.floor(i / 8)}`,
  )

  useEffect(() => {
    if (!playing) return
    const timer = window.setInterval(
      () => setPly((value) => Math.min(value + 1, sequence.plies.length)),
      1350,
    )
    return () => window.clearInterval(timer)
  }, [playing, sequence.plies.length])
  useEffect(() => {
    if (promotion) promotionFocus.current?.focus()
  }, [promotion])

  function changeMode(value: 'replay' | 'play') {
    setMode(value)
    setAutoplay(false)
    setSelected(null)
    setPromotion(null)
    setNotice('')
  }
  function commit(from: string, to: string, promote?: Promotion) {
    const current = gameFromMoves(readLocalGame())
    const result = attemptMove(current, from, to, promote)
    if (result.kind === 'promotion') {
      setPromotion({ from, to })
      setNotice('Choose a piece for promotion.')
      return
    }
    if (result.kind === 'invalid') {
      setNotice('That move is not legal. Choose a highlighted square.')
      return
    }
    saveLocalGame([...readLocalGame(), result.san])
    setSelected(null)
    setPromotion(null)
    setNotice('')
  }
  function choose(square: string) {
    setFocusSquare(square)
    if (mode === 'replay') {
      if (next && (square === next.fromSquare || square === next.toSquare)) {
        setPly(ply + 1)
        setAutoplay(false)
      } else
        setNotice(
          'Use Next move to follow the replay, or switch to Local play to make your own moves.',
        )
      return
    }
    if (promotion) return
    if (live.isGameOver()) {
      setNotice('This game is over. Start a new game to play again.')
      return
    }
    const piece = live.get(square as Square)
    if (piece?.color === live.turn()) {
      setSelected(selected === square ? null : square)
      setNotice('')
      return
    }
    if (selected) commit(selected, square)
    else setNotice('Choose a piece belonging to the side to move.')
  }
  function takeBack() {
    setAutoplay(false)
    setSelected(null)
    setPromotion(null)
    setNotice('')
    if (mode === 'play') saveLocalGame(localMoves.slice(0, -1))
    else setPly(Math.max(0, ply - 1))
  }
  const complete = mode === 'play' ? live.isGameOver() : !next
  const status =
    notice ||
    (mode === 'play'
      ? `${gameStatus(live)} ${selected ? `Selected ${selected}. Choose a highlighted destination.` : 'You control both sides.'}`
      : `${gameStatus(game)} ${next ? `Next: ${next.san}.` : 'Replay complete.'}`)

  return (
    <section
      className="chess-board-station"
      aria-label="Interactive chess board"
    >
      <div className="chess-board-mode" role="group" aria-label="Board mode">
        <button
          type="button"
          aria-pressed={mode === 'replay'}
          onClick={() => changeMode('replay')}
        >
          Watch a game
        </button>
        <button
          type="button"
          aria-pressed={mode === 'play'}
          onClick={() => changeMode('play')}
        >
          Local play
        </button>
      </div>
      <div className="chess-study-title">
        <span>
          {mode === 'replay' ? sequence.title : 'Your board · both sides'}
        </span>
        <button
          type="button"
          className="chess-text-button"
          onClick={() => setFlipped(!flipped)}
          aria-label="Flip board"
        >
          Flip ↻
        </button>
      </div>
      <StudyClock
        whiteToMove={game.turn() === 'w'}
        complete={complete}
        completeLabel={mode === 'play' ? 'Game over' : 'Study complete'}
      />
      <div
        className="chess-board"
        role="group"
        aria-label={`Chess position after ${mode === 'play' ? localMoves.length : ply} half moves`}
      >
        <div
          className="chess-board-cells"
          ref={grid}
          role="group"
          aria-label="Chess squares. Use arrow keys to move, Enter to select."
        >
          {squares.map((square, index) => {
            const piece = position.find((item) => item.square === square)
            const legal = destinations.some((move) => move.to === square)
            const check =
              game.isCheck() &&
              piece?.role === 'king' &&
              piece.color === (game.turn() === 'w' ? 'white' : 'black')
            return (
              <button
                type="button"
                key={square}
                data-square={square}
                tabIndex={square === focusSquare ? 0 : -1}
                className={`chess-cell${last && [last.fromSquare, last.toSquare].includes(square) ? ' is-last' : ''}${selected === square ? ' is-selected' : ''}${legal ? ' is-legal' : ''}${check ? ' is-check' : ''}${mode === 'replay' && next?.fromSquare === square ? ' is-replay-source' : ''}`}
                aria-label={`${square}${piece ? `, ${piece.color} ${piece.role}` : ', empty'}${legal ? ', legal destination' : ''}`}
                aria-pressed={selected === square}
                onClick={() => choose(square)}
                onKeyDown={(event) => {
                  if (event.key === 'Escape') {
                    setSelected(null)
                    setPromotion(null)
                    return
                  }
                  const shifts: Record<string, number> = {
                    ArrowLeft: -1,
                    ArrowRight: 1,
                    ArrowUp: -8,
                    ArrowDown: 8,
                  }
                  const shift = shifts[event.key]
                  if (!shift) return
                  event.preventDefault()
                  const target = index + shift
                  if (
                    target < 0 ||
                    target >= 64 ||
                    (Math.abs(shift) === 1 &&
                      Math.floor(target / 8) !== Math.floor(index / 8))
                  )
                    return
                  setFocusSquare(squares[target])
                  grid.current
                    ?.querySelector<HTMLButtonElement>(
                      `[data-square="${squares[target]}"]`,
                    )
                    ?.focus()
                }}
              />
            )
          })}
        </div>
        <div className="chess-piece-layer" aria-hidden="true">
          {position.map((piece) => (
            <span
              key={piece.id}
              className="chess-piece"
              style={{
                left: `${(flipped ? 7 - 'abcdefgh'.indexOf(piece.square[0]) : 'abcdefgh'.indexOf(piece.square[0])) * 12.5}%`,
                top: `${(flipped ? Number(piece.square[1]) - 1 : 8 - Number(piece.square[1])) * 12.5}%`,
              }}
            >
              <Image
                src={`/themes/chess/pieces/${piece.color}-${piece.role}.svg`}
                width={128}
                height={128}
                alt=""
                unoptimized
              />
            </span>
          ))}
        </div>
        <div className="chess-board-files" aria-hidden="true">
          {(flipped ? 'hgfedcba' : 'abcdefgh').split('').map((file) => (
            <span key={file}>{file}</span>
          ))}
        </div>
        <div className="chess-board-ranks" aria-hidden="true">
          {(flipped ? '12345678' : '87654321').split('').map((rank) => (
            <span key={rank}>{rank}</span>
          ))}
        </div>
      </div>
      {promotion && (
        <fieldset className="chess-promotion">
          <legend>Promote your pawn</legend>
          {(['q', 'r', 'b', 'n'] as Promotion[]).map((role, i) => (
            <button
              type="button"
              key={role}
              ref={i === 0 ? promotionFocus : undefined}
              onClick={() => commit(promotion.from, promotion.to, role)}
            >
              {promotionNames[role]}
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              setPromotion(null)
              setSelected(null)
            }}
          >
            Cancel
          </button>
        </fieldset>
      )}
      <div className="chess-board-controls">
        {mode === 'replay' ? (
          <>
            <button
              type="button"
              className="chess-button"
              disabled={paused && !playing}
              onClick={() => {
                if (!next) setPly(0)
                setAutoplay(!playing)
              }}
            >
              {playing ? 'Pause replay' : !next ? 'Watch again' : 'Watch game'}
            </button>
            <button
              type="button"
              className="chess-text-button"
              disabled={!next}
              onClick={() => {
                setAutoplay(false)
                setPly(ply + 1)
                setNotice('')
              }}
            >
              Next move
            </button>
          </>
        ) : (
          <span className="chess-local-label">Local two-player</span>
        )}
        <button
          type="button"
          className="chess-text-button"
          disabled={mode === 'play' ? !localMoves.length : !ply}
          onClick={takeBack}
          aria-label="Take back one move"
        >
          ↶ Take back
        </button>
        <button
          type="button"
          className="chess-text-button"
          disabled={mode === 'play' ? !localMoves.length : !ply}
          onClick={() => {
            setAutoplay(false)
            setSelected(null)
            setPromotion(null)
            setNotice('')
            if (mode === 'play') saveLocalGame([])
            else setPly(0)
          }}
        >
          {mode === 'play' ? 'New game' : 'Reset board'}
        </button>
      </div>
      <p
        className="chess-moves"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {status}
      </p>
      {mode === 'replay' && (
        <>
          <progress
            className="chess-study-progress"
            value={ply}
            max={sequence.plies.length}
            aria-label="Game replay progress"
          />
          <div className="chess-study-meta">
            <label htmlFor="chess-study">Replay library</label>
            <select
              id="chess-study"
              value={line}
              onChange={(event) => {
                setLine(Number(event.target.value))
                setPly(0)
                setAutoplay(false)
                setNotice('')
              }}
            >
              {replays.map((item, i) => (
                <option key={item.id} value={i}>
                  {item.title}
                </option>
              ))}
            </select>
          </div>
          <p className="chess-replay-caption">
            {sequence.description}{' '}
            {sequence.source && (
              <a href={sequence.source} target="_blank" rel="noreferrer">
                About this game ↗
              </a>
            )}
          </p>
        </>
      )}
      <details className="chess-scorebook">
        <summary>
          Move book{' '}
          <span>
            {mode === 'play'
              ? localMoves.length
              : `${ply} / ${sequence.plies.length}`}{' '}
            plies
          </span>
        </summary>
        <div className="chess-scorebook-moves">
          {mode === 'play' ? (
            localMoves.length ? (
              localMoves.map((san, i) => (
                <span key={i}>
                  {i % 2 === 0 ? `${Math.floor(i / 2) + 1}. ` : ''}
                  {san}
                </span>
              ))
            ) : (
              <p>Your moves will appear here.</p>
            )
          ) : (
            <>
              <button
                type="button"
                onClick={() => {
                  setPly(0)
                  setAutoplay(false)
                }}
                aria-current={ply === 0 ? 'step' : undefined}
              >
                Start
              </button>
              {sequence.plies.map((move, i) => (
                <button
                  type="button"
                  key={i}
                  aria-current={ply === i + 1 ? 'step' : undefined}
                  onClick={() => {
                    setPly(i + 1)
                    setAutoplay(false)
                    setNotice('')
                  }}
                >
                  {i % 2 === 0 ? `${Math.floor(i / 2) + 1}. ` : ''}
                  {move.san}
                </button>
              ))}
            </>
          )}
        </div>
      </details>
    </section>
  )
}

const roles: Record<string, string> = {
  p: 'pawn',
  r: 'rook',
  n: 'knight',
  b: 'bishop',
  q: 'queen',
  k: 'king',
}

export interface Piece {
  id: string
  square: string
  role: string
  color: 'white' | 'black'
}

/** The FEN is authoritative; stable identities let CSS animate between squares. */
export function piecesFromFen(fen: string): Piece[] {
  return fen
    .split(' ')[0]
    .split('/')
    .flatMap((row, rank) => {
      let file = 0
      return [...row].flatMap((symbol) => {
        if (/\d/.test(symbol)) {
          file += Number(symbol)
          return []
        }
        const square = `${'abcdefgh'[file++]}${8 - rank}`
        return [
          {
            id: square,
            square,
            role: roles[symbol.toLowerCase()],
            color:
              symbol === symbol.toUpperCase()
                ? ('white' as const)
                : ('black' as const),
          },
        ]
      })
    })
}

interface Ply {
  fromSquare: string
  toSquare: string
  afterFen: string
  isCastling: boolean
}

export function positionAt(
  sequence: { initialFen: string; plies: Ply[] },
  ply: number,
): Piece[] {
  let pieces = piecesFromFen(sequence.initialFen)
  for (const move of sequence.plies.slice(0, ply)) {
    const moving = pieces.find((piece) => piece.square === move.fromSquare)
    pieces = piecesFromFen(move.afterFen).map((piece) => {
      if (piece.square === move.toSquare && moving)
        return { ...piece, id: moving.id }
      const previous = pieces.find(
        (old) =>
          old.square === piece.square &&
          old.color === piece.color &&
          old.role === piece.role,
      )
      if (previous) return { ...piece, id: previous.id }
      if (move.isCastling && piece.role === 'rook') {
        const rookFile = piece.square[0] === 'f' ? 'h' : 'a'
        const rook = pieces.find(
          (old) =>
            old.square === `${rookFile}${piece.square[1]}` &&
            old.role === 'rook' &&
            old.color === piece.color,
        )
        if (rook) return { ...piece, id: rook.id }
      }
      return piece
    })
  }
  return pieces
}

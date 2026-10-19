export const emptyGame: readonly string[] = []
let moves: readonly string[] = emptyGame
const listeners = new Set<() => void>()
export const readLocalGame = () => moves
export function subscribeLocalGame(change: () => void) {
  listeners.add(change)
  return () => {
    listeners.delete(change)
  }
}
/** Browser module state keeps a local game intact while visiting portfolio pages. */
export function saveLocalGame(next: readonly string[]) {
  moves = [...next]
  listeners.forEach((change) => change())
}

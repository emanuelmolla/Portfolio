export const emptyDesktop = {
  maximized: false,
  notes: { welcome: { x: 0, y: 0 }, hello: { x: 0, y: 0 } },
}
let desktop = emptyDesktop
const listeners = new Set<() => void>()
export const readDesktop = () => desktop
export const serverDesktop = () => emptyDesktop
export function subscribeDesktop(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
function emit() {
  listeners.forEach((listener) => listener())
}
export function setMaximized(maximized: boolean) {
  desktop = { ...desktop, maximized }
  emit()
}
export function moveNote(
  id: keyof typeof emptyDesktop.notes,
  position: { x: number; y: number }
) {
  desktop = { ...desktop, notes: { ...desktop.notes, [id]: position } }
  emit()
}
export function resetDesktop() {
  desktop = emptyDesktop
  emit()
}

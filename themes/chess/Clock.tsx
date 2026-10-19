/** Three separate hands keep moving independently, like a mechanical chess clock. */
export function ClockDial() {
  return (
    <svg className="chess-clock-dial" viewBox="0 0 100 100" aria-hidden="true">
      <circle className="chess-clock-rim" cx="50" cy="50" r="48" />
      <circle className="chess-clock-faceplate" cx="50" cy="50" r="43" />
      {Array.from({ length: 12 }, (_, i) => (
        <path
          key={i}
          d="M50 11v6"
          transform={`rotate(${i * 30} 50 50)`}
          className="chess-clock-tick"
        />
      ))}
      <g className="chess-clock-hour">
        <path d="M50 52V29" />
      </g>
      <g className="chess-clock-minute">
        <path d="M50 55V20" />
      </g>
      <g className="chess-clock-second">
        <path d="M50 60V13" />
      </g>
      <circle cx="50" cy="50" r="3.5" fill="#8c392c" />
    </svg>
  )
}

export function StudyClock({
  whiteToMove,
  complete,
  completeLabel = 'Study complete',
}: {
  whiteToMove: boolean
  complete: boolean
  completeLabel?: string
}) {
  return (
    <div
      className="chess-clock"
      aria-label={
        complete ? completeLabel : `${whiteToMove ? 'White' : 'Black'} to move`
      }
    >
      <div
        className={`chess-clock-player chess-clock-face${whiteToMove && !complete ? ' is-running' : ''}`}
      >
        <span className="chess-clock-paddle" aria-hidden="true" />
        <ClockDial />
        <span>White</span>
      </div>
      <span className="chess-clock-label">
        {complete ? completeLabel.toUpperCase() : 'YOUR MOVE'}
        <span className="chess-clock-indicator" aria-hidden="true" />
      </span>
      <div
        className={`chess-clock-player chess-clock-face${!whiteToMove && !complete ? ' is-running' : ''}`}
      >
        <span className="chess-clock-paddle" aria-hidden="true" />
        <ClockDial />
        <span>Black</span>
      </div>
    </div>
  )
}

# Clubroom

A chess-club interpretation of the portfolio. Content stays in the shared
content layer; the theme only renders the records passed to its views.

## Routes

Home, work index and details, writing index and details, about, experience,
contact, and CMS pages use the same URLs in all three themes. `/projects`
redirects permanently to `/work`. The theme is selected through the existing
appearance menu and stored in its cookie, never in a content record.

## Visual system

Walnut-framed board, ivory paper, green felt, brass tabs, project folios,
experience scoresheets, and an analysis notebook. Light and dark modes have
separate material palettes. The portrait preserves its original aspect ratio.
Copy stays as selectable HTML, including on the decorative surfaces.

Navigation is a recessed walnut rail with shallow angled tabs, chess-piece
medallions, and an ivory active tab. Notched dialogue panels, bevelled controls, lifting
folios and clock paddles give this theme a game-menu identity of its own.

The source artwork library and approved reference page are preserved separately.
Only the board, twelve piece SVGs, and a 127 KB WebP tabletop are shipped here.
All styling is scoped to the chess theme or its `chess-` classes.

Fine-pointer devices use an ivory/brass arrow and a pawn pointer for links and
controls. Text uses a matching I-beam; disabled controls and
forced-colour mode retain standard accessibility affordances. These are native
SVG cursors, with no pointer-following JavaScript or animation trail.

## Interaction

The board offers a complete 33-ply Opera Game replay and five short studies.
Watch automatically, step forward or back, or seek through the move book.
Local play supports both sides with legal destination hints, check, checkmate,
draws, castling, en passant, and an explicit promotion choice. `chess.js` supplies
rules, not an AI opponent. No service or account is required. The local game
survives client-side portfolio navigation; reloading starts fresh.

Real links always navigate the portfolio. Playing chess never gates content.
Keyboard users navigate squares with arrow keys and select with Enter or Space.
Move announcements use a polite live region. Reduced-motion preferences disable
movement. Motion settings live inside the session-clock disclosure, without a
separate pause button. The preference is remembered across navigation.
The session clock keeps elapsed time
across page changes, pauses with motion, and runs only one browser-side ticker.
The board's second hands tick continuously on the active side, and its paddles
respond to each move. Take-back and reset controls use the same validated
positions as forward playback. Page entries turn gently into view, folios lift
into place on scroll, and scoresheets settle with staggered motion. These are
progressive enhancements: server-rendered content starts visible, remains usable
without JavaScript, and is never gated behind an animation or interaction.
The contact form uses the same server action as the other themes,
with its own presentation and visible validation and failure states.

## Checks

`npm test` checks manifest parity, promised renderer validation, and every study
position. `npm run typecheck`, `npm run lint`, and `npm run build` check integration.
With a local server running without a database connection, run
`npx tsx scripts/check-theme-routes.ts http://localhost:3218` to check every
published seed-content URL under all three themes, canonicals, redirects, and
the not-found response. The check is read-only and refuses non-local hosts.

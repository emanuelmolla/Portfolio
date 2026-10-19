# Terminal

A plain fullscreen terminal. Root starts with a welcome and prompt. Direct
routes print their server-rendered content immediately inside console output.
There is no theme header, navigation bar, footer or command button strip.
Dark neutral colors are the default; an explicit light scheme is supported.

`ls`, `cd`, `pwd`, `cat`, `help`, `history` and `clear` operate on an allow-listed
virtual filesystem, never a real shell. `cat` prints content inside output while
retaining canonical route navigation. `cat /index.md` reveals the home view,
including when already at root. Commands following printed content retain that
content in scrollback. Clear removes output and command recall history.

Views remain server components passed as children. On root the full home view
is inside a closed native details element, revealed without JavaScript through
a noscript style. JavaScript visitors reveal it with cat. This avoids duplicating
content records or fetching arbitrary URLs. The alternative, a separate content
API, would add a second rendering and loading path for every content kind.

Files are discovered from navigation, the route and server-content links, then
remembered during the mounted session. Visit work or blog to discover their
entries. Up/Down recalls commands and restores drafts; Tab completes known names;
Shift+Tab exits the prompt. Links within output remain ordinary accessible links.
Session memory is capped at 100 commands and 40 output entries, including retained
content, and resets on full page load. The platform owns appearance controls and
public theme availability; this module does not modify those settings.

Focused checks: `node --import tsx --test tests/terminal.test.ts`,
`npx tsc --noEmit --incremental false`, and
`npx eslint themes/terminal tests/terminal.test.ts`.

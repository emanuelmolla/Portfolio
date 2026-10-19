export interface Entry {
  path: string
  href: string
  directory: boolean
}
export const commands = [
  'help',
  'ls',
  'cd',
  'pwd',
  'cat',
  'clear',
  'history',
] as const
export function resolvePath(input: string, cwd = '/'): string | null {
  if (!/^[a-zA-Z0-9_./~-]*$/.test(input)) return null
  const value =
    input === '~' ? '/' : input.startsWith('~/') ? input.slice(1) : input
  const parts: string[] = []
  for (const part of (value.startsWith('/') ? value : `${cwd}/${value}`).split(
    '/'
  )) {
    if (part === '..') parts.pop()
    else if (part && part !== '.') parts.push(part)
  }
  return `/${parts.join('/')}`
}
export function fileSystem(paths: string[]): Entry[] {
  const entries = new Map<string, Entry>()
  entries.set('/', { path: '/', href: '/', directory: true })
  entries.set('/index.md', { path: '/index.md', href: '/', directory: false })
  for (const href of [
    '/about',
    '/work',
    '/blog',
    '/experience',
    '/contact',
    ...paths,
  ]) {
    if (resolvePath(href) !== href || href === '/') continue
    const directory = href === '/work' || href === '/blog'
    entries.set(href, { path: href, href, directory })
    if (!directory)
      entries.set(`${href}.md`, { path: `${href}.md`, href, directory: false })
  }
  return [...entries.values()]
}
export function workingDirectory(path: string): string {
  return path === '/work' || path.startsWith('/work/')
    ? '/work'
    : path === '/blog' || path.startsWith('/blog/')
      ? '/blog'
      : '/'
}
export interface Result {
  output: string
  href?: string
  clear?: boolean
}
export function execute(
  input: string,
  cwd: string,
  entries: Entry[],
  history: readonly string[] = []
): Result {
  const [command, ...args] = input.trim().split(/\s+/)
  if (!command) return { output: '' }
  if (!commands.includes(command as (typeof commands)[number]))
    return { output: `${command}: command not found. Try help.` }
  if (
    args.length > 1 ||
    (['help', 'pwd', 'clear', 'history'].includes(command) && args.length)
  )
    return { output: `${command}: unexpected argument.` }
  if (command === 'help')
    return {
      output:
        'ls [path]   List files\ncd [path]   Open directory (default: /)\npwd         Show directory\ncat <file>  Print a page in the console\nhistory     List previous commands\nclear       Clear output and history\n\nUp/Down: history. Tab: completion. Links also work.',
    }
  if (command === 'pwd') return { output: cwd }
  if (command === 'history')
    return {
      output:
        history.map((line, i) => `${i + 1}  ${line}`).join('\n') ||
        '(empty history)',
    }
  if (command === 'clear') return { output: '', clear: true }
  if (command === 'cat' && !args.length)
    return { output: 'cat: specify a file. Try ls.' }
  const path = resolvePath(args[0] ?? (command === 'cd' ? '/' : cwd), cwd)
  if (path === null)
    return { output: `${command}: invalid path. Use literal file names.` }
  const entry = entries.find((item) => item.path === path)
  if (!entry)
    return { output: `${command}: ${path}: no such file or directory.` }
  if (command === 'ls') {
    if (!entry.directory) return { output: path.split('/').pop() ?? path }
    const prefix = path === '/' ? '/' : `${path}/`
    return {
      output:
        entries
          .filter(
            (item) =>
              item.path !== path &&
              item.path.startsWith(prefix) &&
              !item.path.slice(prefix.length).includes('/') &&
              (item.directory || item.path.endsWith('.md'))
          )
          .map(
            (item) =>
              `${item.path.slice(prefix.length)}${item.directory ? '/' : ''}`
          )
          .join('\n') || '(empty directory)',
    }
  }
  if (command === 'cd' && !entry.directory)
    return { output: `cd: ${path}: not a directory. Use cat.` }
  if (command === 'cat' && entry.directory)
    return { output: `cat: ${path}: is a directory. Use ls or cd.` }
  return {
    output: `${command === 'cat' ? 'Reading' : 'Opening'} ${path}`,
    href: entry.href,
  }
}
export function complete(
  input: string,
  cwd: string,
  entries: Entry[]
): string[] {
  if (!input.includes(' '))
    return commands.filter((name) => name.startsWith(input))
  const match = /^(ls|cd|cat)\s+([^\s]*)$/.exec(input)
  if (!match) return []
  const [, command, partial] = match
  const slash = partial.lastIndexOf('/')
  const prefix = slash < 0 ? '' : partial.slice(0, slash + 1)
  const parent = resolvePath(prefix || '.', cwd)
  if (!parent) return []
  const base = parent === '/' ? '/' : `${parent}/`
  return entries
    .filter(
      (item) =>
        item.path.startsWith(base) &&
        !item.path.slice(base.length).includes('/') &&
        item.path !== parent &&
        (command !== 'cd' || item.directory) &&
        (command !== 'cat' || (!item.directory && item.path.endsWith('.md')))
    )
    .map(
      (item) =>
        `${prefix}${item.path.slice(base.length)}${item.directory ? '/' : ''}`
    )
    .filter((name) => name.startsWith(partial))
    .map((name) => `${command} ${name}`)
}

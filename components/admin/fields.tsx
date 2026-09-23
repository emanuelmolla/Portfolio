import type { ReactNode } from 'react'

/**
 * Form primitives for the admin.
 *
 * No directive at the top, deliberately: nothing here uses state or an effect, so
 * these render on whichever side imports them. The edit forms are client
 * components because useActionState is what puts a validation message under the
 * input that caused it, but these primitives stay usable from a server component
 * too, which is how the read-only screens avoid shipping any of this.
 *
 * Every input is UNCONTROLLED, with defaultValue and a `name`. The form posts
 * FormData and the server action is the single source of truth about what is
 * valid. The alternative, mirroring nine collections of schema into useState and
 * onChange handlers, is a second model of the data that drifts from the zod one.
 *
 * Styling lives in the .a-* classes in globals.css rather than in props here, so
 * changing how every input in the admin looks is one edit.
 */

/* ----------------------------------------------------------------- layout --- */

export function Fieldset({
  legend,
  hint,
  children,
}: {
  legend: string
  hint?: string
  children: ReactNode
}) {
  return (
    <fieldset className="a-card px-5 py-4">
      <legend className="px-1.5 text-[13px] font-semibold tracking-tight">{legend}</legend>
      {hint && <p className="a-hint mt-1 mb-4 max-w-prose">{hint}</p>}
      <div className={`grid gap-4 ${hint ? '' : 'mt-3'}`}>{children}</div>
    </fieldset>
  )
}

/** Side-by-side on wide screens, stacked on narrow. */
export function Row({ children, cols = 2 }: { children: ReactNode; cols?: 2 | 3 }) {
  return (
    <div className={`grid gap-4 ${cols === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
      {children}
    </div>
  )
}

/* ------------------------------------------------------------------ field --- */

interface FieldShell {
  label: string
  name: string
  hint?: string
  error?: string
  required?: boolean
}

function Shell({
  label,
  name,
  hint,
  error,
  required,
  children,
}: FieldShell & { children: ReactNode }) {
  return (
    <div>
      <label className="a-label mb-1.5" htmlFor={name}>
        {label}
        {/* The asterisk is redundant with the `required` attribute for a screen
            reader, hence aria-hidden: it is a sighted-scanning affordance only. */}
        {required && (
          <span aria-hidden className="ml-1 text-[var(--a-danger)]">
            *
          </span>
        )}
      </label>
      {children}
      {error ? (
        <p className="a-error mt-1.5">{error}</p>
      ) : (
        hint && <p className="a-hint mt-1.5">{hint}</p>
      )}
    </div>
  )
}

type InputProps = FieldShell & {
  defaultValue?: string | number | null
  placeholder?: string
  type?: 'text' | 'email' | 'url' | 'date' | 'number'
  step?: string
  disabled?: boolean
  autoComplete?: string
  mono?: boolean
}

export function Text({
  defaultValue,
  placeholder,
  type = 'text',
  step,
  disabled,
  autoComplete = 'off',
  mono,
  ...shell
}: InputProps) {
  return (
    <Shell {...shell}>
      <input
        id={shell.name}
        name={shell.name}
        type={type}
        step={step}
        required={shell.required}
        disabled={disabled}
        autoComplete={autoComplete}
        placeholder={placeholder}
        defaultValue={defaultValue ?? ''}
        className={`a-input ${mono ? 'a-mono' : ''}`}
      />
    </Shell>
  )
}

export function Num(props: Omit<InputProps, 'type'>) {
  return <Text {...props} type="number" mono />
}

export function DateField(props: Omit<InputProps, 'type' | 'mono'>) {
  return <Text {...props} type="date" mono />
}

export function Area({
  defaultValue,
  placeholder,
  rows = 4,
  code,
  disabled,
  maxLength,
  ...shell
}: FieldShell & {
  defaultValue?: string | null
  placeholder?: string
  rows?: number
  code?: boolean
  disabled?: boolean
  maxLength?: number
}) {
  return (
    <Shell {...shell}>
      <textarea
        id={shell.name}
        name={shell.name}
        rows={rows}
        required={shell.required}
        disabled={disabled}
        maxLength={maxLength}
        placeholder={placeholder}
        defaultValue={defaultValue ?? ''}
        className={`a-textarea ${code ? 'a-code' : ''}`}
      />
    </Shell>
  )
}

/**
 * One value per line.
 *
 * Newlines rather than a tag-chip widget because these are edited in bursts:
 * pasting six resume bullets in is one action here and six in a chip input. The
 * cost is no validation until save, which for a single-user tool is the right
 * side of that trade.
 */
export function ListArea({
  defaultValue,
  rows = 4,
  ...shell
}: FieldShell & { defaultValue?: readonly string[] | null; rows?: number; placeholder?: string }) {
  return (
    <Area
      {...shell}
      code
      rows={rows}
      defaultValue={(defaultValue ?? []).join('\n')}
      hint={shell.hint ?? 'One per line.'}
    />
  )
}

export function Select({
  options,
  defaultValue,
  disabled,
  includeBlank,
  blankLabel = 'None',
  onChange,
  ...shell
}: FieldShell & {
  options: readonly { value: string; label: string }[]
  defaultValue?: string | null
  disabled?: boolean
  includeBlank?: boolean
  blankLabel?: string
  /**
   * Optional, and only ever passed from a client form. The select stays
   * UNCONTROLLED either way: this reports the new value so a caller can branch on
   * it, it does not become the source of truth for what is in the field. That
   * matters for work.kind, where the selected kind decides which detail inputs
   * render but the select itself still posts normally.
   *
   * Left undefined by server callers, so no function is ever handed across the
   * server-client boundary.
   */
  onChange?: (value: string) => void
}) {
  return (
    <Shell {...shell}>
      <select
        id={shell.name}
        name={shell.name}
        disabled={disabled}
        defaultValue={defaultValue ?? ''}
        onChange={onChange ? (event) => onChange(event.target.value) : undefined}
        className="a-select"
      >
        {includeBlank && <option value="">{blankLabel}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Shell>
  )
}

/** Convenience for enums declared as `as const` tuples in the models. */
export function enumOptions(
  values: readonly string[],
  labels?: Record<string, string>
): { value: string; label: string }[] {
  return values.map((value) => ({ value, label: labels?.[value] ?? value }))
}

export function Check({
  label,
  name,
  hint,
  defaultChecked,
  disabled,
}: {
  label: string
  name: string
  hint?: string
  defaultChecked?: boolean
  disabled?: boolean
}) {
  return (
    <div className="flex items-start gap-2.5">
      <input
        id={name}
        name={name}
        type="checkbox"
        disabled={disabled}
        defaultChecked={defaultChecked}
        className="a-check mt-0.5 shrink-0"
      />
      <div className="min-w-0">
        <label htmlFor={name} className="block text-[13px] leading-tight">
          {label}
        </label>
        {hint && <p className="a-hint mt-1">{hint}</p>}
      </div>
    </div>
  )
}

/**
 * Multi-select for reference arrays (techRefs).
 *
 * A plain multiple select, not a search-and-add widget. There are a couple of
 * dozen tech records and a native multi-select needs no JavaScript, keeps
 * keyboard behaviour for free, and posts every selected value under one name,
 * which getAll() reads directly.
 */
export function MultiSelect({
  options,
  defaultValue,
  size = 8,
  ...shell
}: FieldShell & {
  options: readonly { value: string; label: string }[]
  defaultValue?: readonly string[] | null
  size?: number
}) {
  const selected = new Set(defaultValue ?? [])

  return (
    <Shell {...shell} hint={shell.hint ?? 'Ctrl or Cmd to select several.'}>
      <select
        id={shell.name}
        name={shell.name}
        multiple
        size={size}
        defaultValue={Array.from(selected)}
        className="a-select !bg-none !pr-2.5"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Shell>
  )
}

/* --------------------------------------------------------------- feedback --- */

export function FormError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <div role="alert" className="a-notice a-notice-danger">
      {message}
    </div>
  )
}

export function Notice({
  tone = 'plain',
  children,
}: {
  tone?: 'plain' | 'warn' | 'danger' | 'ok'
  children: ReactNode
}) {
  const cls = tone === 'plain' ? '' : `a-notice-${tone}`
  return <div className={`a-notice ${cls}`}>{children}</div>
}

export function StatusBadge({ status }: { status: string }) {
  const tone =
    status === 'published'
      ? 'a-badge-live'
      : status === 'draft'
        ? 'a-badge-draft'
        : ''
  return <span className={`a-badge ${tone}`}>{status}</span>
}

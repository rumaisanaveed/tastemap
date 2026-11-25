import { cn } from '@/lib/utils'

interface Props<T extends string | number> {
  options: { value: T; label: string }[]
  value: T[]
  onChange: (v: T[]) => void
  multiple?: boolean
  allowEmpty?: boolean
  wrap?: boolean
  label?: string
}

export default function OptionGroup<T extends string | number>({ options, value, onChange, multiple, allowEmpty, wrap, label }: Props<T>) {
  const toggle = (v: T) => {
    const on = value.includes(v)
    if (multiple) onChange(on ? value.filter((x) => x !== v) : [...value, v])
    else onChange(on && allowEmpty ? [] : [v])
  }
  return (
    <div role="group" aria-label={label} className={cn('flex gap-1.5', wrap && 'flex-wrap')}>
      {options.map((o) => {
        const on = value.includes(o.value)
        return (
          <button key={o.value} type="button" aria-pressed={on} onClick={() => toggle(o.value)} className={cn('h-11 rounded-xl border-[1.5px] px-3 text-sm font-semibold transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/30', wrap ? 'flex-none px-4' : 'flex-1', on ? 'border-foreground bg-foreground text-background' : 'border-input bg-card hover:border-foreground')}>
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

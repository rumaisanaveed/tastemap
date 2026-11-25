import { Label } from "@/components/ui/label"
import { useState } from "react"

interface Props {
  label: string
  values: string[]
  onChange: (values: string[]) => void
  placeholder: string
  type?: string
}

function MultiValueInput({
  label,
  values,
  onChange,
  placeholder,
  type = 'text',
}: Props) {
  const [input, setInput] = useState('')

  const addValue = () => {
    const value = input.trim()
    if (!value || values.includes(value)) return
    onChange([...values, value])
    setInput('')
  }

  return (
   <div>
    <Label>{label}</Label>

    <input
      type={type}
      value={input}
      onChange={(e) => setInput(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault()
          addValue()
        }
      }}
      placeholder={placeholder}
      className="w-full rounded-md border px-3 py-2 text-sm"
    />

    {values.length > 0 && (
      <div className="mt-3 flex flex-wrap gap-2">
        {values.map((value, index) => (
          <span
            key={`${value}-${index}`}
            className="flex items-center gap-2 rounded-full bg-sage px-3 py-1 text-sm"
          >
            {value}
            <button
              type="button"
              onClick={() => onChange(values.filter((_, i) => i !== index))}
              className="text-muted-foreground hover:text-destructive"
              aria-label={`Remove ${value}`}
            >
              ×
            </button>
          </span>
        ))}
      </div>
    )}
  </div>
  )
}

export default MultiValueInput;
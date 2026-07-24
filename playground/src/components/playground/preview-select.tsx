import type { ReactNode } from 'react'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export interface PreviewOption {
  value: string
  label: string
  preview?: ReactNode
}

// A labeled select where every option carries a live preview beside its name (e.g. a rendered
// bar style or variant). Reused for any option that is easier to see than to read.
export function PreviewSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: PreviewOption[]
  onChange: (value: string) => void
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs font-normal text-muted-foreground">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger size="sm" className="h-8 w-full text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value} textValue={o.label}>
              <span className="flex flex-1 items-center justify-between gap-4">
                <span>{o.label}</span>
                {o.preview ? <span className="font-mono text-xs whitespace-pre text-muted-foreground">{o.preview}</span> : null}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

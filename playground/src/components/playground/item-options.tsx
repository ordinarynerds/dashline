import type { ReactNode } from 'react'
import {
  BAR_STYLES,
  COLOR_CHOICES,
  COLORS,
  COMMAND_ITEM,
  ICON_CHOICES,
  PERIODS,
  TEXT_ITEM,
  TEXT_STYLES,
  barSample,
  isLabelKind,
  isPercent,
  variantsFor,
  type BarStyle,
  type Item,
  type Period,
  type TextStyle,
  type Variant,
  type ZoneKey,
} from '@/lib/dashline'
import { cn } from '@/lib/utils'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { WidgetTokens } from './widget-tokens'
import { PreviewSelect, type PreviewOption } from './preview-select'
import { usePlaygroundContext } from './context'

function IconPicker({ value, onChange }: { value?: string; onChange: (icon?: string) => void }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">Icon</span>
      <div className="flex flex-wrap gap-1">
        <button
          onClick={() => onChange(undefined)}
          className={cn(
            'grid size-6 place-items-center rounded-md border text-[11px] text-muted-foreground transition-transform hover:scale-110 active:scale-95',
            !value ? 'border-foreground ring-2 ring-ring' : 'border-border',
          )}
          aria-label="no icon"
          title="none"
        >
          –
        </button>
        {ICON_CHOICES.map((g) => (
          <button
            key={g}
            aria-label={`icon ${g}`}
            onClick={() => onChange(g)}
            className={cn(
              'grid size-6 place-items-center rounded-md border font-mono text-[13px] transition-transform hover:scale-110 active:scale-95',
              value === g ? 'border-foreground ring-2 ring-ring' : 'border-border',
            )}
          >
            {g}
          </button>
        ))}
      </div>
    </div>
  )
}

const STYLE_LABELS: Record<TextStyle, { glyph: string; className: string }> = {
  bold: { glyph: 'B', className: 'font-bold' },
  italic: { glyph: 'I', className: 'italic' },
  underline: { glyph: 'U', className: 'underline' },
}

function StyleToggles({ item, onToggle }: { item: Item; onToggle: (key: TextStyle) => void }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">Style</span>
      <div className="flex gap-1">
        {TEXT_STYLES.map((key) => (
          <button
            key={key}
            aria-label={key}
            aria-pressed={!!item[key]}
            title={key}
            onClick={() => onToggle(key)}
            className={cn(
              'grid h-7 w-9 place-items-center rounded-md border font-mono text-sm transition-colors',
              STYLE_LABELS[key].className,
              item[key] ? 'border-foreground bg-accent text-foreground ring-1 ring-ring' : 'border-border text-muted-foreground hover:bg-accent/60',
            )}
          >
            {STYLE_LABELS[key].glyph}
          </button>
        ))}
      </div>
    </div>
  )
}

function ColorSwatches({ value, onChange }: { value?: string; onChange: (c: Item['color']) => void }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">Color</span>
      <div className="flex flex-wrap gap-1.5">
        {COLOR_CHOICES.map((c) => (
          <button
            key={c}
            aria-label={c}
            title={c}
            onClick={() => onChange(c)}
            className={cn(
              'size-6 rounded-md border transition-transform hover:scale-110 active:scale-95',
              value === c ? 'border-foreground ring-2 ring-ring' : 'border-border',
            )}
            style={{ background: COLORS[c] }}
          />
        ))}
        <button
          onClick={() => onChange(undefined)}
          className="grid h-6 place-items-center rounded-md border border-border px-2 text-[11px] text-muted-foreground transition-colors hover:bg-accent"
        >
          Auto
        </button>
      </div>
    </div>
  )
}

// Fixed for the lifetime of the app: built once rather than per item, per render.
const BAR_OPTIONS: PreviewOption[] = [
  { value: 'default', label: 'default', preview: barSample('blocks') },
  ...BAR_STYLES.map((b) => ({ value: b, label: b, preview: barSample(b) })),
]

// Wraps the chip itself as the popover trigger: at this size there is no room for a
// separate control, and clicking the thing you want to change is the obvious gesture.
export function ItemOptions({ li, z, ii, item, children }: { li: number; z: ZoneKey; ii: number; item: Item; children: ReactNode }) {
  const { setOption, settings } = usePlaygroundContext()
  // Bar style and the trend arrow are percent-only; variants are offered by any widget
  // that names some, which now includes the working-tree and delta widgets.
  const percent = isPercent(item.widget)
  const variants = variantsFor(item.widget)
  // dashline prints a command's output verbatim, so none of the presentation options
  // reach it. Offering them would promise something the terminal will not do.
  const isCommand = item.widget === COMMAND_ITEM
  const isText = item.widget === TEXT_ITEM

  // `cost` is the only widget with a window to choose. Previewed rather than listed, because
  // the periods differ in the label they draw as well as the figure.
  const periodOptions: PreviewOption[] = PERIODS.map((p) => ({
    value: p,
    label: p,
    preview: <WidgetTokens id="cost" item={{ widget: 'cost', period: p, variant: item.variant }} theme={settings.theme} />,
  }))

  const variantOptions: PreviewOption[] = [
    { value: 'default', label: 'default', preview: <WidgetTokens id={item.widget} item={{ widget: item.widget }} theme={settings.theme} /> },
    ...variants.map((v) => ({
      value: v,
      label: v,
      preview: <WidgetTokens id={item.widget} item={{ widget: item.widget, variant: v }} theme={settings.theme} />,
    })),
  ]

  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent align="start" className="flex w-72 flex-col gap-4 p-3">
        {(isText || isCommand) && (
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-normal text-muted-foreground">{isText ? 'Text' : 'Command'}</Label>
            <Input
              value={item.text ?? ''}
              onChange={(e) => setOption(li, z, ii, { text: e.target.value })}
              placeholder={isText ? 'text' : 'my-tool --short'}
              className="h-7 font-mono text-xs"
            />
            {isCommand && (
              <p className="text-[11px] leading-snug text-muted-foreground/70">
                Runs in your shell on each refresh, under a 2s timeout. Its first line of output is drawn as-is, so
                colors and variants do not apply. Only commands in your own settings.json run.
              </p>
            )}
          </div>
        )}

        {!isCommand && (
          <>
            <ColorSwatches value={item.color} onChange={(c) => setOption(li, z, ii, { color: c })} />

            <Separator />
          </>
        )}

        {!isText && !isCommand && (
          <>
            <div className="flex items-center justify-between gap-3">
              <Label className="text-xs font-normal text-muted-foreground">Label</Label>
              <Input
                value={item.label ?? ''}
                onChange={(e) => setOption(li, z, ii, { label: e.target.value || undefined })}
                placeholder="none"
                className="h-7 w-32 text-xs"
              />
            </div>

            <Separator />

            <IconPicker value={item.icon} onChange={(icon) => setOption(li, z, ii, { icon })} />

            <Separator />

            <StyleToggles item={item} onToggle={(key) => setOption(li, z, ii, { [key]: !item[key] })} />
          </>
        )}

        {item.widget === 'cost' && (
          <>
            <Separator />
            <PreviewSelect
              label="Period"
              value={item.period ?? 'session'}
              options={periodOptions}
              onChange={(v) => setOption(li, z, ii, { period: v === 'session' ? undefined : (v as Period) })}
            />
          </>
        )}

        {variants.length > 0 && (
          <>
            <Separator />
            <PreviewSelect
              label="Variant"
              value={item.variant ?? 'default'}
              options={variantOptions}
              onChange={(v) => setOption(li, z, ii, { variant: v === 'default' ? undefined : (v as Variant) })}
            />
          </>
        )}

        {/* Only label.ts clips text, so only the widgets it presents can be truncated. */}
        {isLabelKind(item.widget) && (
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 flex-col">
              <Label className="text-muted-foreground text-xs font-normal">Truncate</Label>
              <span className="text-muted-foreground/60 text-[11px]">Max columns</span>
            </div>
            <Input
              type="number"
              min={1}
              value={item.truncate ?? ''}
              onChange={(e) => {
                const n = Number(e.target.value)
                setOption(li, z, ii, { truncate: e.target.value && n > 0 ? n : undefined })
              }}
              placeholder="off"
              className="h-7 w-20 text-xs"
            />
          </div>
        )}

        {percent && (
          <PreviewSelect
            label="Bar style"
            value={item.bar ?? 'default'}
            options={BAR_OPTIONS}
            onChange={(v) => setOption(li, z, ii, { bar: v === 'default' ? undefined : (v as BarStyle) })}
          />
        )}

        {/* Not every percent widget: the arrow compares against session history, and history
            records only the context percentage. There is no series for session or weekly, so
            offering the toggle there would be a switch that does nothing. */}
        {item.widget === 'context' && (
          <div className="flex items-center justify-between gap-3">
            <Label className="text-muted-foreground text-xs font-normal">Trend arrow</Label>
            <Switch checked={!!item.trend} onCheckedChange={(v) => setOption(li, z, ii, { trend: v || undefined })} />
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

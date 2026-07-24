import { GripVertical, X } from 'lucide-react'
import { Draggable } from '@hello-pangea/dnd'
import {
  BAR_STYLES,
  COLOR_CHOICES,
  COLORS,
  ICON_CHOICES,
  TEXT_STYLES,
  VARIANTS,
  WIDGETS,
  barSample,
  colorOf,
  isPercent,
  type BarStyle,
  type Item,
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
import { placedDraggableId } from './dnd'
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

function ItemOptions({ li, z, ii, item }: { li: number; z: ZoneKey; ii: number; item: Item }) {
  const { setOption, settings } = usePlaygroundContext()
  const swatch = item.color ? colorOf(item.color, settings.theme) : undefined
  const percent = isPercent(item.widget)

  const variantOptions: PreviewOption[] = [
    { value: 'default', label: 'default', preview: <WidgetTokens id={item.widget} item={{ widget: item.widget }} theme={settings.theme} /> },
    ...VARIANTS.map((v) => ({
      value: v,
      label: v,
      preview: <WidgetTokens id={item.widget} item={{ widget: item.widget, variant: v }} theme={settings.theme} />,
    })),
  ]

  const barOptions: PreviewOption[] = [
    { value: 'default', label: 'default', preview: barSample('blocks') },
    ...BAR_STYLES.map((b) => ({ value: b, label: b, preview: barSample(b) })),
  ]

  return (
    <Popover>
      <PopoverTrigger
        aria-label="widget options"
        className="size-4 shrink-0 rounded-full border border-border/70 transition-transform active:scale-90"
        style={{ background: swatch ?? 'conic-gradient(#FF5555,#E5B93A,#35D13B,#4EC9D6,#6AA6FF,#C678DD,#FF5555)' }}
      />
      <PopoverContent align="start" className="flex w-72 flex-col gap-4 p-3">
        <ColorSwatches value={item.color} onChange={(c) => setOption(li, z, ii, { color: c })} />

        <Separator />

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

        {percent && (
          <>
            <Separator />
            <PreviewSelect
              label="Variant"
              value={item.variant ?? 'default'}
              options={variantOptions}
              onChange={(v) => setOption(li, z, ii, { variant: v === 'default' ? undefined : (v as Variant) })}
            />
            <PreviewSelect
              label="Bar style"
              value={item.bar ?? 'default'}
              options={barOptions}
              onChange={(v) => setOption(li, z, ii, { bar: v === 'default' ? undefined : (v as BarStyle) })}
            />
            <div className="flex items-center justify-between gap-3">
              <Label className="text-xs font-normal text-muted-foreground">Trend arrow</Label>
              <Switch checked={!!item.trend} onCheckedChange={(v) => setOption(li, z, ii, { trend: v || undefined })} />
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  )
}

// A widget placed in a zone: drag it by the grip to reorder, move to another zone, or move to
// another line. The options popover and remove control stay clickable (only the grip drags).
export function PlacedItem({ li, z, ii, item }: { li: number; z: ZoneKey; ii: number; item: Item }) {
  const { removeItem, settings } = usePlaygroundContext()
  // Unknown names (e.g. a shell command typed into the Code editor) have no widget preview, but
  // still render as a removable chip showing the raw name so they never become stuck in state.
  const known = !!WIDGETS[item.widget]

  return (
    <Draggable draggableId={placedDraggableId(li, z, ii)} index={ii}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={cn(
            'flex h-9 items-center gap-2 rounded-lg border bg-secondary pr-1.5 pl-1.5',
            snapshot.isDragging ? 'border-primary/50 shadow-lg shadow-black/20' : 'border-border',
          )}
        >
          <span
            {...provided.dragHandleProps}
            aria-label={`drag ${item.widget}`}
            className="grid size-6 shrink-0 cursor-grab place-items-center rounded-md text-muted-foreground/50 outline-none transition-colors hover:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing"
          >
            <GripVertical className="size-4" />
          </span>
          <span className="min-w-0 flex-1 overflow-hidden font-mono text-[13px] whitespace-pre">
            {known ? (
              <WidgetTokens id={item.widget} item={item} theme={settings.theme} icons={settings.icons} />
            ) : (
              <span className="text-muted-foreground">{item.widget || '(empty)'}</span>
            )}
          </span>
          <ItemOptions li={li} z={z} ii={ii} item={item} />
          <button
            className="grid size-6 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-destructive"
            onClick={() => removeItem(li, z, ii)}
            aria-label={`remove ${item.widget}`}
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}
    </Draggable>
  )
}

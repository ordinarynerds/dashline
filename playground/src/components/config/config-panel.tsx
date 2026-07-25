import type { ReactNode } from 'react'
import {
  THEME_NAMES,
  colorOf,
  effectiveThreshold,
  previewScenario,
  resolveThresholds,
  type ColorName,
  type ThresholdKey,
} from '@/lib/dashline'
import { costOf } from '@/lib/cost'
import { cn } from '@/lib/utils'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { DialSlider } from '@/components/ui/dial-slider'
import { PREVIEW_TYPE, WidgetTokens } from '@/components/playground/widget-tokens'
import { usePlaygroundContext } from '@/components/playground/context'

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-[11px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">{title}</h3>
      {children}
    </div>
  )
}

function Field({ label, hint, control }: { label: string; hint?: string; control: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 flex-col">
        <Label className="text-sm font-normal">{label}</Label>
        {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
      </div>
      {control}
    </div>
  )
}

// The named colors a theme actually remaps, in the order they read best as a strip.
const THEME_PREVIEW: ColorName[] = ['red', 'yellow', 'green', 'cyan', 'blue', 'magenta']

// A theme is a palette, so the palette is the label. The name alone tells you nothing about
// what picking it will do.
function ThemeChoice({ theme, active, onSelect }: { theme: string; active: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      className={cn(
        'flex flex-col gap-1.5 rounded-md border px-2 py-1.5 text-left transition-colors',
        active ? 'border-foreground bg-accent' : 'border-border hover:bg-accent/50',
      )}
    >
      {/* A hairline of each colour rather than a block. Six saturated swatches × six themes was
          the brightest region of the whole screen, and none of it carries state — it was
          out-shouting the status line it exists to describe. */}
      <span className="flex gap-px overflow-hidden rounded-[2px]">
        {THEME_PREVIEW.map((c) => (
          <span key={c} className="h-1.5 flex-1" style={{ background: colorOf(c, theme) }} />
        ))}
      </span>
      <span className={cn('text-xs', active ? 'text-foreground' : 'text-muted-foreground')}>{theme || 'none'}</span>
    </button>
  )
}

// The strip under a control, showing the widget it governs rendered at the value being set.
// A threshold is a colour boundary, so the only way to explain it is to show the colour.
function Preview({ children }: { children: ReactNode }) {
  return (
    <div className={cn(PREVIEW_TYPE, 'overflow-hidden border border-white/10 bg-black px-2 py-1')}>
      {children}
    </div>
  )
}

// A threshold moves a widget from green to yellow to red. Drawing that widget *at* the
// threshold shows exactly where the boundary lands.
function ThresholdField({ label, k, widget }: { label: string; k: ThresholdKey; widget: 'context' | 'session' }) {
  const { settings, setThreshold } = usePlaygroundContext()
  const value = settings[k]
  const scenario = previewScenario(effectiveThreshold(settings, k))

  return (
    <div className="flex flex-col gap-1.5">
      <DialSlider
        label={label}
        value={value}
        onChange={(v) => setThreshold(k, v)}
        min={0}
        max={100}
        step={5}
        unit="%"
      />
      <Preview>
        <WidgetTokens id={widget} scenario={scenario} thresholds={resolveThresholds(settings)} theme={settings.theme} />
      </Preview>
    </div>
  )
}

// Every dashline setting, grouped. Used inside both the desktop config sidebar and the mobile
// sheet.
export function ConfigPanel() {
  const { settings, setTheme, toggle, setSeparator, setMargin } = usePlaygroundContext()

  return (
    <div className="flex flex-col gap-7">
      <Section title="Appearance">
        <div className="flex flex-col gap-2">
          <Label className="text-sm font-normal">Theme</Label>
          <div className="grid grid-cols-2 gap-1.5">
            {THEME_NAMES.map((t) => (
              <ThemeChoice key={t || 'none'} theme={t} active={settings.theme === t} onSelect={() => setTheme(t)} />
            ))}
          </div>
        </div>
        <Field label="Powerline" hint="Segmented backgrounds" control={<Switch checked={settings.powerline} onCheckedChange={() => toggle('powerline')} />} />
        <Field label="Icons" hint="Nerd Font glyphs" control={<Switch checked={settings.icons} onCheckedChange={() => toggle('icons')} />} />
      </Section>

      <Separator />

      <Section title="Spacing">
        <Field
          label="Separator"
          hint="Between widgets"
          control={<Input value={settings.separator} onChange={(e) => setSeparator(e.target.value)} placeholder=" · " className="h-8 w-24 font-mono" />}
        />
        <div className="flex flex-col gap-1.5">
          <DialSlider label="Margin" value={settings.margin} onChange={setMargin} min={0} max={8} step={1} unit="col" />
          {/* Margin is columns kept free at the right edge, so the preview shows the right
              zone pushed off the edge by exactly that many characters. */}
          <Preview>
            <span className="flex justify-end">
              <WidgetTokens id="weekly" theme={settings.theme} />
              <span
                aria-hidden
                className="ml-px shrink-0 bg-[repeating-linear-gradient(45deg,rgba(255,255,255,0.18)_0_2px,transparent_2px_4px)]"
                style={{ width: `${settings.margin}ch` }}
              />
            </span>
          </Preview>
        </div>
      </Section>

      <Separator />

      <Section title="Context thresholds">
        <ThresholdField label="Warning" k="contextWarningAt" widget="context" />
        <ThresholdField label="Critical" k="contextCriticalAt" widget="context" />
      </Section>

      <Separator />

      <Section title="Usage thresholds">
        <ThresholdField label="Warning" k="usageWarningAt" widget="session" />
        <ThresholdField label="Critical" k="usageCriticalAt" widget="session" />
      </Section>

      <Separator />

      <CostSection />
    </div>
  )
}

// What the current line costs to draw. dashline gates its subprocesses on what the placed
// widgets ask for, and the gating is not visible in the config: three git widgets can share one
// read, while a fourth adds a second. This is the screen where those choices get made.
function CostSection() {
  const { lines } = usePlaygroundContext()
  const cost = costOf(lines)
  const total = cost.git + cost.commands

  return (
    <Section title="Per refresh">
      <div className="flex flex-col gap-2">
        <div className="flex items-baseline gap-1.5">
          <span className="font-mono text-2xl leading-none tabular-nums">{total}</span>
          <span className="text-muted-foreground text-xs">
            {total === 1 ? 'subprocess' : 'subprocesses'}
            {total === 0 ? ' — nothing is spawned' : ''}
          </span>
        </div>
        {cost.detail.length > 0 && (
          <ul className="text-muted-foreground/70 flex flex-col gap-1 text-[11px] leading-snug">
            {cost.detail.map((d) => (
              <li key={d} className="flex gap-1.5">
                <span aria-hidden className="text-muted-foreground/40">
                  ·
                </span>
                <span>{d}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Section>
  )
}

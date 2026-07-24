import type { ReactNode } from 'react'
import { THEME_NAMES, type ThresholdKey } from '@/lib/dashline'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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

function ThresholdField({ label, k }: { label: string; k: ThresholdKey }) {
  const { settings, setThreshold } = usePlaygroundContext()
  const value = settings[k]
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-normal">{label}</Label>
        <span className="font-mono text-xs text-muted-foreground">{value > 0 ? `${value}%` : 'default'}</span>
      </div>
      <Slider value={[value]} min={0} max={100} step={5} onValueChange={([v]) => setThreshold(k, v)} />
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
        <Field
          label="Theme"
          control={
            <Select value={settings.theme || 'none'} onValueChange={(v) => setTheme(v === 'none' ? '' : v)}>
              <SelectTrigger size="sm" className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {THEME_NAMES.map((t) => (
                  <SelectItem key={t || 'none'} value={t || 'none'}>
                    {t || 'none'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          }
        />
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
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-normal">Margin</Label>
            <span className="font-mono text-xs text-muted-foreground">{settings.margin}</span>
          </div>
          <Slider value={[settings.margin]} min={0} max={8} step={1} onValueChange={([v]) => setMargin(v)} />
        </div>
      </Section>

      <Separator />

      <Section title="Context thresholds">
        <ThresholdField label="Warning" k="contextWarningAt" />
        <ThresholdField label="Critical" k="contextCriticalAt" />
      </Section>

      <Separator />

      <Section title="Usage thresholds">
        <ThresholdField label="Warning" k="usageWarningAt" />
        <ThresholdField label="Critical" k="usageCriticalAt" />
      </Section>
    </div>
  )
}

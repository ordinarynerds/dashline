export type Datum = Percent | Duration | Money | Delta | Label | Flag

// Trimmings any datum can carry, whatever its kind. A glyph in front and a word in front are
// not properties of being a percentage or a sum of money, so they are not the business of the
// presenter that knows how to draw one — present() applies these for every kind, and a widget
// only supplies the defaults. `label` here is the widget's own; `opts.label` overrides it.
export interface Chrome {
  icon?: string
  iconColor?: string
  label?: string
}

export interface Percent extends Chrome {
  kind: 'percent'
  value: number
  scale: 'context' | 'usage'
  reset?: number
  tokens?: { used: number; size: number }
  hint?: boolean
  defaultBar?: boolean
}

export interface Duration extends Chrome {
  kind: 'duration'
  ms: number
}

export interface Money extends Chrome {
  kind: 'money'
  usd: number
  // Trails the amount, so a rate reads "$4.10/h" through the same presentations.
  suffix?: string
}

export interface Delta extends Chrome {
  kind: 'delta'
  added: number
  removed: number
}

export interface Label extends Chrome {
  kind: 'label'
  text: string
  color?: string
}

export interface Flag extends Chrome {
  kind: 'flag'
  on: boolean
  // The word the flag prints when it is on. Named `text` rather than `label` because `label`
  // is chrome that goes *in front* of a datum, and a flag's word is the datum itself.
  text: string
}

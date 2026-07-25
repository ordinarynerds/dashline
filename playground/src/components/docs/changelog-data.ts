// The changelog, parsed from the repo's CHANGELOG.md by vite.config.ts. Typed here so the pages
// see a real shape rather than the raw injected global.

export interface ChangeItem {
  text: string
  sha?: string
  url?: string
}

export interface ChangeGroup {
  title: string
  items: ChangeItem[]
}

export interface Release {
  version: string
  date: string
  compare: string | null
  groups: ChangeGroup[]
}

export const RELEASES: Release[] = __DASHLINE_CHANGELOG__

// release-please writes "Features" and "Bug Fixes". Anything else it emits passes through as
// written rather than being dropped or renamed.
//
// Drawn from dashline's own palette, and deliberately not coral: coral is the app's single signal
// colour, and half a changelog's headings are "Bug Fixes".
export const GROUP_TONE: Record<string, string> = {
  Features: 'text-[#35d13b]',
  'Bug Fixes': 'text-[#E5B93A]',
  'Performance Improvements': 'text-[#4ec9d6]',
}

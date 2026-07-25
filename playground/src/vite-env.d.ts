/// <reference types="vite/client" />

// Injected by vite.config.ts from the root package.json, so the About page reports the released
// version rather than a hardcoded one that goes stale on the next release.
declare const __DASHLINE_VERSION__: string

// The repo's CHANGELOG.md, parsed at build time. Same reason: release-please owns the file, the
// site reads it, and there is no second copy to forget.
declare const __DASHLINE_CHANGELOG__: {
  version: string
  date: string
  compare: string | null
  groups: { title: string; items: { text: string; sha?: string; url?: string }[] }[]
}[]

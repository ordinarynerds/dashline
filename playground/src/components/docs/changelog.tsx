import { GROUP_TONE, RELEASES, type Release } from './changelog-data'
import { ReleaseBanner } from './release-banner'
import { DocPage } from './doc-page'

// One release. The version and date sit in a left rail so the whole history reads as a timeline
// rather than a stack of headings — you can scan down the versions without reading the entries.
function ReleaseEntry({ release, latest }: { release: Release; latest: boolean }) {
  return (
    <section className="grid gap-x-6 gap-y-3 border-t pt-6 sm:grid-cols-[9rem_minmax(0,1fr)]">
      <header className="flex flex-col gap-1 sm:sticky sm:top-20 sm:self-start">
        <div className="flex items-baseline gap-2">
          <h2 className="font-mono text-sm font-medium">v{release.version}</h2>
          {latest && (
            <span className="rounded-sm bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold tracking-[0.1em] text-primary uppercase">
              Latest
            </span>
          )}
        </div>
        <time className="font-mono text-xs text-muted-foreground">{release.date}</time>
        {release.compare && (
          <a
            href={release.compare}
            target="_blank"
            rel="noreferrer"
            className="w-fit text-xs text-muted-foreground underline decoration-muted-foreground/30 underline-offset-4 transition-colors duration-150 ease-[var(--ease-out)] hover:text-foreground hover:decoration-foreground/60"
          >
            Compare
          </a>
        )}
      </header>

      <div className="flex flex-col gap-4">
        {release.groups.map((group) => (
          <div key={group.title} className="flex flex-col gap-1.5">
            <h3
              className={`text-[11px] font-semibold tracking-[0.12em] uppercase ${GROUP_TONE[group.title] ?? 'text-muted-foreground'}`}
            >
              {group.title}
            </h3>
            <ul className="flex flex-col gap-1.5">
              {group.items.map((item) => (
                <li key={item.text} className="flex gap-2 text-sm leading-relaxed text-foreground/75">
                  {/* Centred on the first line box, not hung above it — at 0.45em the dot read as a
                      superscript asterisk rather than a bullet. */}
                  <span aria-hidden className="mt-[0.62em] size-1 shrink-0 rounded-full bg-foreground/30" />
                  <span className="min-w-0">
                    {item.scope && (
                      <span className="mr-1.5 font-mono text-xs text-muted-foreground/70">{item.scope}</span>
                    )}
                    {item.text}
                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="ml-1.5 font-mono text-xs text-muted-foreground/70 transition-colors duration-150 ease-[var(--ease-out)] hover:text-foreground"
                      >
                        {item.sha}
                      </a>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}

export function Changelog() {
  const [latest] = RELEASES

  return (
    <DocPage
      title="Changelog"
      lead="Every release, generated from the commits that shipped it. Versions follow semver; the plugin can update itself."
      width="list"
      next={{ to: '/build', title: 'Build your status line', hint: 'Try the widgets from the latest release' }}
    >
      {latest && <ReleaseBanner release={latest} total={RELEASES.length} />}

      <div className="flex flex-col gap-8">
        {RELEASES.map((release, i) => (
          <ReleaseEntry key={release.version} release={release} latest={i === 0} />
        ))}
      </div>
    </DocPage>
  )
}

import { COMMAND_ITEM, ZONES, type Line } from './dashline'

// What a status line costs to draw, mirroring scan.ts and util/git.ts.
//
// dashline gates its subprocesses on what the placed widgets actually ask for, and the gating
// is not obvious from the config: `dirty`, `sync` and `stash` share one read between them, and
// `branch` folds into that read for free — but add `worktree` to a line that already needs a
// status and it costs a second. The builder is where those choices get made, so it is where
// the number belongs.

// The probes each widget declares in its own `needs`. Keys must stay in step with the widget
// modules in src/widgets — a widget missing here is counted as free, which is the safe error
// only because a widget with no needs genuinely is.
const NEEDS: Record<string, Partial<Record<'branch' | 'status' | 'diff' | 'worktree' | 'sha' | 'history' | 'ledger', boolean>>> = {
  branch: { branch: true },
  worktree: { worktree: true },
  sha: { sha: true },
  dirty: { status: true },
  sync: { status: true },
  stash: { status: true },
  diff: { diff: true },
  burn: { history: true },
  spend: { ledger: true },
}

// A command item gets the branch and the worktree exported into its environment, so it pulls
// those probes in whether or not any widget asked for them.
const COMMAND_NEEDS = { branch: true, worktree: true }

export interface Cost {
  /** git subprocesses per refresh. */
  git: number
  /** shell commands per refresh, one per command item. */
  commands: number
  /** Whether anything reads state from disk — the session history file or the spend ledger. */
  history: boolean
  /** Plain-English reasons, in the order the probes run. */
  detail: string[]
}

export function costOf(lines: Line[]): Cost {
  const needs: Record<string, boolean> = {}
  let commands = 0

  for (const line of lines) {
    for (const z of ZONES) {
      for (const item of line[z]) {
        if (item.widget === COMMAND_ITEM) {
          if (item.text) commands++
          Object.assign(needs, COMMAND_NEEDS)
          continue
        }
        Object.assign(needs, NEEDS[item.widget])
      }
    }
  }

  // readGit's own arithmetic: one porcelain status carries the branch, the sha, ahead/behind,
  // the file counts and the stash depth, so anything it already answered costs nothing more.
  // Whatever is left over comes from a single rev-parse, and a diff is its own read.
  const detail: string[] = []
  let git = 0

  if (needs.status) {
    git++
    detail.push('one `git status` — working tree, ahead/behind, stash, branch and HEAD together')
  }
  const head = (needs.branch && !needs.status) || (needs.sha && !needs.status) || needs.worktree
  if (head) {
    git++
    detail.push(
      needs.status
        ? 'one `git rev-parse` — the worktree, which the status read does not report'
        : 'one `git rev-parse` — branch, HEAD and worktree in a single call',
    )
  }
  if (needs.diff) {
    git++
    detail.push('one `git diff --shortstat` — lines added and removed')
  }
  if (commands) detail.push(`${commands} shell command${commands > 1 ? 's' : ''} of your own`)
  if (needs.history) detail.push('the session history file, read from disk rather than spawned')
  if (needs.ledger) detail.push('the weekly spend ledger, one small file read and rewritten')

  return { git, commands, history: Boolean(needs.history || needs.ledger), detail }
}

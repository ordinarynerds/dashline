import { execFileSync } from 'node:child_process'
import { basename } from 'node:path'

export interface GitInfo {
  branch?: string
  worktree?: string
  sha?: string
  ahead?: number
  behind?: number
  staged?: number
  unstaged?: number
  untracked?: number
  conflicts?: number
  stash?: number
  added?: number
  removed?: number
}

// Which probes the config actually needs. Each one is a process spawn on every refresh,
// so nothing runs unless a widget asked for it.
export interface GitNeeds {
  branch?: boolean
  status?: boolean
  diff?: boolean
  worktree?: boolean
  sha?: boolean
}

export function readGit(dir: string | undefined, worktreeHint?: string, needs: GitNeeds = {}): GitInfo {
  if (!dir) return {}

  // `status` supersedes the head lookup: one porcelain read carries the branch, the head
  // sha, ahead/behind, the file counts, and the stash depth.
  let info: GitInfo = {}
  if (needs.status) {
    const status = readStatus(dir)
    if (!status) return {}
    info = status
  }

  // Everything the porcelain read did not answer comes from a single rev-parse.
  const head: GitNeeds = {
    branch: needs.branch && !needs.status,
    sha: needs.sha && !needs.status,
    worktree: needs.worktree && !worktreeHint,
  }
  if (head.branch || head.sha || head.worktree) {
    const read = readHead(dir, head)
    if (!read) return needs.status ? info : {}
    info = { ...info, ...read }
  }

  if (needs.diff) Object.assign(info, readDiff(dir))
  if (worktreeHint) info.worktree = worktreeHint

  return info
}

// `git status --porcelain=v2` is a stable machine-readable format; v2 adds the branch
// header that v1 lacks. --no-renames skips rename detection, which we never read.
function readStatus(dir: string): GitInfo | null {
  // --no-optional-locks keeps `status` from refreshing and rewriting the index on every
  // refresh, which would mean recurring disk writes and lock contention with whatever git
  // the user is running in the foreground.
  const out = run(dir, ['--no-optional-locks', 'status', '--porcelain=v2', '--branch', '--show-stash', '--no-renames'])
  if (out === undefined) return null
  return parseStatus(out)
}

export function parseStatus(out: string): GitInfo {
  const info: GitInfo = { staged: 0, unstaged: 0, untracked: 0, conflicts: 0, stash: 0 }
  let detached = false

  for (const line of out.split('\n')) {
    if (line.startsWith('# branch.oid ')) {
      const oid = line.slice(13)
      if (oid !== '(initial)') info.sha = oid.slice(0, 7)
    } else if (line.startsWith('# branch.head ')) {
      const head = line.slice(14)
      if (head === '(detached)') detached = true
      else info.branch = head
    } else if (line.startsWith('# branch.ab ')) {
      // Only emitted when the branch has an upstream, so no upstream leaves both unset
      // and the sync widget hides rather than claiming "in sync".
      const m = /^\+(\d+) -(\d+)$/.exec(line.slice(12))
      if (m) {
        info.ahead = Number(m[1])
        info.behind = Number(m[2])
      }
    } else if (line.startsWith('# stash ')) {
      info.stash = Number(line.slice(8)) || 0
    } else if (line.startsWith('1 ') || line.startsWith('2 ')) {
      // XY: X is the index status, Y the worktree status, '.' meaning unchanged. A file
      // staged and then edited again counts once on each side, which is the intent.
      if (line[2] !== '.') info.staged!++
      if (line[3] !== '.') info.unstaged!++
    } else if (line.startsWith('u ')) {
      info.conflicts!++
    } else if (line.startsWith('? ')) {
      info.untracked!++
    }
  }

  // Match the plain-branch behaviour: a detached head reads as its short sha.
  if (detached) info.branch = info.sha ?? 'HEAD'
  return info
}

// The cheap path, for a config that wants no working-tree state. One rev-parse answers
// every part of it: a plain rev has to come before `--abbrev-ref`, which stays in effect
// for each rev after it, and the worktree paths ride along on the end. `--short` cannot be
// mixed in, so the sha comes back full and is trimmed here the same way parseStatus does.
function readHead(dir: string, needs: GitNeeds): GitInfo | null {
  const args = ['rev-parse']
  const fields: ('sha' | 'branch' | 'gitDir' | 'top')[] = []
  // The two travel together: a detached head reads as its sha, and asking for both costs
  // nothing extra inside the one call.
  const wantHead = needs.branch || needs.sha

  if (wantHead) {
    args.push('HEAD', '--abbrev-ref', 'HEAD')
    fields.push('sha', 'branch')
  }
  if (needs.worktree) {
    args.push('--absolute-git-dir', '--show-toplevel')
    fields.push('gitDir', 'top')
  }

  const out = run(dir, args)
  if (out === undefined) return null
  const lines = out.split('\n')
  const at = (f: (typeof fields)[number]) => lines[fields.indexOf(f)]

  const info: GitInfo = {}
  if (wantHead) {
    const sha = at('sha')?.slice(0, 7)
    if (needs.sha) info.sha = sha
    const head = at('branch')
    if (head) info.branch = head === 'HEAD' ? (sha ?? 'HEAD') : head
  }
  // A linked worktree keeps its git dir under the main repo's `worktrees/`.
  if (needs.worktree && at('gitDir')?.includes('/worktrees/')) {
    const top = at('top')
    if (top) info.worktree = basename(top)
  }
  return info
}

// Staged and unstaged changes are both work in progress, so the diff is taken against
// HEAD rather than the index. A repo with no commits has no HEAD and yields nothing.
function readDiff(dir: string): Pick<GitInfo, 'added' | 'removed'> {
  const out = run(dir, ['diff', '--shortstat', 'HEAD'])
  if (!out) return {}
  return {
    added: Number(/(\d+) insertion/.exec(out)?.[1] ?? 0),
    removed: Number(/(\d+) deletion/.exec(out)?.[1] ?? 0),
  }
}

function run(dir: string, args: string[]): string | undefined {
  try {
    return execFileSync('git', ['-C', dir, ...args], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
      // A status line must not hang the prompt: a slow or enormous repo yields nothing
      // rather than a stalled render.
      timeout: 1000,
      maxBuffer: 8 * 1024 * 1024,
    }).trim()
  } catch {
    return undefined
  }
}

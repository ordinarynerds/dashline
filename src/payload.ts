export interface Payload {
  model?: { id?: string; display_name?: string }
  cwd?: string
  workspace?: {
    current_dir?: string
    project_dir?: string
    git_worktree?: string
    repo?: { host?: string; owner?: string; name?: string }
  }
  context_window?: {
    total_input_tokens?: number
    context_window_size?: number
    used_percentage?: number
    current_usage?: { input_tokens?: number }
  }
  cost?: {
    total_cost_usd?: number
    total_duration_ms?: number
    total_lines_added?: number
    total_lines_removed?: number
  }
  rate_limits?: {
    five_hour?: RateWindow
    seven_day?: RateWindow
  }
  effort?: { level?: string }
  session_name?: string
  output_style?: { name?: string }
  pr?: { number?: number; url?: string; review_state?: string }
  version?: string
  fast_mode?: boolean
  thinking?: { enabled?: boolean }
  vim?: { mode?: string }
  agent?: { name?: string }
}

export interface RateWindow {
  used_percentage?: number
  resets_at?: number
}

export function parsePayload(raw: string): Payload {
  try {
    return JSON.parse(raw) as Payload
  } catch {
    return {}
  }
}

import { ClaudeMessage } from '@/components/brainless/claude/claude-message'
import { ClaudeToolCall } from '@/components/brainless/claude/claude-tool-call'

// A fake Claude Code session shown above the status line, so the preview reads like a real
// terminal. Decorative only; the content is dashline-themed for flavor.
function Bullet() {
  return (
    <span aria-hidden className="text-[#4ea96f]">
      ⏺{' '}
    </span>
  )
}

export function TerminalScrollback() {
  return (
    <div className="flex flex-col gap-2">
      <ClaudeMessage role="user">add burn to the right zone and show session as a bar</ClaudeMessage>
      <ClaudeMessage>
        <Bullet />
        I'll add the <span className="text-[#7dcfff]">burn</span> widget and switch{' '}
        <span className="text-[#7dcfff]">session</span> to a bar. Updating your settings now.
      </ClaudeMessage>
      <ClaudeToolCall tool="Read" arg="~/.claude/settings.json" result="8 lines" />
      <ClaudeToolCall tool="Update" arg="~/.claude/settings.json" result="dashline.lines[0] · +burn · session → bar" />
      <ClaudeMessage>
        <Bullet />
        Done. <span className="text-[#7dcfff]">burn</span> projects time to <span className="text-[#e0af68]">/compact</span>, and{' '}
        <span className="text-[#7dcfff]">session</span> now renders as a bar. Start a new session to see it.
      </ClaudeMessage>
    </div>
  )
}

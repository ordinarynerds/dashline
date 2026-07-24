import { Check, Copy, Link2, Sparkles } from 'lucide-react'
import { configPrompt, toConfig } from '@/lib/dashline'
import { SHARE_PARAM, encodeShareState } from '@/lib/share'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useClipboard } from '@/hooks/use-clipboard'
import { usePlaygroundContext } from './context'

// Three ways to take the current config: copy the raw settings.json, copy a prompt that has
// Claude Code set it up for you, or copy a shareable link that reopens this exact build.
function shareUrl(param: string): string {
  const url = new URL(window.location.href)
  url.searchParams.set(SHARE_PARAM, param)
  return url.toString()
}

export function ConfigActions() {
  const { settings, lines } = usePlaygroundContext()
  const json = useClipboard()
  const prompt = useClipboard()
  const share = useClipboard()

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" className="gap-1.5 transition-transform active:scale-[0.97]" onClick={() => json.copy(toConfig(settings, lines))}>
        {json.copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
        {json.copied ? 'Copied' : 'Copy JSON'}
      </Button>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1.5 transition-transform active:scale-[0.97]" onClick={() => prompt.copy(configPrompt(settings, lines))}>
            {prompt.copied ? <Check className="size-3.5" /> : <Sparkles className="size-3.5" />}
            {prompt.copied ? 'Copied' : 'Copy Prompt'}
          </Button>
        </TooltipTrigger>
        <TooltipContent className="max-w-56 text-center">
          Copies a prompt you can paste into Claude Code to set up this status line.
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button size="sm" className="gap-1.5 transition-transform active:scale-[0.97]" onClick={() => share.copy(shareUrl(encodeShareState(settings, lines)))}>
            {share.copied ? <Check className="size-3.5" /> : <Link2 className="size-3.5" />}
            {share.copied ? 'Link copied' : 'Share'}
          </Button>
        </TooltipTrigger>
        <TooltipContent className="max-w-56 text-center">
          Copies a link that reopens this exact layout — handy for sharing or saving.
        </TooltipContent>
      </Tooltip>
    </div>
  )
}

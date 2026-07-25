import { useState } from 'react'
import { Check, ClipboardPaste, Copy, Link2, Sparkles } from 'lucide-react'
import { configPrompt, parseConfig, toConfig } from '@/lib/dashline'
import { SHARE_PARAM, encodeShareState } from '@/lib/share'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useClipboard } from '@/hooks/use-clipboard'
import { usePlaygroundContext } from './context'

// Ways in and out of a build. The order and the weight are the argument: Import is an input and
// sits apart on the left; the three outputs run left to right from least to most finishing, and
// only the last one is loud.
//
// Copy JSON is the primary because it is the artefact — the block that goes into settings.json,
// which is the path the docs describe and the one that needs no trust in anything else. The
// brand spends exactly one loud colour, so it goes on the action that ends the task rather than
// on Share, which helps somebody who is not in the room.
function shareUrl(param: string): string {
  const url = new URL(window.location.href)
  url.searchParams.set(SHARE_PARAM, param)
  return url.toString()
}

// Paste a settings.json and carry on from it. The Code tab already parses what you type, but
// only if you find it and edit in place — which is no use to someone who already runs dashline
// and wants to start from the config they have rather than from the default.
function ImportConfig() {
  const { setAll } = usePlaygroundContext()
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [error, setError] = useState<string | null>(null)

  function submit() {
    const result = parseConfig(text)
    if (!result.ok) return setError(result.error)
    setAll(result.settings, result.lines)
    setOpen(false)
    setText('')
    setError(null)
  }

  return (
    <Popover
      open={open}
      onOpenChange={(o) => {
        setOpen(o)
        if (!o) setError(null)
      }}
    >
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="text-muted-foreground gap-1.5 transition-transform active:scale-[0.97]">
          <ClipboardPaste className="size-3.5" /> Import
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="flex w-96 flex-col gap-2 p-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-medium">Import a config</span>
          <span className="text-muted-foreground text-[11px]">
            Paste your <code className="font-mono">settings.json</code>, or just the{' '}
            <code className="font-mono">dashline</code> block. Anything else in the file is ignored.
          </span>
        </div>
        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value)
            setError(null)
          }}
          spellCheck={false}
          rows={8}
          placeholder={'{\n  "dashline": {\n    "lines": [ … ]\n  }\n}'}
          className="scrollbar-slim focus-visible:border-ring focus-visible:ring-ring/50 resize-none rounded-md border bg-black p-2 font-mono text-[11px] leading-relaxed outline-none focus-visible:ring-2"
        />
        {error && <p className="text-[11px] text-[#ff5555]">{error}</p>}
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button size="sm" disabled={!text.trim()} onClick={submit}>
            Import
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export function ConfigActions() {
  const { settings, lines } = usePlaygroundContext()
  const json = useClipboard()
  const prompt = useClipboard()
  const share = useClipboard()

  return (
    <div className="flex items-center gap-1.5">
      <ImportConfig />

      <Separator orientation="vertical" className="mx-0.5 !h-4" />

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="sm" className="text-muted-foreground gap-1.5 transition-transform active:scale-[0.97]" onClick={() => share.copy(shareUrl(encodeShareState(settings, lines)))}>
            {share.copied ? <Check className="size-3.5" /> : <Link2 className="size-3.5" />}
            {share.copied ? 'Link copied' : 'Share'}
          </Button>
        </TooltipTrigger>
        <TooltipContent className="max-w-56 text-center">
          Copies a link that reopens this exact layout — handy for sharing or saving.
        </TooltipContent>
      </Tooltip>

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

      <Button size="sm" className="gap-1.5 transition-transform active:scale-[0.97]" onClick={() => json.copy(toConfig(settings, lines))}>
        {json.copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
        {json.copied ? 'Copied' : 'Copy JSON'}
      </Button>
    </div>
  )
}

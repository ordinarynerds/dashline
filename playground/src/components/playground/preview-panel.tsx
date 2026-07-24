import { Code2, Eye, RotateCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TerminalPreview } from './terminal-preview'
import { PreviewControls } from './preview-controls'
import { ConfigOutput } from './config-output'
import { ConfigActions } from './config-actions'
import { usePreviewStore } from '@/hooks/use-preview-store'

// The live output, shown one view at a time: Preview is the terminal mock, Code is the
// settings.json it produces. A single toggle switches between them so each gets the full width.
export function PreviewPanel() {
  const setIndex = usePreviewStore((s) => s.setIndex)

  return (
    <div className="flex flex-col gap-3">
      <div>
        <h2 className="text-sm font-semibold">Preview</h2>
        <p className="text-xs text-muted-foreground">Sample data, below Claude Code's prompt</p>
      </div>

      <Tabs defaultValue="preview" className="h-[400px] gap-0 overflow-hidden rounded-xl border">
        <div className="flex flex-wrap items-center gap-2 border-b bg-muted/30 px-2 py-1.5">
          <TabsList variant="line" className="h-7">
            <TabsTrigger value="preview" className="gap-1.5 px-2">
              <Eye className="size-3.5" /> Preview
            </TabsTrigger>
            <TabsTrigger value="code" className="gap-1.5 px-2">
              <Code2 className="size-3.5" /> Code
            </TabsTrigger>
          </TabsList>
          <Button variant="ghost" size="icon-xs" onClick={() => setIndex(0)} aria-label="restart preview from the first state">
            <RotateCw />
          </Button>
          <span className="flex-1" />
          <ConfigActions />
        </div>

        <TabsContent value="preview" className="flex min-h-0 flex-col">
          <PreviewControls />
          <div className="min-h-0 flex-1">
            <TerminalPreview />
          </div>
        </TabsContent>
        <TabsContent value="code" className="min-h-0">
          <ConfigOutput />
        </TabsContent>
      </Tabs>
    </div>
  )
}

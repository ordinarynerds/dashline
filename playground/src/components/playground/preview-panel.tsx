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
    // No heading here. The page header already says "Build your status line"; repeating it as
    // "Status line" 60px below cost 44px of vertical space and told nobody anything. The hint
    // stays, because the drag direction is the one thing the layout does not explain itself.
    <div className="flex h-full min-h-0 flex-col gap-2">
      <p className="text-muted-foreground/70 text-xs">
        Drag widgets up from the library onto the line, or click one to add it. Click a placed widget to change it.
      </p>

      <Tabs defaultValue="preview" className="min-h-[420px] flex-1 gap-0 overflow-hidden rounded-xl border lg:min-h-0">
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

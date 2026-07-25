
import type React from 'react'
import { Draggable, Droppable } from '@hello-pangea/dnd'
import {
  POWERLINE_BG,
  SCENARIOS,
  ZONE_LABELS,
  ZONES,
  colorOf,
  lineColumns,
  resolveThresholds,
  type Item,
  type Line,
  type Scenario,
  type PctThresholds,
  type Settings,
  type ZoneKey,
} from '@/lib/dashline'
import { cn } from '@/lib/utils'
import { ClaudePrompt } from '@/components/brainless/claude/claude-prompt'
import { WidgetTokens } from './widget-tokens'
import { SOLO_ZONE, ZONE_BOX, isSolo, lineBox, separatorOf } from './line-geometry'
import { ItemOptions } from './item-options'
import { TerminalScrollback } from './terminal-scrollback'
import { usePlaygroundContext } from './context'
import { usePreviewStore } from '@/hooks/use-preview-store'
import { useEditorUi } from '@/hooks/use-editor-ui'
import { LINES_DROPPABLE, LINE_TYPE, lineDraggableId, placedDraggableId, zoneDroppableId } from './dnd'

// Ghost the scrollback with a full-height ramp: near-invisible up top, only the last lines
// readable, so the status line and input at the bottom are what the eye lands on first. The
// ramp stays flat through the first third so that wherever the box happens to clip a line, it
// clips one that has already faded out — a half-height glyph at full strength reads as broken,
// the same glyph at nothing reads as scrollback continuing above.
const FADE = 'linear-gradient(to bottom, transparent 0%, transparent 22%, rgba(0,0,0,0.10) 58%, #000 100%)'

// Editing chrome drawn in the terminal's own vocabulary: square corners, hairline rules,
// and inverse-video selection — no rounding, no glow, nothing that reads as a web app
// pasted over a console. Outlines are used rather than borders so none of it costs layout;
// the line's measured width is the same revealed or not.
const ZONE_EDGE = 'outline-1 outline-dashed outline-white/20'
const ZONE_EDGE_OVER = 'outline-1 outline-solid outline-[#4ec9d6] bg-[#4ec9d6]/10'

// Faded rather than display:none, so a gutter control keeps its place in the tab order —
// a keyboard user can never hover to reveal it.
const GUTTER_REVEAL =
  'pointer-events-none opacity-0 focus-visible:pointer-events-auto focus-visible:opacity-100 ' +
  'group-hover/line:pointer-events-auto group-hover/line:opacity-100 ' +
  'group-focus-within/line:pointer-events-auto group-focus-within/line:opacity-100'

function Token({ item, settings, scenario, thresholds }: { item: Item; settings: Settings; scenario: Scenario; thresholds: PctThresholds }) {
  return <WidgetTokens id={item.widget} item={item} theme={settings.theme} icons={settings.icons} scenario={scenario} thresholds={thresholds} />
}

interface ItemProps {
  li: number
  z: ZoneKey
  ii: number
  item: Item
  settings: Settings
  scenario: Scenario
  separator: string | null
  thresholds: PctThresholds
}

// One rendered item, draggable to reorder or move between zones and lines, and clickable to
// open its options. It carries no resting chrome: the hover tint uses a matching negative
// margin so it never changes the item's measured width, and the remove control is absolutely
// positioned for the same reason. What you see at rest is what the terminal prints.
function PreviewItem({ li, z, ii, item, settings, scenario, separator, thresholds }: ItemProps) {
  const { removeItem, moveItem, lines } = usePlaygroundContext()
  const powerline = settings.powerline

  // The drag library moves an item between lists only across its cross axis, and the three
  // zones sit side by side on one row — there is no cross-axis neighbour to find, so its
  // keyboard drag can reorder within a zone and nothing else. These say where to go outright.
  //
  // Alt is the modifier because the arrows alone belong to the terminal's own text.
  function onKeyDown(e: React.KeyboardEvent) {
    if (!e.altKey) return
    const from = { li, z, index: ii }

    // Along the line: step within the zone, and past its end step into the next zone along.
    const step = e.key === 'ArrowLeft' ? -1 : e.key === 'ArrowRight' ? 1 : 0
    if (step) {
      e.preventDefault()
      const next = ii + step
      if (next >= 0 && next < lines[li]![z].length) return moveItem(from, { li, z, index: next })
      const zi = ZONES.indexOf(z) + step
      const into = ZONES[zi]
      if (!into) return
      // Entering from the left lands at the front, entering from the right lands at the back.
      moveItem(from, { li, z: into, index: step > 0 ? 0 : lines[li]![into].length })
      return
    }

    // Across lines, keeping the zone and landing as close to the same slot as it has room for.
    const jump = e.key === 'ArrowUp' ? -1 : e.key === 'ArrowDown' ? 1 : 0
    if (!jump) return
    const target = lines[li + jump]
    if (!target) return
    e.preventDefault()
    moveItem(from, { li: li + jump, z, index: Math.min(ii, target[z].length) })
  }

  return (
    <Draggable draggableId={placedDraggableId(li, z, ii)} index={ii}>
      {(provided, snapshot) => (
        <span
          ref={provided.innerRef}
          {...provided.draggableProps}
          className="group/tok relative inline-flex items-center whitespace-pre"
        >
          {separator && !powerline && (
            <span aria-hidden className="select-none" style={{ color: colorOf('dim', settings.theme) }}>
              {separator}
            </span>
          )}
          <ItemOptions li={li} z={z} ii={ii} item={item}>
            <span
              {...provided.dragHandleProps}
              onKeyDown={onKeyDown}
              aria-label={`${item.widget} options. Alt with an arrow key moves it.`}
              className={cn(
                // Square, like a terminal's own selection block. The negative margin
                // cancels the padding so the highlight never changes the item's width.
                'cursor-grab whitespace-pre outline-none transition-colors active:cursor-grabbing',
                powerline ? 'px-2' : '-mx-1 px-1',
                'hover:bg-white/15 focus-visible:bg-white/15',
                snapshot.isDragging && 'bg-[#4ec9d6]/25 outline-1 outline-solid outline-[#4ec9d6]',
              )}
              style={powerline ? { backgroundColor: POWERLINE_BG[ii % POWERLINE_BG.length] } : undefined}
            >
              <Token item={item} settings={settings} scenario={scenario} thresholds={thresholds} />
            </span>
          </ItemOptions>
          <button
            onClick={() => removeItem(li, z, ii)}
            aria-label={`remove ${item.widget}`}
            className={cn(
              // A square glyph in the same monospace face as the line, not a UI badge.
              'absolute -top-2 -right-1.5 z-20 grid size-3.5 place-items-center border border-white/25',
              'bg-black font-mono text-[10px] leading-none text-white/60 transition-opacity hover:text-[#ff5555]',
              // Faded rather than display:none, so it keeps its place in the tab order.
              'pointer-events-none opacity-0 focus-visible:pointer-events-auto focus-visible:opacity-100',
              'group-hover/tok:pointer-events-auto group-hover/tok:opacity-100',
              'group-focus-within/tok:pointer-events-auto group-focus-within/tok:opacity-100',
            )}
          >
            ✕
          </button>
        </span>
      )}
    </Draggable>
  )
}

// A zone of one line, and its drop target. The target is this whole box — a third of the
// line for center and right — rather than just the text, so there is something to aim at
// when the zone is empty. Its outline shows while dragging, while the line is hovered, or
// whenever the zones toggle is on; never at rest, when the line must look like the terminal's.
function Zone({ li, z, items, settings, scenario, grow, thresholds }: { li: number; z: ZoneKey; items: Item[]; settings: Settings; scenario: Scenario; grow?: boolean; thresholds: PctThresholds }) {
  const dragging = useEditorUi((s) => s.dragging)
  const showZones = useEditorUi((s) => s.showZones)
  const separator = separatorOf(settings)
  const revealed = dragging || showZones

  return (
    <Droppable droppableId={zoneDroppableId(li, z)} direction="horizontal">
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          aria-label={`${ZONE_LABELS[z]} zone`}
          className={cn(
            ZONE_BOX[z],
            grow && 'flex-1',
            'items-center whitespace-pre outline-transparent transition-[outline-color,background-color]',
            revealed && ZONE_EDGE,
            snapshot.isDraggingOver && ZONE_EDGE_OVER,
          )}
        >
          {items.map((item, i) => (
            <PreviewItem
              key={i}
              li={li}
              z={z}
              ii={i}
              item={item}
              settings={settings}
              scenario={scenario}
              separator={i > 0 ? separator : null}
              thresholds={thresholds}
            />
          ))}
          {/* An empty zone has nothing to outline, so it says so in characters — the only
              honest way to show a slot on a line made of text. */}
          {items.length === 0 && revealed && !snapshot.isDraggingOver && (
            <span aria-hidden className="px-1 text-white/20 select-none">
              ┈┈┈┈
            </span>
          )}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  )
}

// One status line, draggable by the grip that appears over its top-right on hover. A line
// with a single zone renders flush left, exactly as dashline composes it.
function StatusLine({ li, line, settings, scenario, removable, thresholds }: { li: number; line: Line; settings: Settings; scenario: Scenario; removable: boolean; thresholds: PctThresholds }) {
  const { removeLine } = usePlaygroundContext()
  const solo = isSolo(line)
  const columns = useEditorUi((s) => s.columns)
  // dashline never wraps: a line too wide for the terminal loses its left zone to `clip()`.
  // Only meaningful once a width is pinned, since otherwise the line has no edge to exceed.
  const clipped = columns != null && lineColumns(line, settings, thresholds, scenario) > columns - settings.margin

  return (
    <Draggable draggableId={lineDraggableId(li)} index={li}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={cn('group/line relative', snapshot.isDragging && 'rounded-sm bg-white/5')}
        >
          {/* dashline composes every line into `columns - margin`, so the preview has to
              lose the same columns off the right or the margin setting looks inert. */}
          <div
            className={cn(lineBox(line), 'whitespace-pre', columns && 'overflow-hidden')}
            style={{ paddingRight: `${settings.margin}ch` }}
          >
            {(solo ? SOLO_ZONE : ZONES).map((z) => (
              <Zone key={z} li={li} z={z} items={line[z]} settings={settings} scenario={scenario} grow={solo} thresholds={thresholds} />
            ))}
          </div>

          {/* The line's controls live in the terminal's own padding, one in each gutter,
              so they cost the line no width and never displace what it prints. The
              terminal clips its overflow, so -left-4/-right-4 sits them flush against the
              container edge, which is as far out as they can go. */}
          {/* Gutter controls drawn as glyphs in the terminal's own face, not UI icons. */}
          <span
            {...provided.dragHandleProps}
            aria-label={`drag line ${li + 1}`}
            className={cn(
              'absolute top-1/2 -left-4 z-30 grid size-4 -translate-y-1/2 cursor-grab place-items-center',
              'font-mono text-[11px] leading-none text-white/35 outline-none transition-opacity',
              'hover:text-white active:cursor-grabbing',
              GUTTER_REVEAL,
            )}
          >
            ⠿
          </span>
          {/* Sits in the gutter with the other line controls, so saying the line is too wide
              never makes it wider. */}
          {clipped && (
            <span
              title={`This line needs more than ${columns} columns. dashline clips the left zone to keep the right one whole.`}
              className="absolute top-1/2 -right-4 z-30 grid size-4 -translate-y-1/2 place-items-center font-mono text-[11px] leading-none text-[#e5b93a]"
            >
              ›
            </span>
          )}
          {removable && !clipped && (
            <button
              onClick={() => removeLine(li)}
              aria-label={`remove line ${li + 1}`}
              className={cn(
                'absolute top-1/2 -right-4 z-30 grid size-4 -translate-y-1/2 place-items-center',
                'font-mono text-[11px] leading-none text-white/35 transition-opacity hover:text-[#ff5555]',
                GUTTER_REVEAL,
              )}
            >
              ✕
            </button>
          )}
        </div>
      )}
    </Draggable>
  )
}

// The terminal mock, which is also the editor: a faded scrollback, Claude Code's own prompt,
// and the dashline status line built by dragging widgets straight into it. The line renders
// the selected sample scenario so it can be played through different states.
export function TerminalPreview() {
  const { lines, settings } = usePlaygroundContext()
  const index = usePreviewStore((s) => s.index)
  const scenario = SCENARIOS[index]
  const columns = useEditorUi((s) => s.columns)
  // One resolution per render, not one per item.
  const thresholds = resolveThresholds(settings)

  return (
    <div className="flex h-full flex-col overflow-hidden bg-black p-4 font-mono text-[13px] leading-relaxed">
      <div
        className="flex min-h-0 flex-1 flex-col justify-end gap-2 overflow-hidden opacity-60"
        style={{ maskImage: FADE, WebkitMaskImage: FADE }}
      >
        <TerminalScrollback />
      </div>
      {/* Claude Code prints the status line between the composer and the mode line, so the
          preview has to as well — it is the frame users will compare against. */}
      <div className="mt-3 shrink-0">
        <ClaudePrompt
          mode="auto"
          effort={false}
          placeholder="Try a task…"
          statusLine={
            <Droppable droppableId={LINES_DROPPABLE} type={LINE_TYPE}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="flex flex-col gap-1"
                  // A real terminal has an edge, and dashline lays every line out against it.
                  // Pinning the width puts that edge back so the crowded cases — the clipped
                  // left zone, the centre that stops being centred — can actually be seen.
                  style={columns ? { width: `${columns}ch`, maxWidth: '100%' } : undefined}
                >
                  {lines.map((ln, i) => (
                    <StatusLine key={i} li={i} line={ln} settings={settings} scenario={scenario} removable={lines.length > 1} thresholds={thresholds} />
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          }
        />
      </div>
    </div>
  )
}

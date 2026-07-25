// Vendored from the Ordinary Nerds component library (packages/plume). A slider that
// carries its own label and value inside the track, so it needs no surrounding chrome.
// Keep edits minimal so it can be re-synced from upstream.
import { cn } from "@/lib/utils";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

/* ── Constants ─────────────────────────────────────────── */

const CLICK_THRESHOLD = 3;
const DEAD_ZONE = 32;
const MAX_CURSOR_RANGE = 200;
const MAX_STRETCH = 8;

/* ── Helpers ───────────────────────────────────────────── */

function decimalsForStep(step: number): number {
  const s = step.toString();
  const dot = s.indexOf(".");
  return dot === -1 ? 0 : s.length - dot - 1;
}

function roundValue(val: number, step: number): number {
  const raw = Math.round(val / step) * step;
  return parseFloat(raw.toFixed(decimalsForStep(step)));
}

function snapToDecile(rawValue: number, min: number, max: number): number {
  const normalized = (rawValue - min) / (max - min);
  const nearest = Math.round(normalized * 10) / 10;
  if (Math.abs(normalized - nearest) <= 0.03125) {
    return min + nearest * (max - min);
  }
  return rawValue;
}

function DialMarks({
  amount,
  step,
  max,
  min,
  variant,
  active,
}: {
  amount: number;
  step: number;
  max: number;
  min: number;
  variant: DialVariant;
  active: boolean;
}) {
  return Array.from({ length: amount - 1 }, (_, i) => {
    const pct = (((i + 1) * step) / (max - min)) * 100;
    return (
      <div
        key={i}
        className={cn(dialMark({ variant, active }))}
        style={{ left: `${pct}%` }}
      />
    );
  });
}

/* ── Variant system ────────────────────────────────────── */

/**
 * Root wrapper — variant determines the focus ring color.
 * This is the primary cva export; its VariantProps define the variant type.
 */
const dialSliderVariants = cva(
  "relative h-9 outline-none focus-visible:ring-2 focus-visible:ring-offset-1",
  {
    variants: {
      variant: {
        default: "focus-visible:ring-ring",
        primary: "focus-visible:ring-primary",
        accent: "focus-visible:ring-accent",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

type DialVariant = NonNullable<
  VariantProps<typeof dialSliderVariants>["variant"]
>;

/** Track surface */
const dialTrack = cva(
  "touch-action-none absolute inset-0 cursor-pointer overflow-hidden rounded-none select-none",
  {
    variants: {
      variant: {
        default: "bg-muted",
        primary: "bg-primary/10",
        accent: "bg-accent",
      } satisfies Record<DialVariant, string>,
    },
    defaultVariants: { variant: "default" },
  },
);

/** Fill bar — compound variant switches color when active */
const dialFill = cva(
  "pointer-events-none absolute inset-y-0 left-0 transition-colors duration-150",
  {
    variants: {
      variant: {
        default: "bg-foreground/11",
        primary: "bg-primary/12",
        accent: "bg-accent-foreground/12",
      } satisfies Record<DialVariant, string>,
      active: { true: null, false: null },
    },
    compoundVariants: [
      { variant: "default", active: true, class: "bg-foreground/15" },
      { variant: "primary", active: true, class: "bg-primary/22" },
      { variant: "accent", active: true, class: "bg-accent-foreground/22" },
    ],
    defaultVariants: { variant: "default" },
  },
);

/** Handle indicator */
const dialHandle = cva(
  "pointer-events-none absolute top-1/2 h-5 w-0.75 rounded-none",
  {
    variants: {
      variant: {
        default: "bg-foreground/90",
        primary: "bg-primary",
        accent: "bg-accent-foreground",
      } satisfies Record<DialVariant, string>,
    },
    defaultVariants: { variant: "default" },
  },
);

/** Hash marks — transparent at rest, variant-colored when active */
const dialMark = cva(
  "absolute top-1/2 h-2 w-px -translate-x-1/2 -translate-y-1/2 rounded-none bg-transparent transition-colors duration-200",
  {
    variants: {
      variant: {
        default: "",
        primary: "",
        accent: "",
      } satisfies Record<DialVariant, string>,
      active: { true: null, false: null },
    },
    compoundVariants: [
      { variant: "default", active: true, class: "bg-foreground/15" },
      { variant: "primary", active: true, class: "bg-primary/20" },
      { variant: "accent", active: true, class: "bg-accent-foreground/20" },
    ],
    defaultVariants: { variant: "default" },
  },
);

/** Value display — text and border change on active / editable states */
const dialValue = cva(
  "text-muted-foreground pointer-events-auto absolute top-1/2 right-2.5 -translate-y-1/2 border-b border-transparent pb-px font-mono text-[13px] font-medium transition-colors duration-150",
  {
    variants: {
      variant: {
        default: "",
        primary: "",
        accent: "",
      } satisfies Record<DialVariant, string>,
      active: { true: null, false: null },
      editable: { true: null, false: null },
    },
    compoundVariants: [
      { variant: "default", active: true, class: "text-foreground" },
      { variant: "primary", active: true, class: "text-primary" },
      { variant: "accent", active: true, class: "text-accent-foreground" },
      { variant: "default", editable: true, class: "border-muted-foreground" },
      { variant: "primary", editable: true, class: "border-primary/50" },
      {
        variant: "accent",
        editable: true,
        class: "border-accent-foreground/50",
      },
    ],
    defaultVariants: { variant: "default" },
  },
);

/** Inline text input — border + text color varies */
const dialInput = cva(
  "absolute top-1/2 right-2.5 w-[4ch] max-w-[6ch] min-w-[3ch] -translate-y-1/2 border-0 border-b bg-transparent p-0 pb-px text-right font-mono text-[13px] font-medium outline-none",
  {
    variants: {
      variant: {
        default: "border-muted-foreground text-foreground",
        primary: "border-primary/50 text-primary",
        accent: "border-accent-foreground/50 text-accent-foreground",
      } satisfies Record<DialVariant, string>,
    },
    defaultVariants: { variant: "default" },
  },
);

/* ── Types ─────────────────────────────────────────────── */

interface DialSliderProps extends VariantProps<typeof dialSliderVariants> {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  /** Icon rendered before the label text */
  icon?: React.ReactNode;
  className?: string;
  ref?: React.Ref<HTMLDivElement>;
}

/* ── Component ─────────────────────────────────────────── */

function DialSlider({
  label,
  value,
  onChange,
  min = 0,
  max = 1,
  step = 0.01,
  unit,
  icon,
  variant = "default",
  className,
  ref: forwardedRef,
}: DialSliderProps) {
  /* ── Refs ── */

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const valueSpanRef = useRef<HTMLSpanElement>(null);

  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pointerDownPos = useRef<{ x: number; y: number } | null>(null);
  const isClickRef = useRef(true);
  const animRef = useRef<ReturnType<typeof animate> | null>(null);
  const wrapperRectRef = useRef<DOMRect | null>(null);
  const scaleRef = useRef(1);
  const valueRef = useRef(value);
  valueRef.current = value;
  const editableSetRef = useRef(false);

  const setWrapperRef = useCallback(
    (node: HTMLDivElement | null) => {
      wrapperRef.current = node;
      if (typeof forwardedRef === "function") forwardedRef(node);
      else if (forwardedRef)
        (
          forwardedRef as React.MutableRefObject<HTMLDivElement | null>
        ).current = node;
    },
    [forwardedRef],
  );

  /* ── State ── */

  const [isInteracting, setIsInteracting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isValueHovered, setIsValueHovered] = useState(false);
  const [isValueEditable, setIsValueEditable] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const percentage = ((value - min) / (max - min)) * 100;
  const isActive = isInteracting || isHovered;

  /* ── Motion values ── */

  const fillPercent = useMotionValue(percentage);
  const fillWidth = useTransform(fillPercent, (pct) => `${pct}%`);
  const handleLeft = useTransform(
    fillPercent,
    (pct) => `max(5px, calc(${pct}% - 9px))`,
  );

  const rubberStretchPx = useMotionValue(0);
  const rubberBandWidth = useTransform(
    rubberStretchPx,
    (stretch) => `calc(100% + ${Math.abs(stretch)}px)`,
  );
  const rubberBandX = useTransform(rubberStretchPx, (stretch) =>
    stretch < 0 ? stretch : 0,
  );

  useEffect(() => {
    if (!isInteracting && !animRef.current) {
      fillPercent.jump(percentage);
    }
  }, [percentage, isInteracting, fillPercent]);

  /* ── Value ↔ position conversions ── */

  const positionToValue = useCallback(
    (clientX: number) => {
      const rect = wrapperRectRef.current;
      if (!rect) return valueRef.current;
      const screenX = clientX - rect.left;
      const sceneX = screenX / scaleRef.current;
      const nativeWidth = wrapperRef.current
        ? wrapperRef.current.offsetWidth
        : rect.width;
      const percent = Math.max(0, Math.min(1, sceneX / nativeWidth));
      const rawValue = min + percent * (max - min);
      return Math.max(min, Math.min(max, rawValue));
    },
    [min, max],
  );

  const percentFromValue = useCallback(
    (v: number) => ((v - min) / (max - min)) * 100,
    [min, max],
  );

  const computeRubberStretch = useCallback((clientX: number, sign: -1 | 1) => {
    const rect = wrapperRectRef.current;
    if (!rect) return 0;
    const distancePast = sign < 0 ? rect.left - clientX : clientX - rect.right;
    const overflow = Math.max(0, distancePast - DEAD_ZONE);
    return (
      sign * MAX_STRETCH * Math.sqrt(Math.min(overflow / MAX_CURSOR_RANGE, 1))
    );
  }, []);

  /* ── Pointer handlers ── */

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (showInput) return;
      e.preventDefault();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      pointerDownPos.current = { x: e.clientX, y: e.clientY };
      isClickRef.current = true;
      setIsInteracting(true);

      if (wrapperRef.current) {
        wrapperRectRef.current = wrapperRef.current.getBoundingClientRect();
        const nativeWidth = wrapperRef.current.offsetWidth;
        scaleRef.current = wrapperRectRef.current.width / nativeWidth;
      }
    },
    [showInput],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isInteracting || !pointerDownPos.current) return;

      const dx = e.clientX - pointerDownPos.current.x;
      const dy = e.clientY - pointerDownPos.current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (isClickRef.current && distance > CLICK_THRESHOLD) {
        isClickRef.current = false;
        setIsDragging(true);
      }

      if (!isClickRef.current) {
        const rect = wrapperRectRef.current;
        if (rect) {
          if (e.clientX < rect.left) {
            rubberStretchPx.jump(computeRubberStretch(e.clientX, -1));
          } else if (e.clientX > rect.right) {
            rubberStretchPx.jump(computeRubberStretch(e.clientX, 1));
          } else {
            rubberStretchPx.jump(0);
          }
        }

        const newValue = positionToValue(e.clientX);
        const newPct = percentFromValue(newValue);

        if (animRef.current) {
          animRef.current.stop();
          animRef.current = null;
        }

        fillPercent.jump(newPct);
        onChange(roundValue(newValue, step));
      }
    },
    [
      isInteracting,
      positionToValue,
      percentFromValue,
      onChange,
      fillPercent,
      rubberStretchPx,
      computeRubberStretch,
      step,
    ],
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!isInteracting) return;

      if (isClickRef.current) {
        const rawValue = positionToValue(e.clientX);
        const discreteSteps = (max - min) / step;
        const snappedValue =
          discreteSteps <= 10
            ? Math.max(
                min,
                Math.min(max, min + Math.round((rawValue - min) / step) * step),
              )
            : snapToDecile(rawValue, min, max);
        const newPct = percentFromValue(snappedValue);

        if (animRef.current) animRef.current.stop();
        animRef.current = animate(fillPercent, newPct, {
          type: "spring",
          stiffness: 300,
          damping: 25,
          mass: 0.8,
          onComplete: () => {
            animRef.current = null;
          },
        });
        onChange(roundValue(snappedValue, step));
      }

      if (rubberStretchPx.get() !== 0) {
        animate(rubberStretchPx, 0, {
          type: "spring",
          visualDuration: 0.35,
          bounce: 0.15,
        });
      }

      setIsInteracting(false);
      setIsDragging(false);
      pointerDownPos.current = null;
    },
    [
      isInteracting,
      positionToValue,
      percentFromValue,
      onChange,
      min,
      max,
      step,
      fillPercent,
      rubberStretchPx,
    ],
  );

  /* ── Keyboard handler (ARIA slider pattern) ── */

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (showInput) return;

      let newValue: number | null = null;
      const bigStep = (max - min) / 10;

      switch (e.key) {
        case "ArrowRight":
        case "ArrowUp":
          e.preventDefault();
          newValue = Math.min(max, value + step);
          break;
        case "ArrowLeft":
        case "ArrowDown":
          e.preventDefault();
          newValue = Math.max(min, value - step);
          break;
        case "PageUp":
          e.preventDefault();
          newValue = Math.min(max, value + bigStep);
          break;
        case "PageDown":
          e.preventDefault();
          newValue = Math.max(min, value - bigStep);
          break;
        case "Home":
          e.preventDefault();
          newValue = min;
          break;
        case "End":
          e.preventDefault();
          newValue = max;
          break;
      }

      if (newValue !== null) {
        const rounded = roundValue(newValue, step);
        onChange(rounded);
        const newPct = percentFromValue(rounded);
        if (animRef.current) animRef.current.stop();
        animRef.current = animate(fillPercent, newPct, {
          type: "spring",
          stiffness: 300,
          damping: 25,
          mass: 0.8,
          onComplete: () => {
            animRef.current = null;
          },
        });
      }
    },
    [showInput, max, min, step, value, onChange, percentFromValue, fillPercent],
  );

  /* ── Editable value (hover 800ms → click to edit) ── */

  useEffect(() => {
    if (isValueHovered && !showInput && !editableSetRef.current) {
      hoverTimeoutRef.current = setTimeout(() => {
        editableSetRef.current = true;
        setIsValueEditable(true);
      }, 800);
    } else if (!isValueHovered && !showInput) {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
        hoverTimeoutRef.current = null;
      }
      editableSetRef.current = false;
      setIsValueEditable(false);
    }
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, [isValueHovered, showInput]);

  useEffect(() => {
    if (showInput && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [showInput]);

  const handleInputSubmit = () => {
    const parsed = parseFloat(inputValue);
    if (!Number.isNaN(parsed)) {
      const clamped = Math.max(min, Math.min(max, parsed));
      onChange(roundValue(clamped, step));
    }
    setShowInput(false);
    setIsValueHovered(false);
    setIsValueEditable(false);
  };

  const handleValueClick = (e?: React.SyntheticEvent) => {
    if (isValueEditable) {
      e?.stopPropagation();
      e?.preventDefault();
      setShowInput(true);
      setInputValue(value.toFixed(decimalsForStep(step)));
    }
  };

  /* ── Handle dodge logic ── */

  const displayValue = value.toFixed(decimalsForStep(step));
  const HANDLE_BUFFER = 8;
  const LABEL_CSS_LEFT = 10;
  const VALUE_CSS_RIGHT = 10;

  let leftThreshold = 30;
  let rightThreshold = 78;
  const trackWidth = wrapperRef.current?.offsetWidth;

  if (trackWidth && trackWidth > 0) {
    if (labelRef.current) {
      leftThreshold =
        ((LABEL_CSS_LEFT + labelRef.current.offsetWidth + HANDLE_BUFFER) /
          trackWidth) *
        100;
    }
    if (valueSpanRef.current) {
      rightThreshold =
        ((trackWidth -
          VALUE_CSS_RIGHT -
          valueSpanRef.current.offsetWidth -
          HANDLE_BUFFER) /
          trackWidth) *
        100;
    }
  }

  const valueDodge = percentage < leftThreshold || percentage > rightThreshold;
  const handleOpacity = !isActive
    ? 0
    : valueDodge
      ? 0.1
      : isDragging
        ? 0.9
        : 0.5;

  /* ── Hash marks ── */

  const discreteSteps = (max - min) / step;
  const hashMarks =
    discreteSteps <= 10 ? (
      <DialMarks
        amount={discreteSteps}
        step={step}
        min={min}
        max={max}
        variant={variant ?? "default"}
        active={isActive}
      />
    ) : (
      Array.from({ length: 9 }, (_, i) => {
        const pct = (i + 1) * 10;
        return (
          <div
            key={i}
            className={cn(dialMark({ variant, active: isActive }))}
            style={{ left: `${pct}%` }}
          />
        );
      })
    );

  /* ── Render ── */

  return (
    <div
      ref={setWrapperRef}
      className={cn(dialSliderVariants({ variant }), className)}
      role="slider"
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-label={label}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <motion.div
        className={dialTrack({ variant })}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{ width: rubberBandWidth, x: rubberBandX }}
      >
        {/* Hash marks */}
        <div className="pointer-events-none absolute inset-0">{hashMarks}</div>

        {/* Fill */}
        <motion.div
          className={cn(dialFill({ variant, active: isActive }))}
          style={{ width: fillWidth }}
        />

        {/* Handle */}
        <motion.div
          className={dialHandle({ variant })}
          style={{ left: handleLeft, y: "-50%" }}
          animate={{
            opacity: handleOpacity,
            scaleX: isActive ? 1 : 0.25,
            scaleY: isActive && valueDodge ? 0.75 : 1,
          }}
          transition={{
            scaleX: { type: "spring", visualDuration: 0.25, bounce: 0.15 },
            scaleY: { type: "spring", visualDuration: 0.2, bounce: 0.1 },
            opacity: { duration: 0.15 },
          }}
        />

        {/* Label */}
        <span
          ref={labelRef}
          className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 flex -translate-y-1/2 items-center gap-1.5 font-mono text-[12px] font-medium tracking-wide transition-colors duration-150"
        >
          {icon && (
            <span className="shrink-0 [&>svg]:h-3.5 [&>svg]:w-3.5">{icon}</span>
          )}
          {label}
        </span>

        {/* Value / Input */}
        {showInput ? (
          <input
            ref={inputRef}
            type="text"
            className={dialInput({ variant })}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleInputSubmit();
              else if (e.key === "Escape") {
                setShowInput(false);
                setIsValueHovered(false);
              }
            }}
            onBlur={handleInputSubmit}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          />
        ) : (
          <span
            ref={valueSpanRef}
            role={isValueEditable ? "button" : undefined}
            tabIndex={isValueEditable ? 0 : undefined}
            className={cn(
              dialValue({
                variant,
                active: isActive,
                editable: isValueEditable,
              }),
            )}
            onMouseEnter={() => setIsValueHovered(true)}
            onMouseLeave={() => setIsValueHovered(false)}
            onClick={handleValueClick}
            onKeyDown={(e) => {
              if (isValueEditable && (e.key === "Enter" || e.key === " ")) {
                handleValueClick();
              }
            }}
            onMouseDown={(e) => isValueEditable && e.stopPropagation()}
            style={{ cursor: isValueEditable ? "text" : "default" }}
          >
            {displayValue}
            {unit ? ` ${unit}` : null}
          </span>
        )}
      </motion.div>
    </div>
  );
}

export { DialSlider, dialSliderVariants };
export type { DialSliderProps, DialVariant };

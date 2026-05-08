import React from 'react';

type Side = 'top' | 'bottom' | 'left' | 'right';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
  side?: Side;
  /** Disable the tooltip without unwrapping the child. */
  disabled?: boolean;
  /** Optional className for the tooltip bubble itself. */
  className?: string;
  /** Allow tooltip text to wrap (use for longer copy on small screens). Default: false (single-line). */
  wrap?: boolean;
}

const sidePositionClasses: Record<Side, string> = {
  top:    'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left:   'right-full top-1/2 -translate-y-1/2 mr-2',
  right:  'left-full top-1/2 -translate-y-1/2 ml-2',
};

const sideArrowClasses: Record<Side, string> = {
  top:    'top-full left-1/2 -translate-x-1/2 -mt-1 border-l-transparent border-r-transparent border-b-transparent border-t-slate-900',
  bottom: 'bottom-full left-1/2 -translate-x-1/2 -mb-1 border-l-transparent border-r-transparent border-t-transparent border-b-slate-900',
  left:   'left-full top-1/2 -translate-y-1/2 -ml-1 border-t-transparent border-b-transparent border-r-transparent border-l-slate-900',
  right:  'right-full top-1/2 -translate-y-1/2 -mr-1 border-t-transparent border-b-transparent border-l-transparent border-r-slate-900',
};

/**
 * Lightweight CSS-only tooltip.
 * - Shows on hover and on keyboard focus of the wrapped child.
 * - 150ms fade-in via Tailwind transition utilities.
 * - No portal, no JS state — fits the CDN/importmap setup of this prototype.
 *
 * Usage:
 *   <Tooltip content="Why this is disabled">
 *     <button disabled>Submit</button>
 *   </Tooltip>
 */
export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  side = 'top',
  disabled = false,
  className = '',
  wrap = false,
}) => {
  if (disabled || !content) return children;

  // Single-line by default. With `wrap`, wrap only on mobile and stay single-line
  // on desktop — keeps long copy readable on small screens without breaking layout
  // on wider viewports.
  const widthClass = wrap
    ? 'whitespace-normal sm:whitespace-nowrap max-w-[min(18rem,calc(100vw-2rem))] sm:max-w-none leading-snug text-left'
    : 'whitespace-nowrap';

  return (
    <span className="group relative inline-flex">
      {children}
      <span
        role="tooltip"
        className={`pointer-events-none absolute z-50 ${widthClass} rounded-md bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-white shadow-lg opacity-0 scale-95 transition-all duration-150 group-hover:opacity-100 group-hover:scale-100 group-focus-within:opacity-100 group-focus-within:scale-100 ${sidePositionClasses[side]} ${className}`}
      >
        {content}
        <span
          aria-hidden="true"
          className={`absolute w-0 h-0 border-4 ${sideArrowClasses[side]}`}
        />
      </span>
    </span>
  );
};

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Tooltip } from '../components/ui/tooltip';

describe('Tooltip', () => {
  it('renders the wrapped child', () => {
    render(
      <Tooltip content="Help text">
        <button>Click me</button>
      </Tooltip>
    );
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('renders the tooltip bubble with role="tooltip"', () => {
    render(
      <Tooltip content="Help text">
        <button>Click me</button>
      </Tooltip>
    );
    const tip = screen.getByRole('tooltip');
    expect(tip).toBeInTheDocument();
    expect(tip).toHaveTextContent('Help text');
  });

  it('does not render the bubble when disabled=true', () => {
    render(
      <Tooltip content="Help text" disabled>
        <button>Click me</button>
      </Tooltip>
    );
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('does not render the bubble when content is empty', () => {
    render(
      <Tooltip content="">
        <button>Click me</button>
      </Tooltip>
    );
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  // BUG: when content is null/undefined the tooltip returns the child directly
  it('does not render the bubble when content is null', () => {
    render(
      <Tooltip content={null as any}>
        <button>Click me</button>
      </Tooltip>
    );
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('applies wrap classes when wrap=true', () => {
    render(
      <Tooltip content="Long help" wrap>
        <button>Btn</button>
      </Tooltip>
    );
    const tip = screen.getByRole('tooltip');
    expect(tip.className).toContain('whitespace-normal');
    expect(tip.className).toContain('sm:whitespace-nowrap');
  });

  it('uses whitespace-nowrap by default (no wrap)', () => {
    render(
      <Tooltip content="Short">
        <button>Btn</button>
      </Tooltip>
    );
    const tip = screen.getByRole('tooltip');
    expect(tip.className).toContain('whitespace-nowrap');
  });

  it('positions correctly for each side', () => {
    const sides = ['top', 'bottom', 'left', 'right'] as const;
    for (const side of sides) {
      const { unmount } = render(
        <Tooltip content="hi" side={side}>
          <button>Btn</button>
        </Tooltip>
      );
      const tip = screen.getByRole('tooltip');
      // positional class fragment must exist
      const pos = {
        top:    'bottom-full',
        bottom: 'top-full',
        left:   'right-full',
        right:  'left-full',
      }[side];
      expect(tip.className).toContain(pos);
      unmount();
    }
  });

  it('forwards a custom className to the bubble', () => {
    render(
      <Tooltip content="hi" className="hidden sm:inline-block">
        <button>Btn</button>
      </Tooltip>
    );
    const tip = screen.getByRole('tooltip');
    expect(tip.className).toContain('hidden');
    expect(tip.className).toContain('sm:inline-block');
  });
});

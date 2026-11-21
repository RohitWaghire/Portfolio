'use client';

import React, {
  useEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type PointerEvent,
  type ReactNode
} from 'react';
import { ArrowRightIcon } from '@/components/Icons';
import { cn } from '@/lib/utils';

const DEFAULT_DURATION = 450;

export interface ArrowFillButtonOwnProps {
  btnText?: string;
  href?: string;
  className?: string;
  bgColor?: string;
  textColor?: string;
  fillBgColor?: string;
  fillTextColor?: string;
  hoverFillBgColor?: string;
  hoverFillTextColor?: string;
  arrowColor?: string;
  hoverArrowColor?: string;
  animationDuration?: number;
  /** Optional leading icon shown next to the label. */
  icon?: ReactNode;
  /** Hide the text label and shrink the button to an icon-sized pill. */
  iconOnly?: boolean;
  /** Icon that swaps inside the circular badge (defaults to a right arrow). */
  arrowIcon?: ReactNode;
}

export type ArrowFillButtonProps = ArrowFillButtonOwnProps &
  Omit<ComponentPropsWithoutRef<'a'>, keyof ArrowFillButtonOwnProps>;

/**
 * Pill link with a circular arrow badge that expands to fill the button on
 * hover (or touch press), swapping the arrow as it goes. Adapted to this
 * project's prebuilt stylesheet and icons.
 */
export function ArrowFillButton({
  btnText = 'Hover me',
  href = '#',
  className,
  bgColor = 'var(--blue)',
  textColor = '#ffffff',
  fillBgColor = '#ffffff',
  fillTextColor = 'var(--blue-deep)',
  hoverFillBgColor = '#ffffff',
  hoverFillTextColor = 'var(--blue-deep)',
  arrowColor,
  hoverArrowColor,
  animationDuration = DEFAULT_DURATION,
  icon,
  iconOnly = false,
  arrowIcon,
  onPointerDown,
  onPointerUp,
  onPointerCancel,
  ...props
}: ArrowFillButtonProps) {
  const [pressed, setPressed] = useState(false);
  const releaseRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (releaseRef.current !== null) window.clearTimeout(releaseRef.current);
    };
  }, []);

  const release = () => {
    if (releaseRef.current !== null) window.clearTimeout(releaseRef.current);
    releaseRef.current = window.setTimeout(() => {
      setPressed(false);
      releaseRef.current = null;
    }, animationDuration);
  };

  const handleDown = (event: PointerEvent<HTMLAnchorElement>) => {
    onPointerDown?.(event);
    if (event.pointerType === 'mouse') return;
    if (releaseRef.current !== null) window.clearTimeout(releaseRef.current);
    setPressed(true);
  };

  const handleUp = (event: PointerEvent<HTMLAnchorElement>) => {
    onPointerUp?.(event);
    if (event.pointerType !== 'mouse') release();
  };

  const handleCancel = (event: PointerEvent<HTMLAnchorElement>) => {
    onPointerCancel?.(event);
    if (event.pointerType !== 'mouse') release();
  };

  return (
    <a
      href={href}
      {...props}
      data-pressed={pressed ? 'true' : 'false'}
      onPointerDown={handleDown}
      onPointerUp={handleUp}
      onPointerCancel={handleCancel}
      className={cn('afb', iconOnly && 'afb--compact', className)}
      style={
        {
          '--afb-bg': bgColor,
          '--afb-text': textColor,
          '--afb-fill-bg': fillBgColor,
          '--afb-fill-text': fillTextColor,
          '--afb-fill-bg-hover': hoverFillBgColor,
          '--afb-fill-text-hover': hoverFillTextColor,
          '--afb-arrow': arrowColor || fillTextColor,
          '--afb-arrow-hover': hoverArrowColor || hoverFillTextColor,
          '--afb-duration': `${animationDuration}ms`
        } as CSSProperties
      }
    >
      <span className="afb__label">
        {icon && <span className="afb__icon">{icon}</span>}
        {!iconOnly && <span>{btnText}</span>}
      </span>

      <span aria-hidden="true" className="afb__fill" />

      {!iconOnly && (
        <span aria-hidden="true" className="afb__text">
          {icon && <span className="afb__icon">{icon}</span>}
          <span>{btnText}</span>
        </span>
      )}

      <span aria-hidden="true" className="afb__circle">
        <span className="afb__arrow afb__arrow--in">
          {arrowIcon ?? <ArrowRightIcon />}
        </span>
        <span className="afb__arrow afb__arrow--out">
          {arrowIcon ?? <ArrowRightIcon />}
        </span>
      </span>
    </a>
  );
}

export default ArrowFillButton;

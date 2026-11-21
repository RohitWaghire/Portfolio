'use client';

import React from 'react';
import { Glow } from './Glow';
import { cn } from '@/lib/utils';

export function Shine({
  children,
  className,
  rest,
  quiet
}: {
  children: React.ReactNode;
  className?: string;
  rest?: boolean;
  quiet?: boolean;
}) {
  return (
    <>
      <Glow rest={rest} quiet={quiet} />
      <span className={cn("relative flex items-center gap-2", className)}>
        {children}
      </span>
    </>
  );
}

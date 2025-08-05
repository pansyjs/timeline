import React from 'react';
import { useIsomorphicLayoutEffect } from '@/hooks';
import { Timeline } from './core';

export function TimeLine() {
  const containerRef = React.useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(
    () => {
      const container = containerRef.current;
      if (!container)
        return;

      const instance = new Timeline(container, {});

      return () => {
        instance && instance.destroy();
      };
    },
    [],
  );

  return (
    <div ref={containerRef} />
  );
}

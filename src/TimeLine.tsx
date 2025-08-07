import React from 'react';
import { useIsomorphicLayoutEffect } from '@/hooks';
import { Timeline } from './core';
import './core/styles/index.less';

export function TimeLine() {
  const containerRef = React.useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(
    () => {
      const container = containerRef.current;
      if (!container)
        return;

      const items = [
        { id: 1, title: 'item 1', start: '2014-04-20' },
        { id: 2, title: 'item 2', start: '2014-04-14' },
        { id: 3, title: 'item 3', start: '2014-04-18' },
        { id: 4, title: 'item 4', start: '2014-04-16', end: '2014-04-19' },
        { id: 5, title: 'item 5', start: '2014-04-25' },
        { id: 6, title: 'item 6', start: '2014-04-27' },
      ];

      const instance = new Timeline(container, items);

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

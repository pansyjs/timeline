import type { TimeLineCoreOptions, TimeLineProps } from './types';
import React from 'react';
import { useIsomorphicLayoutEffect } from '@/hooks';
import { TimeLineCore } from './TimeLineCore';
import './core/styles/index.less';

export function TimeLine(props: TimeLineProps) {
  const { className, style, ...rest } = props;
  const containerRef = React.useRef<HTMLDivElement>(null);

  const resolvedOptions: TimeLineCoreOptions = {
    ...rest,
    getElement: () => containerRef.current,
  };

  const [instance] = React.useState(
    () => new TimeLineCore(resolvedOptions),
  );

  instance.setOptions(resolvedOptions);

  useIsomorphicLayoutEffect(() => {
    return instance._didMount();
  }, []);

  useIsomorphicLayoutEffect(() => {
    return instance._willUpdate();
  });

  return (
    <div className={className} style={style} ref={containerRef} />
  );
}

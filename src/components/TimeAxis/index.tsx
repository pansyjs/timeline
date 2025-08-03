import type { Tick, TimeAxisProps } from '../../types';
import { useVirtualizer } from '@tanstack/react-virtual';
import { clsx } from 'clsx';
import dayjs from 'dayjs';
import React from 'react';
import { AXIS_CONFIG, GRANULARITIES } from '../../config';
import { emitter } from '../../utils';
import { TimeLineContext } from '../context';
import './style/index.less';

export function TimeAxis(props: TimeAxisProps) {
  const { timeRange, children } = props;

  /** 时间粒度（默认1分钟） */
  const [granularity] = React.useState(0);
  const { getPrefixCls, rootElement } = React.useContext(TimeLineContext);
  const prefixCls = getPrefixCls('timeline-axis');

  const generateTicks = React.useCallback(
    () => {
      const ticks: Tick[] = [];

      if (!timeRange) {
        return ticks;
      }

      const { step, scale } = GRANULARITIES[granularity];

      for (let time = timeRange.start; time.isBefore(timeRange.end); time = time.add(step, scale)) {
        ticks.push({
          time,
        });
      }

      return ticks;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [timeRange],
  );

  const ticks = generateTicks();

  const ticksVirtualizer = useVirtualizer({
    horizontal: true,
    count: ticks.length,
    getScrollElement: () => rootElement,
    estimateSize: () => 1,
    gap: 8,
    paddingStart: AXIS_CONFIG.paddingStart,
    paddingEnd: AXIS_CONFIG.paddingEnd,
  });

  const handlePanMove = (e: any) => {
    ticksVirtualizer.scrollToOffset(ticksVirtualizer.scrollOffset + e.dx);
  };

  React.useEffect(
    () => {
      emitter.on('panmove', handlePanMove);

      return () => {
        emitter.off('panmove', handlePanMove);
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <div
      className={prefixCls}
      style={{
        width: `${ticksVirtualizer.getTotalSize()}px`,
      }}
    >
      {ticksVirtualizer.getVirtualItems().map((virtualColumn) => {
        const { index, key } = virtualColumn;
        const { time } = ticks[index];
        const { labelStep, majorLabelFormat, minorLabelFormat } = GRANULARITIES[granularity];

        const majorLabel = dayjs(time).format(majorLabelFormat);
        const minorLabel = dayjs(time).format(minorLabelFormat);
        const showLabel = index % labelStep === 0;

        return (
          <div
            className={clsx(`${prefixCls}-tick`, {
              [`${prefixCls}-tick-major`]: showLabel,
              [`${prefixCls}-tick-big-major`]: index === 0,
            })}
            key={key}
            data-index={index}
            ref={ticksVirtualizer.measureElement}
            style={{
              transform: `translateX(${virtualColumn.start}px)`,
            }}
          >
            {showLabel && (
              <div className={`${prefixCls}-tick-lable`}>
                {index === 0 ? majorLabel : minorLabel}
              </div>
            )}
          </div>
        );
      })}
      {children}
    </div>
  );
}

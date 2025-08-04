import type { DataItem, Tick, Time } from '@/types';
import dayjs from 'dayjs';
import React from 'react';
import { GRANULARITIES, SCALE_MILLISECONDS, SIZE_CONFIG } from '@/config';
import { observeElementRect } from '@/utils';

interface UseTicksOptions {
  data: DataItem[];
  getContainerElement: () => HTMLDivElement;
}

function isTimeRange(time: DataItem['time']): time is [Time, Time] {
  return Array.isArray(time) && time.length === 2;
}

export function useTicks(options: UseTicksOptions = {} as UseTicksOptions) {
  const { data, getContainerElement } = options;
  /** 时间粒度（默认1分钟） */
  const [granularityIndex, setGranularityIndex] = React.useState(7);
  const [containerWidth, setContainerWidth] = React.useState(0);

  const onZoom = (val: number) => {
    if (val > 0) {
      setGranularityIndex((prev) => {
        return prev >= GRANULARITIES.length - 1 ? prev : prev + 1;
      });
    }
    else {
      setGranularityIndex((prev) => {
        return prev <= 0 ? 0 : prev - 1;
      });
    }
  };

  React.useEffect(
    () => {
      const containerElement = getContainerElement();
      if (!containerElement)
        return;

      const unsub = observeElementRect(containerElement, (rect) => {
        setContainerWidth(rect.width);
      });

      return unsub;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const granularity = React.useMemo(
    () => {
      return GRANULARITIES[granularityIndex] || GRANULARITIES[0];
    },
    [granularityIndex],
  );

  const timeRange = React.useMemo(
    () => {
      if (!containerWidth) {
        return null;
      }

      // 计算最大 zoom 时，时间范围
      const maxGranularity = GRANULARITIES[GRANULARITIES.length - 1];
      const maxGranularityTickCount = Math.round(containerWidth / maxGranularity.tickGap + SIZE_CONFIG.axisTickWidth);
      const maxGranularityMilliseconds = maxGranularityTickCount * maxGranularity.step * SCALE_MILLISECONDS[maxGranularity.scale];

      // 计算数据真实的范围
      const dateTimes = data
        .flatMap((item) => {
          if (isTimeRange(item.time)) {
            return [dayjs(item.time[0]), dayjs(item.time[1])];
          }
          return [dayjs(item.time)];
        })
        .sort((a, b) => a.valueOf() - b.valueOf());

      const minTime = dateTimes.length ? dateTimes[0] : dayjs();
      const maxTime = dateTimes.length ? dateTimes[dateTimes.length - 1] : dayjs();

      const dataRangeMilliseconds = maxTime.valueOf() - minTime.valueOf();

      if (dataRangeMilliseconds > maxGranularityMilliseconds) {
        return {
          start: minTime.subtract(30, 'day').startOf('day'),
          end: maxTime.add(30, 'day').startOf('day'),
        };
      }
      else {
        return {
          start: minTime.subtract(maxGranularityMilliseconds - dataRangeMilliseconds, 'millisecond').subtract(30, 'day').startOf('day'),
          end: maxTime.add(30, 'day').startOf('day'),
        };
      }
    },
    [containerWidth, data],
  );

  const ticks = React.useMemo(
    () => {
      const ticks: Tick[] = [];

      if (!timeRange) {
        return ticks;
      }

      const { step, scale } = granularity;

      for (let time = timeRange.start; time.isBefore(timeRange.end); time = time.add(step, scale)) {
        ticks.push({
          time,
        });
      }

      return ticks;
    },

    [timeRange, granularity],
  );

  return {
    ticks,
    granularity,
    timeRange,
    onZoom,
  };
}

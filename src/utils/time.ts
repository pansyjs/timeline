import type { DataItem, Time, TimeRange, TimeRangeDayJS } from '../types';
import dayjs from 'dayjs';

const isTimeRange = (time: DataItem['time']): time is [Time, Time] =>
  Array.isArray(time) && time.length === 2;

/**
 * 处理时间范围为整小时
 * @param props
 * @returns
 */
function processTimeRange(props: TimeRange): TimeRangeDayJS {
  const { start, end } = props;

  const isEndExactHour =
    dayjs(end).minute() === 0 &&
    dayjs(end).second() === 0 &&
    dayjs(end).millisecond() === 0;

  return {
    start: dayjs(start).startOf('hour'),
    end: isEndExactHour
      ? dayjs(end)
      : dayjs(end).add(1, 'hour').startOf('hour')
  };
}

interface CalculateTimeRangeOptions {
  /**
   * 扩展时间范围，留出边距，单位为分钟
   * @default 30
   */
  padding?: number;
  /**
   * 最小的时间范围，单位为分钟
   * @default 60 * 24
   */
  minRange?: number;
  /**
   * 空数据时的默认时间范围中心点（默认当前时间）
   */
  defaultCenter?: Time;
}

/**
 * 计算数据的时间范围
 * @param data
 * @returns
 */
export function calculateTimeRange(data: DataItem[], options: CalculateTimeRangeOptions = {}) {
  const {
    padding = 30,
    minRange = 60 * 24,
    defaultCenter = dayjs()
  } = options;

  const centerTime = dayjs(defaultCenter);
  const defaultTimeRange = {
    start: centerTime.subtract(minRange / 2, 'minute'),
    end: centerTime.add(minRange / 2, 'minute'),
  }

  if (!data || data.length === 0) {
    return processTimeRange(defaultTimeRange);
  }

  const allTimes = data.flatMap(item => {
    if (isTimeRange(item.time)) {
      return [dayjs(item.time[0]), dayjs(item.time[1])];
    }
    return [dayjs(item.time)];
  });

  if (allTimes.length === 1) {
    const centerTime = dayjs(allTimes[0]);

    return processTimeRange({
      start: centerTime.subtract(minRange / 2, 'minute'),
      end: centerTime.add(minRange / 2, 'minute'),
    })
  }

  // 计算原始时间范围
  const minTime = dayjs(Math.min(...allTimes.map(t => t.valueOf())));
  const maxTime = dayjs(Math.max(...allTimes.map(t => t.valueOf())));

  // 应用边距
  const trimmedStartTime = minTime.subtract(padding, 'minute');
  const trimmedEndTime = maxTime.add(padding, 'minute');

  // 应用最小时间范围约束
  const timeRange = trimmedEndTime.diff(trimmedStartTime, 'minute');
  // 时间范围不足时，向两侧扩展
  if (timeRange < minRange) {
    const extendBy = (minRange - timeRange) / 2;

    return processTimeRange({
      start: trimmedStartTime.subtract(extendBy, 'minute'),
      end: trimmedEndTime.add(extendBy, 'minute')
    });
  }

  return processTimeRange({
    start: trimmedStartTime,
    end: trimmedEndTime
  });
}

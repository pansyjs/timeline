import type { DataItem, Time, TimeRange } from '@/types';
import dayjs from 'dayjs';

interface CalculatePositionFromTimeOptions {
  /** 需要计算位置的目标时间 */
  targetTime: Time;
  /** 时间轴的起始基准时间 */
  baseTime: Time;
  /** 每个刻度代表的时间间隔（毫秒） */
  tickIntervalMs: number;
  /** 单个刻度的宽度（像素） */
  tickWidth: number;
  /** 刻度之间的间距（像素） */
  tickGap: number;
  /** 事件刻度左侧偏移 */
  paddingStart: number;
  /** 点的大小 */
  pointSize: number;
}

/**
 * 根据目标时间计算其在时间轴上的像素位置
 * @param opts
 */
export function calculatePositionFromTime(opts: CalculatePositionFromTimeOptions) {
  const {
    targetTime,
    baseTime,
    tickIntervalMs,
    tickWidth,
    tickGap,
    paddingStart,
    pointSize,
  } = opts;

  const targetTimestamp = dayjs(targetTime).valueOf();
  const baseTimestamp = dayjs(baseTime).valueOf();
  const timeDiffMs = targetTimestamp - baseTimestamp;

  const ticksCount = timeDiffMs / tickIntervalMs;

  return ticksCount * (tickWidth + tickGap) + paddingStart - pointSize / 2;
}

interface CalculateWidthFormTimeRangeOptions {
  /** 需要计算位置的目标时间 */
  timeRange: TimeRange;
  /** 每个刻度代表的时间间隔（毫秒） */
  tickIntervalMs: number;
  /** 单个刻度的宽度（像素） */
  tickWidth: number;
  /** 刻度之间的间距（像素） */
  tickGap: number;
}

export function calculateWidthFormTimeRange(opts: CalculateWidthFormTimeRangeOptions) {
  const {
    timeRange,
    tickIntervalMs,
    tickWidth,
    tickGap,
  } = opts;

  const startTimestamp = dayjs(timeRange.start).valueOf();
  const endTimestamp = dayjs(timeRange.end).valueOf();
  const timeDiffMs = endTimestamp - startTimestamp;

  const ticksCount = timeDiffMs / tickIntervalMs;

  return ticksCount * (tickWidth + tickGap) + tickGap;
}

/**
 * 获取开始时间
 */
export function getStartTime(time: DataItem['time']) {
  return Array.isArray(time) ? time[0] : time;
}

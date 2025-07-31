import React from 'react';
import type { ConfigType, Dayjs } from 'dayjs';

type Time = NonNullable<ConfigType>;

interface TimeRange {
  start: Time;
  end: Time;
}

interface TimeRangeDayJS {
  start: Dayjs;
  end: Dayjs;
}

/** 时间轴视图类型 */
type TimeAxisView  = 'month' | 'day' | 'hour' | 'minute' | 'second';

interface DataItem {
  /** 数据唯一标识 */
  id: string;
  /** 标题 */
  title: string;
  /** 颜色 */
  color?: string,
  /**
   * 时间
   *  - 数组表示该事件为持续事件
   *  - 单个时间戳表示该事件为瞬时事件
   */
  time: [Time, Time] | Time;
  [key: string]: any;
}

interface Tick {
  /** 刻度对应的时间 */
  time: Dayjs;
}


interface BaseProps {
   /** 额外的样式类 */
  className?: string;
  /** 额外的样式 */
  style?: React.CSSProperties;
  /**
   * 样式前缀
   * @default pansy
   */
  prefixCls?: string;
}

interface TimeLineProps extends BaseProps {
  /**
   * 是否可移动
   * @default true
   */
  moveable?: boolean;
  /**
   * 是否可缩放
   * @default true
   */
  zoomable?: boolean;
  /** 数据 */
  data: DataItem[];
  /**
   * 默认颜色
   * @default #2B6DE5
   */
  defaultColor?: string;
}

interface TimeAxisProps extends Omit<BaseProps, 'prefixCls'> {
  /** 时间范围 */
  timeRange?: TimeRangeDayJS;
  children?: React.ReactNode;
}

interface TimePointProps extends Omit<BaseProps, 'prefixCls'> {
  /** 是否 Hover */
  hover?: boolean;
  /** 卡片数据 */
  data: DataItem;
}

interface TimeCardProps extends Omit<BaseProps, 'prefixCls'> {
  /** 是否 Hover */
  hover?: boolean;
  /** 卡片数据 */
  data: DataItem;
}

export type {
  Time,
  TimeAxisView,
  DataItem,
  TimeLineProps,
  TimeAxisProps,
  TimePointProps,
  TimeCardProps,
  Tick,
  TimeRange,
  TimeRangeDayJS,
}

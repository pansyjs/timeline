import type { ConfigType, Dayjs } from 'dayjs';

type Time = ConfigType;

/** 时间轴视图类型 */
type TimeAxisView  = 'month' | 'day' | 'hour' | 'minute' | 'second';

interface DataItem {
  /** 数据唯一标识 */
  id: string;
  /** 标题 */
  title: string;
  /**
   * 时间
   *  - 数组表示该事件为持续事件
   *  - 单个时间戳表示该事件为瞬时事件
   */
  time: [Time, Time] | Time;
  [key: string]: any;
}

interface TimeLineProps {
  /** 数据 */
  data: DataItem[];
}

interface TimeAxisProps {
  /** 时间范围 */
  times?: [Dayjs, Dayjs];
}

export type {
  Time,
  TimeAxisView,
  DataItem,
  TimeLineProps,
  TimeAxisProps,
}

import type { ConfigType, Dayjs } from 'dayjs';
import type React from 'react';

type Time = NonNullable<ConfigType>;
type Key = number | string | bigint;

interface Rect {
  /** 节点宽度 */
  width: number;
  /** 节点高度 */
  height: number;
}

interface TimeRange {
  start: Time;
  end: Time;
}

interface TimeRangeDayJS {
  start: Dayjs;
  end: Dayjs;
}

/** 时间轴视图类型 */
type TimeAxisView = 'month' | 'day' | 'hour' | 'minute' | 'second';

interface DataItem {
  /** 数据唯一标识 */
  id: string;
  /** 标题 */
  title: string;
  /** 颜色 */
  color?: string;
  /**
   * 是否使用全局的自定义渲染
   * @default true
   */
  customRender?: boolean;
  /**
   * 时间
   *  - 数组表示该事件为持续事件
   *  - 单个时间戳表示该事件为瞬时事件
   */
  time: [Time, Time] | Time;
  [key: string]: any;
}

interface VirtualItem extends Rect {
  /** 唯一标识 */
  key: Key;
  /** 横向坐标 */
  x: number;
  /** 纵向坐标 */
  y: number;
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

interface TimeLineProps<D extends DataItem = DataItem> extends BaseProps {
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
  data: D[];
  /**
   * 默认颜色
   * @default #2B6DE5
   */
  defaultColor?: string;
  /** 自定义渲染卡片 */
  renderCard?: TimeCardProps<D>['render'];
  /**
   * 选择事件
   */
  onSelect?: (data: D | null) => void;
}

interface TimeAxisProps extends Omit<BaseProps, 'prefixCls'> {
  /** 时间范围 */
  timeRange?: TimeRangeDayJS;
  children?: React.ReactNode;
}

interface TimePointProps extends Omit<BaseProps, 'prefixCls'> {
  /** 是否 Hover */
  hover?: boolean;
  /** 当前是否选中 */
  checked?: boolean;
  /** 卡片数据 */
  data: DataItem;
}

interface TimeCardProps<D extends DataItem = DataItem> extends Omit<BaseProps, 'prefixCls'> {
  /** 是否 Hover */
  hover?: boolean;
  /** 当前是否选中 */
  checked?: boolean;
  /** 卡片数据 */
  data: D;
  /**
   * 卡片位置
   * @default 24
   */
  position?: number;
  render?: (data: D) => React.ReactNode;
}

export type {
  DataItem,
  Key,
  Rect,
  Tick,
  Time,
  TimeAxisProps,
  TimeAxisView,
  TimeCardProps,
  TimeLineProps,
  TimePointProps,
  TimeRange,
  TimeRangeDayJS,
  VirtualItem,
};

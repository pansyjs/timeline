import type { Emitter } from 'mitt';

type DateType = Date | number | string;

type TimeAxisScaleType
  = 'millisecond'
    | 'second'
    | 'minute'
    | 'hour'
    | 'weekday'
    | 'day'
    | 'week'
    | 'month'
    | 'year';

// eslint-disable-next-line ts/consistent-type-definitions
type Events = {
  ens: any;
};

/** 数据项 */
interface DataItem {
  /** 数据唯一标识 */
  id: string;
  /** 标题 */
  title: string;
  /**
   * 颜色
   * @default #2B6DE5
   */
  color?: string;
  /** 开始时间 */
  start: DateType;
  /** 结束时间 */
  end?: DateType;
  [key: string]: any;
}

interface Dom {
  container: HTMLElement;
  root: HTMLElement;
  top: HTMLElement;
}

interface Body {
  dom: Dom;
  emitter: Emitter<Events>;
}

interface TimelineOptions {
  /**
   * 样式前缀
   * @default 'pansy-timeline'
   */
  prefixCls?: string;
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
}

interface TimeAxisOptions {
  scale?: TimeAxisScaleType;
  step?: number;
}

export type {
  Body,
  DataItem,
  DateType,
  Dom,
  TimeAxisOptions,
  TimelineOptions,
};

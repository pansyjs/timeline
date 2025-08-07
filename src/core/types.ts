import type Hammer from '@egjs/hammerjs';
import type { Emitter } from 'mitt';
import type { KeysOfUnion } from 'type-fest';
import type { DataInterface } from 'vis-data';
import type { Range } from './Range';

// ----------- Hammer ----------
type HammerType = typeof Hammer;
type HammerManager = InstanceType<HammerType>;
type HammerRecognizer = ReturnType<HammerManager['get']>;
type HammerInput = Parameters<HammerRecognizer['emit']>['0'];

type DateType = Date | number | string;
type IdType = string | number;
type HeightWidthType = IdType;

type DataInterfaceDataItem = DataInterface<DataItem, 'id'>;
type DataItemCollectionType = DataItem[] | DataInterfaceDataItem;

interface HiddenDateOption {
  start: DateType;
  end: DateType;
  repeat?: 'daily' | 'weekly' | 'monthly' | 'yearly';
}

type HiddenDatesType = HiddenDateOption | HiddenDateOption[];

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

interface RangeChangeEvent {
  /** 开始时间 */
  start: Date;
  /** 结束时间 */
  end: Date;
  /** 是否由用户触发 */
  byUser: boolean;
  event: HammerInput;
}
// eslint-disable-next-line ts/consistent-type-definitions
type Events = {
  verticalDrag: void;
  touch: HammerInput;
  release: HammerInput;
  // 拖动相关事件
  pan: HammerInput;
  panstart: HammerInput;
  panmove: HammerInput;
  panend: HammerInput;
  // Range 相关事件
  rangechange: RangeChangeEvent;
  rangechanged: RangeChangeEvent;
  _change: void;
  changed: void;
};

type EventKeys = KeysOfUnion<Events>;

interface PropsItem {
  width: number;
  height: number;
  top: number;
  bottom: number;
  left: number;
  right: number;
}

interface Touch {
  /** 是否允许拖动 */
  allowDragging: boolean;
  initialScrollTop: number;
}

interface Props {
  root: PropsItem;
  background: PropsItem;
  centerContainer: PropsItem;
  center: PropsItem;
  top: PropsItem;
  scrollbarWidth: number;
  scrollTop: number;
  scrollTopMin: number;
}

interface FormatItem {
  millisecond: string;
  second: string;
  minute: string;
  hour: string;
  weekday: string;
  day: string;
  week: string;
  month: string;
  year: string;
}

type FormatItemFun = (date: any, scale: string, step: number) => string;

interface Format {
  minorLabels: FormatItem | FormatItemFun;
  majorLabels: FormatItem | FormatItemFun;
};

/** 数据项 */
interface DataItem {
  /** 数据唯一标识 */
  id: IdType;
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
  root: HTMLDivElement;
  top: HTMLDivElement;
  background: HTMLDivElement;
  centerContainer: HTMLDivElement;
  center: HTMLDivElement;
}

interface BodyHiddenDatesItem {
  start: number;
  end: number;
  remove?: boolean;
}

interface Body {
  /** 样式前缀 */
  prefixCls: string;
  dom: Dom;
  domProps: Props;
  range: Range;
  emitter: Emitter<Events>;
  /** 隐藏的时间 */
  hiddenDates: BodyHiddenDatesItem[];
  util: {
    toTime: (x: number) => Date;
    toScreen: (x: number) => number;
  };
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
  /**
   * 点击使用
   * @default false
   */
  clickToUse?: boolean;
  height?: HeightWidthType;
  width?: HeightWidthType;
  /** 组件最大高度 */
  maxHeight?: HeightWidthType;
  /**
   * 组件最小高度
   * @default 500
   */
  minHeight?: HeightWidthType;
  // Range
  /** 开始时间 */
  start?: number;
  /** 结束时间 */
  end?: number;
  /** 最小时间 */
  min?: DateType;
  /** 最大时间 */
  max?: DateType;
  /** 每次 zoom 最大的毫秒数 */
  zoomMax?: number;
  /** 每次 zoom 最小的毫秒数 */
  zoomMin?: number;
  maxMinorChars?: number;
  showMinorLabels: boolean;
  showMajorLabels: boolean;
  showWeekScale: boolean;
  /**
   * 隐藏的时间
   * @default []
   */
  hiddenDates?: HiddenDatesType;
  /** 初始绘制完成 */
  onInitialDrawComplete?: () => void;
}

interface RangeOptions {
  start?: number;
  end?: number;
  min?: DateType;
  max?: DateType;
  // milliseconds
  zoomMin?: number | string;
  // milliseconds
  zoomMax?: number | string;
}

interface RangeProps {
  touch: RangeTouch;
}

interface RangeTouch {
  /** 开始时间 */
  start: number;
  /** 结束时间 */
  end: number;
  /** 是否允许拖动 */
  allowDragging: boolean;
  /** 是否拖动 */
  dragging: boolean;
  center: {
    x: number;
    y: number;
  } | null;
  centerDate: number | null;
}

interface TimeAxisOptions {
  scale?: TimeAxisScaleType;
  step?: number;
}

export type {
  Body,
  DataInterfaceDataItem,
  DataItem,
  DataItemCollectionType,
  DateType,
  Dom,
  EventKeys,
  Format,
  HammerInput,
  HammerManager,
  HammerRecognizer,
  HammerType,
  HiddenDatesType,
  Props,
  RangeOptions,
  RangeProps,
  RangeTouch,
  TimeAxisOptions,
  TimeAxisScaleType,
  TimelineOptions,
  Touch,
};

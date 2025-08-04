export const defaultPrefixCls = 'pansy';

type Scale = 'minute' | 'hour' | 'day';

interface GranularityItem {
  scale: Scale;
  step: number;
  labelStep: number;
  tickGap: number;
  majorLabelFormat: string;
  minorLabelFormat: string;
}

export const SCALE_MILLISECONDS: Record<Scale, number> = {
  day: 1000 * 60 * 60 * 24,
  hour: 1000 * 60 * 60,
  minute: 100 * 60,
};

// 定义时间粒度选项
export const GRANULARITIES: GranularityItem[] = [
  { scale: 'minute', step: 1, labelStep: 10, tickGap: 8, majorLabelFormat: 'YYYY-MM-DD', minorLabelFormat: 'HH:mm:ss' },
  { scale: 'minute', step: 5, labelStep: 10, tickGap: 8, majorLabelFormat: 'YYYY-MM-DD', minorLabelFormat: 'HH:mm:ss' },
  { scale: 'minute', step: 10, labelStep: 10, tickGap: 8, majorLabelFormat: 'YYYY-MM-DD', minorLabelFormat: 'HH:mm:ss' },
  { scale: 'minute', step: 30, labelStep: 10, tickGap: 8, majorLabelFormat: 'YYYY-MM-DD', minorLabelFormat: 'HH:mm:ss' },
  { scale: 'hour', step: 1, labelStep: 5, tickGap: 8, majorLabelFormat: 'YYYY-MM-DD', minorLabelFormat: 'HH:mm' },
  { scale: 'hour', step: 6, labelStep: 5, tickGap: 8, majorLabelFormat: 'YYYY-MM-DD', minorLabelFormat: 'HH:mm' },
  { scale: 'hour', step: 12, labelStep: 5, tickGap: 8, majorLabelFormat: 'YYYY-MM-DD', minorLabelFormat: 'HH:mm' },
  { scale: 'day', step: 1, labelStep: 2, tickGap: 16, majorLabelFormat: 'YYYY-MM', minorLabelFormat: 'DD' },
];

export const DEFAULT_FORMAT = 'YYYY-MM-DD HH:mm:ss';
export const DEFAULT_COLOR = '#2B6DE5';

// 尺寸配置
export const SIZE_CONFIG = {
  // 卡片相关
  /** 卡片纵向初始间距 */
  cardFirstRowMargin: 24,
  /** 卡片纵向行间距 */
  cardRowGap: 16,

  // 时间轴相关
  axisPaddingStart: 48,
  axisPaddingEnd: 48,
  /** 刻度的宽度 */
  axisTickWidth: 1,

  // 点和范围相关
  pointSize: 8,
};

/** Zoom 配置，毫秒 */
export const DEFAULT_ZOOM_CONFIG = {
  /** 一分钟 */
  min: 1000 * 60,
  /** 一天 */
  max: 1000 * 60 * 60 * 24,
};

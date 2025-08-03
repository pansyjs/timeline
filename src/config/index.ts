import type { ManipulateType } from 'dayjs';

export const defaultPrefixCls = 'pansy';

interface GranularityItem {
  scale: ManipulateType;
  step: number;
  labelStep: number;
  majorLabelFormat: string;
  minorLabelFormat: string;
}

// 定义时间粒度选项（毫秒数）
export const GRANULARITIES: GranularityItem[] = [
  { scale: 'minute', step: 1, labelStep: 10, majorLabelFormat: 'YYYY-MM-DD', minorLabelFormat: 'HH:mm:ss' },
  { scale: 'minute', step: 5, labelStep: 10, majorLabelFormat: 'YYYY-MM-DD', minorLabelFormat: 'HH:mm:ss' },
  { scale: 'minute', step: 10, labelStep: 10, majorLabelFormat: 'YYYY-MM-DD', minorLabelFormat: 'HH:mm:ss' },
  { scale: 'minute', step: 30, labelStep: 10, majorLabelFormat: 'YYYY-MM-DD', minorLabelFormat: 'HH:mm:ss' },
  { scale: 'hour', step: 1, labelStep: 5, majorLabelFormat: 'YYYY-MM-DD', minorLabelFormat: 'HH:mm' },
  { scale: 'hour', step: 6, labelStep: 5, majorLabelFormat: 'YYYY-MM-DD', minorLabelFormat: 'HH:mm' },
  { scale: 'hour', step: 12, labelStep: 5, majorLabelFormat: 'YYYY-MM-DD', minorLabelFormat: 'HH:mm' },
  { scale: 'day', step: 1, labelStep: 1, majorLabelFormat: 'YYYY-MM', minorLabelFormat: 'DD' },
];

export const AXIS_CONFIG = {
  paddingStart: 48,
  paddingEnd: 48,
  /** 刻度的宽度 */
  width: 1,
}

export const POINT_SIZE = 8;

export const DEFAULT_FORMAT = 'YYYY-MM-DD HH:mm:ss';
export const DEFAULT_COLOR = '#2B6DE5';

// 尺寸配置
export const SIZE_CONFIG = {
  /** 卡片纵向初始间距 */
  cardInitialGap: 24,
  /** 卡片纵向间距 */
  cardGap: 16,
}

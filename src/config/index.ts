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

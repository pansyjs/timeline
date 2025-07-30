import type { ManipulateType } from 'dayjs';

export const defaultPrefixCls = 'pansy';

interface GranularityItem {
  unit: ManipulateType;
  step: number;
  labelStep: number;
  majorLabelFormat: string;
  minorLabelFormat: string;
}

// 定义时间粒度选项（毫秒数）
export const GRANULARITIES: GranularityItem[] = [
  { unit: 'minute', step: 1, labelStep: 10, majorLabelFormat: 'YYYY-MM-DD', minorLabelFormat: 'HH:mm:ss' },
  { unit: 'minute', step: 5, labelStep: 10, majorLabelFormat: 'YYYY-MM-DD', minorLabelFormat: 'HH:mm:ss' },
  { unit: 'minute', step: 10, labelStep: 10, majorLabelFormat: 'YYYY-MM-DD', minorLabelFormat: 'HH:mm:ss' },
  { unit: 'minute', step: 30, labelStep: 10, majorLabelFormat: 'YYYY-MM-DD', minorLabelFormat: 'HH:mm:ss' },
  { unit: 'hour', step: 1, labelStep: 5, majorLabelFormat: 'YYYY-MM-DD', minorLabelFormat: 'HH:mm' },
  { unit: 'hour', step: 6, labelStep: 5, majorLabelFormat: 'YYYY-MM-DD', minorLabelFormat: 'HH:mm' },
  { unit: 'hour', step: 12, labelStep: 5, majorLabelFormat: 'YYYY-MM-DD', minorLabelFormat: 'HH:mm' },
  { unit: 'day', step: 1, labelStep: 1, majorLabelFormat: 'YYYY-MM', minorLabelFormat: 'DD' },
];

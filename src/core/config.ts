import type { Format } from './types';

export const FORMAT: Format = {
  minorLabels: {
    millisecond: 'SSS',
    second: 's',
    minute: 'HH:mm',
    hour: 'HH:mm',
    weekday: 'ddd D',
    day: 'DD',
    week: 'w',
    month: 'MMM',
    year: 'YYYY',
  },
  majorLabels: {
    millisecond: 'HH:mm:ss',
    second: 'D MMMM HH:mm',
    minute: 'ddd D MMMM',
    hour: 'ddd D MMMM',
    weekday: 'MMMM YYYY',
    day: 'YYYY年MM月',
    week: 'MMMM YYYY',
    month: 'YYYY',
    year: '',
  },
};

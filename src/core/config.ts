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
    month: 'MM',
    year: 'YYYY',
  },
  majorLabels: {
    millisecond: 'HH:mm:ss',
    second: 'MM-DD HH:mm:00',
    minute: 'MM-DD HH:00',
    hour: 'MM-DD',
    weekday: 'MMMM YYYY',
    day: 'YYYY-MM',
    week: 'MMMM YYYY',
    month: 'YYYY',
    year: '',
  },
};

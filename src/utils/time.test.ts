import type { DataItem } from '@/types';
import { expect, it } from 'vitest';
import { calculateTimeRange } from './time';

const mockEvents: DataItem[] = [
  {
    id: '1',
    title: '单点事件',
    time: '2024-03-10 10:00:00',
  },
  {
    id: '2',
    title: '时间范围事件',
    time: ['2024-03-10 11:30:00', '2024-03-10 13:30:00'],
  },
  {
    id: '3',
    title: '单点事件',
    time: '2024-03-10 16:00:00',
  },
  {
    id: '4',
    title: '长时间范围事件',
    time: ['2024-03-10 14:15:00', '2024-03-10 18:15:00'],
  },
  {
    id: '5',
    title: '长时间范围事件',
    time: ['2024-03-10 19:15:00', '2024-03-10 23:15:00'],
  },
  {
    id: '6',
    title: '长时间范围事件',
    time: ['2024-03-12 15:15:00', '2024-03-12 17:15:00'],
  },
  {
    id: '7',
    title: '长时间范围事件6',
    time: ['2024-03-13 19:15:00', '2024-03-13 23:15:00'],
  },
  {
    id: '8',
    title: '长时间范围事件7',
    time: ['2024-05-28 19:15:00', '2024-05-29 23:15:00'],
  },
];

it('实际时间范围大于最小时间范围', () => {
  const timeRange = calculateTimeRange(mockEvents);

  expect((timeRange.start).format('YYYY-MM-DD HH:mm:ss')).toBe('2024-03-10 09:00:00');
  expect((timeRange.end).format('YYYY-MM-DD HH:mm:ss')).toBe('2024-05-30 00:00:00');
});

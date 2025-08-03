import type { VirtualItem } from '../../types';
import { describe, expect, it } from 'vitest';
import { splitOverlappingItems } from './utils';

describe('splitOverlappingItems', () => {
  it('所有元素都重叠', () => {
    const items: VirtualItem[] = [
      { key: '1', x: 10, y: 10, width: 20, height: 20 },
      { key: '2', x: 12, y: 10, width: 20, height: 20 },
      { key: '3', x: 14, y: 10, width: 20, height: 20 },
    ];

    const splitItems = splitOverlappingItems(items);

    expect(splitItems).toEqual([items]);
  });

  it('部分元素存在', () => {
    const items: VirtualItem[] = [
      { key: '1', x: 10, y: 10, width: 20, height: 20 },
      { key: '2', x: 100, y: 10, width: 20, height: 20 },
      { key: '3', x: 14, y: 10, width: 20, height: 20 },
    ];

    const splitItems = splitOverlappingItems(items);

    expect(splitItems).toEqual([[
      { key: '1', x: 10, y: 10, width: 20, height: 20 },
      { key: '3', x: 14, y: 10, width: 20, height: 20 },
    ]]);
  });

  it('存在多个重叠', () => {
    const items: VirtualItem[] = [
      { key: '1', x: 10, y: 10, width: 20, height: 20 },
      { key: '2', x: 100, y: 10, width: 20, height: 20 },
      { key: '3', x: 14, y: 10, width: 20, height: 20 },
      { key: '4', x: 110, y: 10, width: 20, height: 20 },
    ];

    const splitItems = splitOverlappingItems(items);

    expect(splitItems).toEqual([
      [
        { key: '1', x: 10, y: 10, width: 20, height: 20 },
        { key: '3', x: 14, y: 10, width: 20, height: 20 },
      ],
      [
        { key: '2', x: 100, y: 10, width: 20, height: 20 },
        { key: '4', x: 110, y: 10, width: 20, height: 20 },
      ],
    ]);
  });
});

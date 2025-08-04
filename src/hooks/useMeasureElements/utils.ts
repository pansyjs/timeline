import type { Rect } from '@/types';
import { getRect } from '@/utils';

export function measureElement<ItemElement extends Element>(
  element: ItemElement,
  entry: ResizeObserverEntry | undefined,
): Rect {
  const handler = (rect: Rect) => {
    const { width, height } = rect;
    return { width: Math.round(width), height: Math.round(height) };
  };

  if (entry?.borderBoxSize) {
    const box = entry.borderBoxSize[0];

    if (box) {
      return handler({ width: box.inlineSize, height: box.blockSize });
    }
  }

  return handler(getRect(element as unknown as HTMLElement));
}

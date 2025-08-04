import type { Rect } from '@/types';

/**
 * 获取元素的宽高信息
 * @param element
 */
export function getRect(element: HTMLElement): Rect {
  return {
    width: element.offsetWidth,
    height: element.offsetHeight,
  };
}

/**
 * 观察元素尺寸变化
 * @param element
 * @param cb
 */
export function observeElementRect<T extends Element>(element: T, cb: (rect: Rect) => void) {
  if (!element) {
    return;
  }

  let targetWindow: (Window & typeof globalThis) | null = null;
  if (element && 'ownerDocument' in element) {
    targetWindow = element.ownerDocument.defaultView;
  }
  else {
    targetWindow = (element as any)?.window ?? null;
  }

  if (!targetWindow) {
    return;
  }

  const handler = (rect: Rect) => {
    const { width, height } = rect;
    cb({ width: Math.round(width), height: Math.round(height) });
  };

  if (!targetWindow.ResizeObserver) {
    return () => {};
  }

  const observer = new targetWindow.ResizeObserver((entries) => {
    const run = () => {
      const entry = entries[0];
      if (entry?.borderBoxSize) {
        const box = entry.borderBoxSize[0];
        if (box) {
          handler({ width: box.inlineSize, height: box.blockSize });
          return;
        }
      }
      handler(getRect(element as unknown as HTMLElement));
    };

    requestAnimationFrame(run);
  });

  observer.observe(element, { box: 'border-box' });

  return () => {
    observer.unobserve(element);
  };
}

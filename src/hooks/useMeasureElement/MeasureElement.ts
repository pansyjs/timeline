import type { Key, VirtualItem } from './types';
import { isEqual, omit } from 'es-toolkit';
import { SIZE_CONFIG } from '@/config';
import { measureElement } from './utils';

export interface MeasureElementOptions<ContainerElement extends Element, ItemElement extends Element> {
  keyAttribute?: string;
  getContainerElement: () => ContainerElement | null;
  useAnimationFrameWithResizeObserver?: boolean;
  onChange?: (instance: MeasureElement<ContainerElement, ItemElement>) => void;
}

export class MeasureElement<ContainerElement extends Element, ItemElement extends Element> {
  options!: Required<MeasureElementOptions<ContainerElement, ItemElement>>;
  containerElement: ContainerElement | null = null;
  targetWindow: (Window & typeof globalThis) | null = null;
  itemRectCache = new Map<Key, VirtualItem>();
  elementsCache = new Map<Key, ItemElement>();

  private observer = (() => {
    let _ro: ResizeObserver | null = null;

    const get = () => {
      if (_ro) {
        return _ro;
      }

      if (!this.targetWindow || !this.targetWindow.ResizeObserver) {
        return null;
      }

      return (_ro = new this.targetWindow.ResizeObserver((entries) => {
        entries.forEach((entry) => {
          const run = () => {
            this._measureElement(entry.target as ItemElement, entry);
          };
          this.options.useAnimationFrameWithResizeObserver
            ? requestAnimationFrame(run)
            : run();
        });
      }));
    };

    return {
      disconnect: () => {
        get()?.disconnect();
        _ro = null;
      },
      observe: (target: Element) =>
        get()?.observe(target, { box: 'border-box' }),
      unobserve: (target: Element) => get()?.unobserve(target),
    };
  })();

  constructor(opts: MeasureElementOptions<ContainerElement, ItemElement>) {
    this.setOptions(opts);
  }

  setOptions = (opts: MeasureElementOptions<ContainerElement, ItemElement>) => {
    Object.entries(opts).forEach(([key, value]) => {
      if (typeof value === 'undefined')
        delete (opts as any)[key];
    });

    this.options = Object.assign(
      {
        useAnimationFrameWithResizeObserver: true,
        keyAttribute: 'data-key',
      },
      opts,
    ) as Required<MeasureElementOptions<ContainerElement, ItemElement>>;
  };

  private cleanup = () => {
    this.observer.disconnect();
    this.containerElement = null;
    this.targetWindow = null;
  };

  private notify = () => {
    this.options.onChange?.(this);
  };

  _didMount = () => {
    return () => {
      this.cleanup();
    };
  };

  _willUpdate = () => {
    const containerElement = this.options.getContainerElement();

    if (this.containerElement !== containerElement) {
      this.cleanup();

      if (!containerElement) {
        return;
      }

      this.containerElement = containerElement;

      if (this.containerElement && 'ownerDocument' in this.containerElement) {
        this.targetWindow = this.containerElement.ownerDocument.defaultView;
      }
      else {
        // @ts-expect-error 降级兼容
        this.targetWindow = this.scrollElement?.window ?? null;
      }

      this.elementsCache.forEach((cached) => {
        this.observer.observe(cached);
      });
    }
  };

  keyFromElement = (node: ItemElement) => {
    const attributeName = this.options.keyAttribute;
    const keyStr = node.getAttribute(attributeName);

    if (!keyStr) {
      console.warn(
        `Missing attribute name '${attributeName}={key}' on measured element.`,
      );
      return '';
    }

    return keyStr;
  };

  private _measureElement = (
    node: ItemElement,
    entry: ResizeObserverEntry | undefined,
  ) => {
    const key = this.keyFromElement(node);

    const prevNode = this.elementsCache.get(key);

    if (prevNode !== node) {
      if (prevNode) {
        this.observer.unobserve(prevNode);
      }

      this.observer.observe(node);
      this.elementsCache.set(key, node);
    }

    if (node.isConnected) {
      const rect = measureElement(node, entry);
      const clientRect = node.getClientRects()[0]!;
      const itemRect = this.itemRectCache.get(key);

      const domRect = {
        ...rect,
        key,
        x: clientRect.x,
        y: SIZE_CONFIG.cardFirstRowMargin,
      };

      if (!itemRect) {
        this.itemRectCache.set(key, domRect);
        this.notify();

        return;
      }

      if (!isEqual(omit(domRect, ['y']), omit(itemRect, ['y']))) {
        this.itemRectCache.set(key, {
          ...domRect,
          y: itemRect?.y || SIZE_CONFIG.cardFirstRowMargin,
        });
        this.notify();
      }
    }
  };

  measureElement = (node: ItemElement | null | undefined) => {
    if (!node) {
      this.elementsCache.forEach((cached, key) => {
        if (!cached.isConnected) {
          this.observer.unobserve(cached);
          this.elementsCache.delete(key);
        }
      });
      return;
    }

    this._measureElement(node, undefined);
  };
}

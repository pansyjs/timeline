import type {
  TimeLineProps,
  TimeAxisProps,
  DataItem,
  Key,
  TimeCardProps,
  VirtualItem,
} from '../../types';
import React from 'react';
import dayjs from 'dayjs';
import { clsx } from 'clsx';
import { isEqual, omit } from 'es-toolkit'
import interact from 'interactjs';
import { TimeCard } from '../TimeCard';
import { TimeAxis } from '../TimeAxis';
import { TimePoint } from '../TimePoint';
import { TimeLineContext } from '../context';
import {
  defaultPrefixCls,
  AXIS_CONFIG,
  POINT_SIZE,
  DEFAULT_COLOR,
  SIZE_CONFIG,
} from '../../config';
import {
  getWheelType,
  calculateTimeRange,
  getPrefixCls as getPrefixClsUtil,
  calculatePositionFromTime,
  calculateWidthFormTimeRange,
} from '../../utils';
import { emitter, measureElement as measureElementUtil, getRect } from '../../utils';
import { isOverlappingX, getStartTime, keyFromElement } from './utils';
import './style/index.less';

export function TimeLine<D extends DataItem = DataItem>(props: TimeLineProps<D>) {
  const {
    className,
    style,
    data = [],
    moveable = true,
    defaultColor = DEFAULT_COLOR,
    renderCard,
    onSelect,
  } = props;

  const customPrefixCls = props.prefixCls || defaultPrefixCls;

  const rootRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [elementsCache] = React.useState(
    () => new Map<Key, HTMLDivElement>(),
  )
  const [itemRectCache] = React.useState(
    () => new Map<Key, VirtualItem>(),
  )
  const rerender = React.useReducer(() => ({}), {})[1]
  const [isDragging, setIsDragging] = React.useState(false);
  const [hoverItem, setHoverItem] = React.useState<D | null>(null);
  const [selectItem, setSelectItem] = React.useState<D | null>(null)
  const [timeRange, setTimeRange] = React.useState<TimeAxisProps['timeRange']>();

  const getPrefixCls = React.useCallback(
    (suffixCls?: string) => {
      return getPrefixClsUtil(suffixCls, customPrefixCls);
    },
    [customPrefixCls]
  );

  const prefixCls = getPrefixCls('timeline');

  function onMouseWheel(e: WheelEvent) {
    e.preventDefault();

    // console.log('deltaX', event.deltaX, 'deltaY', event.deltaY);
  }

  React.useEffect(
    () => {
      const root = rootRef.current;
      if (!root) return;

      interact(root)
        .styleCursor(false)
        .draggable({
          lockAxis: 'x',
          inertia: true,
          listeners: {
            start(e) {
              if (!moveable) return;
              emitter.emit('panstart', e);
            },
            move(e) {
              if (!moveable) return;
              emitter.emit('panmove', e);
            },
            end(e) {
              if (!moveable) return;
              emitter.emit('panend', e);
            },
          },
        })
        .on('mousedown', function() {
          setIsDragging(true);
        })
        .on('mouseup', function() {
          setIsDragging(false);
        });

      const wheelType = getWheelType();

      root.addEventListener(wheelType as 'wheel', onMouseWheel, false)

      return () => {
        interact(root).unset();
        root.removeEventListener(wheelType as 'wheel', onMouseWheel, false)
      }
    },
    []
  )

  React.useEffect(
    () => {
      const timeRange = calculateTimeRange(data, {
        padding: 30,
        minRange: 60 * 24,
        defaultCenter: new Date(),
      });

      setTimeRange(timeRange);
    },
    [data]
  );

  const handleHover = (item: D | null) => {
    setHoverItem(item);
  }

  const handleClick = (item: D) => {
    if (selectItem?.id === item.id) {
      setSelectItem(null);
      onSelect?.(null)
      return;
    }
    setSelectItem(item);
    onSelect?.(item)
  }

  const observer = (() => {
    let _ro: ResizeObserver | null = null;

    const get = () => {
      if (_ro) {
        return _ro;
      }

      if (!window.ResizeObserver) {
        return null
      }

      return (_ro = new window.ResizeObserver((entries) => {
        entries.forEach((entry) => {
          const run = () => {
            _measureElement(entry.target as HTMLDivElement, entry)
          }

          requestAnimationFrame(run);
        })
      }))
    }

    return {
      disconnect: () => {
        get()?.disconnect()
        _ro = null
      },
      observe: (target: Element) =>
        get()?.observe(target, { box: 'border-box' }),
      unobserve: (target: Element) => get()?.unobserve(target),
    }
  })();

  const _measureElement = (
    node: HTMLDivElement,
    entry: ResizeObserverEntry | undefined,
  ) => {
    const key = keyFromElement(node);

    const prevNode = elementsCache.get(key);

    if (prevNode !== node) {
      if (prevNode) {
        observer.unobserve(prevNode)
      }

      observer.observe(node)
      elementsCache.set(key, node)
    }

    if (node.isConnected) {
      const rect = measureElementUtil(node, entry);
      const clientRect = node.getClientRects()[0]!;
      const itemRect = itemRectCache.get(key);

      const domRect = {
        ...rect,
        key,
        x: clientRect.x,
        y: clientRect.y
      }

      if (!itemRect) {
        itemRectCache.set(key, domRect);

        adjustPositions();
        return;
      }

      if (!isEqual(omit(domRect, ['x']), omit(itemRect, ['x']))) {
        itemRectCache.set(key, domRect);

        adjustPositions();
      }
    }
  }

  const measureElement = React.useCallback(
    (node: HTMLDivElement) => {
      if (!node) {
        elementsCache.forEach((cached, key) => {
          if (!cached.isConnected) {
            observer.unobserve(cached)
            elementsCache.delete(key)
          }
        })
        return
      }

      _measureElement(node, undefined)
    },
    []
  )

  /**
   * 布局计算
   * @returns
   */
  const adjustPositions = () => {
    const content = contentRef.current;
    if (!content) return;

    const containerHeight = getRect(content).height;

    const virtualItems: VirtualItem[] = [];
    itemRectCache.forEach((item) => {
      virtualItems.push(item);
    });

    const sortedVirtualItems = virtualItems.sort((a, b) => {
      return dayjs(getStartTime(a.x)).isBefore(dayjs(getStartTime(b.x))) ? -1 : 1
    });

    // 跟踪每列的最大Y坐标（用于堆叠重叠的卡片）
    const columnMaxY: number[] = [];

    sortedVirtualItems.forEach((card, index) => {
      const rectInfo = itemRectCache.get(card.key)!;

      // 找到所有与当前卡片在X轴上重叠的卡片
      const overlappingVirtualItems = sortedVirtualItems.filter((otherCard, i) => {
        const otherRectInfo = itemRectCache.get(otherCard.key)!;
        return i < index && isOverlappingX(rectInfo, otherRectInfo)
      });

      if (overlappingVirtualItems.length === 0) {
        itemRectCache.set(card.key, {
          ...itemRectCache.get(card.key)!,
          y: SIZE_CONFIG.cardInitialGap,
        });
        columnMaxY.push(rectInfo.height + SIZE_CONFIG.cardInitialGap);
      } else {
        // 找到重叠卡片所在的列
        const columnIndices = overlappingVirtualItems.map(oc => {
          return sortedVirtualItems.findIndex(c => c.key === oc.key)
        });

        // 找到这些列中最底部的位置
        const maxYInColumns = Math.max(...columnIndices.map(ci => columnMaxY[ci] || 0));

        itemRectCache.set(card.key, {
          ...itemRectCache.get(card.key)!,
          y: maxYInColumns,
        });

        // 更新当前列的最大Y坐标
        columnMaxY.push(maxYInColumns + card.height + SIZE_CONFIG.cardGap);
      }

      const info = itemRectCache.get(card.key)!;

      // 确保卡片不会超出容器底部
      if (info.y + card.height > containerHeight) {
        itemRectCache.set(card.key, {
          ...itemRectCache.get(card.key)!,
          y: Math.max(0, containerHeight - card.height - SIZE_CONFIG.cardGap),
        });
      }
    })

    rerender();
  }

  return (
    <div
      className={clsx(prefixCls, className)}
      ref={rootRef}
      style={{
        cursor: isDragging ? 'grabbing' : 'grab',
        ...style
      }}
    >
      <TimeLineContext.Provider
        value={{
          prefixCls,
          getPrefixCls,
          defaultColor,
          rootElement: rootRef.current!
        }}
      >
        <TimeAxis timeRange={timeRange} />
        <div className={`${prefixCls}-content`} ref={contentRef}>
          {timeRange && data.map((item, index) => {
            const { time, id } = item;

            const positionY = itemRectCache.get(item.id)?.y || 20;

            const position = calculatePositionFromTime({
              targetTime: Array.isArray(time) ? time[0] : time,
              baseTime: timeRange.start,
              tickIntervalMs: 1000 * 60,
              tickWidth: AXIS_CONFIG.width,
              tickGap: 8,
              paddingStart: AXIS_CONFIG.paddingStart,
              potSize: POINT_SIZE,
            });

            let width: undefined | number = undefined;

            if (Array.isArray(time) && time.length === 2) {
              width = calculateWidthFormTimeRange({
                timeRange: {
                  start: time[0],
                  end: time[1],
                },
                tickIntervalMs: 1000 * 60,
                tickWidth: AXIS_CONFIG.width,
                tickGap: 8,
              });
            }

            return (
              <React.Fragment key={id || index}>
                <TimePoint
                  style={{
                    transform: `translateX(${position}px)`,
                    width: width ? `${width}px` : undefined,
                  }}
                  data={item}
                  hover={item.id === hoverItem?.id}
                  checked={item.id === selectItem?.id}
                  onMouseEnter={() => { handleHover(item) }}
                  onMouseLeave={() => { handleHover(null) }}
                  onClick={() => { handleClick(item) }}
                />

                <TimeCard
                  style={{
                    transform: `translateX(${position + 4}px)`,
                  }}
                  position={positionY}
                  ref={measureElement}
                  data-key={item.id}
                  hover={item.id === hoverItem?.id}
                  checked={item.id === selectItem?.id}
                  data={item}
                  onMouseEnter={() => { handleHover(item) }}
                  onMouseLeave={() => { handleHover(null) }}
                  onClick={() => { handleClick(item) }}
                  render={renderCard as TimeCardProps['render']}
                />
              </React.Fragment>
            )
          })}
        </div>
      </TimeLineContext.Provider>
    </div>
  );
}

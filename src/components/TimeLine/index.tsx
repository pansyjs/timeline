import type { MeasureElements } from '@/hooks';
import type {
  DataItem,
  TimeCardProps,
  TimeLineProps,
} from '@/types';
import { useVirtualizer } from '@tanstack/react-virtual';
import { clsx } from 'clsx';
import dayjs from 'dayjs';
import interact from 'interactjs';
import React from 'react';
import {
  DEFAULT_COLOR,
  DEFAULT_FORMAT,
  defaultPrefixCls,
  SCALE_MILLISECONDS,
  SIZE_CONFIG,
} from '@/config';
import { useMeasureElements, useTicks } from '@/hooks';
import {
  calculatePositionFromTime,
  calculateWidthFormTimeRange,
  getPrefixCls as getPrefixClsUtil,
  getRect,
  getStartTime,
  getWheelType,
} from '@/utils';
import { TimeLineContext } from '../context';
import { TimeCard } from '../TimeCard';
import { TimePoint } from '../TimePoint';
import { splitOverlappingItems } from './utils';
import './style/index.less';

const defaultValue: TimeLineProps['data'] = [];

export function TimeLine<D extends DataItem = DataItem>(props: TimeLineProps<D>) {
  const {
    className,
    style,
    data = defaultValue,
    moveable = true,
    defaultColor = DEFAULT_COLOR,
    renderCard,
    onSelect,
  } = props;

  const customPrefixCls = props.prefixCls || defaultPrefixCls;

  const rootRef = React.useRef<HTMLDivElement>(null);
  const axisRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [hoverItem, setHoverItem] = React.useState<D | null>(null);
  const [selectItem, setSelectItem] = React.useState<D | null>(null);
  const { onZoom, ticks, timeRange, granularity } = useTicks({
    data,
    getContainerElement: () => rootRef.current!,
  });

  const getPrefixCls = React.useCallback(
    (suffixCls?: string) => {
      return getPrefixClsUtil(suffixCls, customPrefixCls);
    },
    [customPrefixCls],
  );
  const prefixCls = getPrefixCls('timeline');
  /** 布局计算 */
  const adjustPositions = (ins: MeasureElements<HTMLDivElement, HTMLDivElement>) => {
    const itemRectCache = ins.itemRectCache;
    const content = contentRef.current;
    if (!content)
      return;

    const containerHeight = getRect(content).height;
    const minY = SIZE_CONFIG.cardFirstRowMargin;

    if (containerHeight <= minY) {
      return;
    }

    // 内聚重叠
    const splitItems = splitOverlappingItems(Array.from(itemRectCache.values()));

    // 处理重叠
    // items > 已排序，所有都是重叠的
    splitItems.forEach((items) => {
      const { cardFirstRowMargin, cardRowGap } = SIZE_CONFIG;

      /** 当前行 y 坐标 */
      let currentY = cardFirstRowMargin;
      /** 布局方向，1: 向下；-1: 向上； */
      let direction = 1;

      items.forEach((item) => {
        if (direction === 1) {
          const nextY = (currentY + item.height + cardRowGap);

          // 检查是否到达底部
          if (nextY <= containerHeight) {
            itemRectCache.set(item.key, {
              ...itemRectCache.get(item.key)!,
              y: currentY,
            });

            currentY = nextY;
          }
          else {
            direction = -1;
            currentY = containerHeight - cardFirstRowMargin - item.height;

            itemRectCache.set(item.key, {
              ...itemRectCache.get(item.key)!,
              y: currentY,
            });
          }
        }
        else {
          const nextY = (currentY - item.height - cardRowGap);

          if (nextY >= cardFirstRowMargin) {
            currentY = nextY;
            itemRectCache.set(item.key, {
              ...itemRectCache.get(item.key)!,
              y: currentY,
            });
          }
          else {
            direction = 1;
            currentY = cardFirstRowMargin;
            itemRectCache.set(item.key, {
              ...itemRectCache.get(item.key)!,
              y: currentY,
            });
          }
        }
      });
    });
  };

  const measureElements = useMeasureElements<HTMLDivElement, HTMLDivElement>({
    getContainerElement: () => contentRef.current,
    onChange: (ins) => {
      requestAnimationFrame(() => {
        adjustPositions(ins);
      });
    },
  });

  const ticksVirtualizer = useVirtualizer({
    horizontal: true,
    count: ticks.length,
    getScrollElement: () => rootRef.current,
    estimateSize: () => 1,
    gap: granularity.tickGap,
    paddingStart: SIZE_CONFIG.axisPaddingStart,
    paddingEnd: SIZE_CONFIG.axisPaddingEnd,
  });

  function onMouseWheel(e: WheelEvent) {
    e.preventDefault();
    onZoom(e.deltaY);
  }

  React.useEffect(
    () => {
      const root = rootRef.current;
      if (!root)
        return;

      interact(root)
        .styleCursor(false)
        .draggable({
          lockAxis: 'x',
          inertia: true,
          listeners: {
            move(e) {
              if (!moveable)
                return;
              ticksVirtualizer.scrollToOffset(ticksVirtualizer.scrollOffset + e.dx);
            },
          },
        })
        .on('mousedown', () => {
          setIsDragging(true);
        })
        .on('mouseup', () => {
          setIsDragging(false);
        });

      return () => {
        interact(root).unset();
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  React.useEffect(
    () => {
      const axis = axisRef.current;
      if (!axis)
        return;

      const wheelType = getWheelType();

      axis.addEventListener(wheelType as 'wheel', onMouseWheel, false);

      return () => {
        axis.removeEventListener(wheelType as 'wheel', onMouseWheel, false);
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const handleHover = (item: D | null) => {
    setHoverItem(item);
  };

  const handleClick = (item: D) => {
    if (selectItem?.id === item.id) {
      setSelectItem(null);
      onSelect?.(null);
      return;
    }
    setSelectItem(item);
    onSelect?.(item);
  };

  const contextValue = React.useMemo(() => {
    return {
      prefixCls,
      getPrefixCls,
    };
  }, [prefixCls, getPrefixCls]);

  return (
    <div
      className={clsx(prefixCls, className)}
      ref={rootRef}
      style={{
        cursor: isDragging ? 'grabbing' : 'grab',
        ...style,
      }}
    >
      <TimeLineContext.Provider value={contextValue}>
        {/* 时间轴 */}
        <div
          className={`${prefixCls}-axis`}
          ref={axisRef}
          style={{
            width: `${ticksVirtualizer.getTotalSize()}px`,
          }}
        >
          {ticksVirtualizer.getVirtualItems().map((virtualColumn) => {
            const { index, key } = virtualColumn;
            const { time } = ticks[index];
            const { labelStep, majorLabelFormat, minorLabelFormat } = granularity;

            const majorLabel = dayjs(time).format(majorLabelFormat);
            const minorLabel = dayjs(time).format(minorLabelFormat);
            const showLabel = index % labelStep === 0;

            return (
              <div
                className={clsx(`${prefixCls}-axis-tick`, {
                  [`${prefixCls}-axis-tick-major`]: showLabel,
                  [`${prefixCls}-axis-tick-big-major`]: index === 0,
                })}
                key={key}
                data-index={index}
                data-time={time.format(DEFAULT_FORMAT)}
                ref={ticksVirtualizer.measureElement}
                style={{
                  transform: `translateX(${virtualColumn.start}px)`,
                }}
              >
                {showLabel && (
                  <div className={`${prefixCls}-axis-tick-lable`}>
                    {index === 0 ? majorLabel : minorLabel}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {/* 内容区 */}
        <div className={`${prefixCls}-content`} ref={contentRef}>
          {timeRange && data.map((item, index) => {
            const { time, id } = item;
            const positionY = measureElements.itemRectCache.get(item.id)?.y || 20;
            const tickIntervalMs = granularity.step * SCALE_MILLISECONDS[granularity.scale];

            const position = calculatePositionFromTime({
              targetTime: getStartTime(time),
              baseTime: timeRange.start,
              tickIntervalMs,
              tickWidth: SIZE_CONFIG.axisTickWidth,
              tickGap: granularity.tickGap,
              paddingStart: SIZE_CONFIG.axisPaddingEnd,
              pointSize: SIZE_CONFIG.pointSize,
            });

            let width: undefined | number;

            if (Array.isArray(time) && time.length === 2) {
              width = calculateWidthFormTimeRange({
                timeRange: {
                  start: time[0],
                  end: time[1],
                },
                tickIntervalMs,
                tickWidth: SIZE_CONFIG.axisTickWidth,
                tickGap: granularity.tickGap,
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
                  onMouseEnter={() => { handleHover(item as D); }}
                  onMouseLeave={() => { handleHover(null); }}
                  onClick={() => { handleClick(item as D); }}
                />

                <TimeCard
                  style={{
                    left: position + 4,
                  }}
                  position={positionY}
                  ref={measureElements.measureElement}
                  data-key={item.id}
                  hover={item.id === hoverItem?.id}
                  checked={item.id === selectItem?.id}
                  data={item}
                  defaultColor={defaultColor}
                  onMouseEnter={() => { handleHover(item as D); }}
                  onMouseLeave={() => { handleHover(null); }}
                  onClick={() => { handleClick(item as D); }}
                  render={renderCard as TimeCardProps['render']}
                />
              </React.Fragment>
            );
          })}
        </div>
      </TimeLineContext.Provider>
    </div>
  );
}

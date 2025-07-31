import type { TimeLineProps, TimeAxisProps } from '../../types';
import React from 'react';
import { clsx } from 'clsx';
import interact from 'interactjs';
import { TimeAxis } from '../TimeAxis';
import { TimePoint } from '../TimePoint';
import { TimeLineContext } from '../context';
import { defaultPrefixCls } from '../../config';
import { getWheelType, calculateTimeRange, getPrefixCls as getPrefixClsUtil } from '../../utils';
import { emitter } from '../../utils';
import './style/index.less';

export function TimeLine(props: TimeLineProps) {
  const {
    className,
    style,
    data,
    moveable = true,
  } = props;

  const customPrefixCls =  props.prefixCls || defaultPrefixCls;

  const rootRef = React.useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);
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
  )

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
          getPrefixCls
        }}
      >
        <TimeAxis timeRange={timeRange} />
      </TimeLineContext.Provider>
    </div>
  );
}

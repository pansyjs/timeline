import type { TimeLineProps, TimeAxisProps } from '../../types';
import React from 'react';
import interact from 'interactjs';
import { TimeAxis } from '../TimeAxis';
import { ConfigContext } from '../../context';
import { getWheelType, calculateTimeRange } from '../../utils';
import { emitter } from '../../utils';
import './style/index.less';

export function TimeLine(props: TimeLineProps) {
  const { data } = props;
  const rootRef = React.useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [timeRange, setTimeRange] = React.useState<TimeAxisProps['timeRange']>();
  const { getPrefixCls } = React.useContext(ConfigContext);
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
          onstart: () => {

          },
          listeners: {
            start(e) {
              emitter.emit('panstart', e);
            },
            move(e) {
              emitter.emit('panmove', e);
            },
            end() {},
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
      className={prefixCls}
      ref={rootRef}
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
    >
      <TimeAxis timeRange={timeRange} />
    </div>
  );
}

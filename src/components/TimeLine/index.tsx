import type { TimeLineProps, TimeAxisProps } from '../../types';
import React from 'react';
import interact from 'interactjs';
import { TimeAxis } from '../Axis';
import { ConfigContext } from '../../context';
import { getWheelType } from '../../utils';
import { calculateTimeRange } from '../../utils/time';
import './style/index.less';

export function TimeLine(props: TimeLineProps) {
  const { data } = props;
  const rootRef = React.useRef<HTMLDivElement>(null);
  /** 左右拖动 */
  const positionX = React.useRef(0);
  const [timeRange, setTimeRange] = React.useState<TimeAxisProps['times']>();
  const { getPrefixCls } = React.useContext(ConfigContext);
  const prefixCls = getPrefixCls('timeline');

  function onMouseWheel(event: WheelEvent) {
    event.preventDefault();

    console.log('deltaX', event.deltaX, 'deltaY', event.deltaY);
  }

  React.useEffect(
    () => {
      const root = rootRef.current;
      if (!root) return;

      interact(root).draggable({
        lockAxis: 'x',
        inertia: true,
        listeners: {
          start () {
            positionX.current = 0;
          },
          move (event) {
            positionX.current = positionX.current + event.dx;

            console.log(positionX.current)
          },
        }
      })

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

      setTimeRange([timeRange.start, timeRange.end]);
    },
    [data]
  )

  return (
    <div className={prefixCls} ref={rootRef}>
      <TimeAxis times={timeRange} />
    </div>
  );
}

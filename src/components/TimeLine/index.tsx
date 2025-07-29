import type { TimeLineProps, TimeAxisProps } from '../../types';
import React from 'react';
import { TimeAxis } from '../Axis';
import { ConfigContext } from '../../context';
import { calculateTimeRange } from '../../utils';

export function TimeLine(props: TimeLineProps) {
  const { data } = props;
  const [timeRange, setTimeRange] = React.useState<TimeAxisProps['times']>();
  const { getPrefixCls } = React.useContext(ConfigContext);
  const prefixCls = getPrefixCls('timeline');

  React.useEffect(
    () => {
      const timeRange = calculateTimeRange(data, {
        padding: 30,
        minRange: 60 * 24,
        defaultCenter: new Date(),
      });

      setTimeRange([timeRange.startTime, timeRange.endTime]);
    },
    [data]
  )

  return (
    <div className={prefixCls}>
      <TimeAxis times={timeRange} />
    </div>
  );
}

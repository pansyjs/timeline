import type { TimeAxisProps, Tick } from '../../types';
import { clsx } from 'clsx';
import React from 'react';
import dayjs from 'dayjs';
import { ConfigContext } from '../../context';
import { GRANULARITIES } from '../../config';
import './style/index.less';

export function TimeAxis(props: TimeAxisProps) {
  const axisRef = React.useRef<HTMLDivElement>(null);
  // 时间粒度状态（默认1分钟）
  const [granularity, setGranularity] = React.useState(0);
  const { times } = props;

  const { getPrefixCls } = React.useContext(ConfigContext);
  const prefixCls = getPrefixCls('timeline-axis');

  const generateTicks = React.useCallback(
    () => {
      const ticks: Tick[] = [];

      if (!times) {
        return ticks;
      }

      const { step, unit } = GRANULARITIES[granularity]

      for (let time = times[0]; time.isBefore(times[1]); time = time.add(step, unit)) {
        ticks.push({
          time,
        });
      }

      return ticks;
    },
    [times]
  )

  const ticks = generateTicks();

  if (ticks.length === 0) return null;

  return (
    <div className={prefixCls} ref={axisRef}>
      <div className={`${prefixCls}-ticks`}>
        {ticks.map((item, index) => {
          const { time } = item;
          const { labelStep, majorLabelFormat, minorLabelFormat } = GRANULARITIES[granularity]

          const majorLabel = dayjs(time).format(majorLabelFormat);
          const minorLabel = dayjs(time).format(minorLabelFormat);
          const showLabel = index % labelStep === 0;

          return (
            <div
              className={clsx(`${prefixCls}-tick`, {
                [`${prefixCls}-tick-major`]: showLabel,
                [`${prefixCls}-tick-big-major`]: index === 0,
              })}
              key={index}
            >
              {showLabel && (
                <div className={`${prefixCls}-tick-lable`}>
                  {index === 0 ? majorLabel : minorLabel}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

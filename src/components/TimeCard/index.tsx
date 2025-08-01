import type { TimeCardProps, Time } from '../../types';
import { clsx } from 'clsx';
import dayjs from 'dayjs';
import { TimeLineContext } from '../context';
import { DEFAULT_FORMAT } from '../../config';
import React from 'react';
import './style/index.less';

export const TimeCard = React.forwardRef<HTMLDivElement, TimeCardProps & React.ComponentProps<'div'>>(
  (props, ref) => {
  const { className, style, hover, data, checked, position= 24, ...rest } = props;

  const { getPrefixCls, defaultColor } = React.useContext(TimeLineContext);
  const prefixCls = getPrefixCls('timeline-card');

  const { color = defaultColor, time } = data;

  function getTimes(data: TimeCardProps['data']['time']) {
    if (!data) {
      return [];
    }

    return Array.isArray(data) ? data : [data];
  }

  const timeStr = getTimes(time)
    .reduce<string>((prev, cur) => {
      const timeStr = dayjs(cur).format(DEFAULT_FORMAT);
      return prev ? prev + ' ~ ' + timeStr : prev + timeStr;
    }, '');

    return (
      <div
        className={clsx(prefixCls, className)}
        style={{
          ...style,
          top: position,
        }}
        ref={ref}
        {...rest}
      >
        <div
          className={`${prefixCls}-line`}
          style={{
            backgroundColor: (hover || checked) ? color : undefined,
            top: -position,
            height: position,
          }}
        />

        <div
          className={`${prefixCls}-cntent`}
          style={{
            borderColor: color,
          }}
        >
          <div className={`${prefixCls}-title`}>
            {data?.title}
          </div>
          <div className={`${prefixCls}-time`}>
            {timeStr}
          </div>
        </div>
      </div>
    )
  }
);

TimeCard.displayName = 'TimeCard';

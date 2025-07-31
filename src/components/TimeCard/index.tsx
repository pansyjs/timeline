import type { TimeCardProps, Time } from '../../types';
import { clsx } from 'clsx';
import dayjs from 'dayjs';
import { TimeLineContext } from '../context';
import { DEFAULT_FORMAT } from '../../config';
import React from 'react';
import './style/index.less';

export function TimeCard(props: TimeCardProps) {
  const { className, style, data } = props;

  const { getPrefixCls } = React.useContext(TimeLineContext);
  const prefixCls = getPrefixCls('timeline-card');

  function getTimes(data: TimeCardProps['data']['time']) {
    if (!data) {
      return [];
    }

    return Array.isArray(data) ? data : [data];
  }

  const timeStr = getTimes(data?.time)
    .reduce<string>((prev, cur) => {
      const timeStr = dayjs(cur).format(DEFAULT_FORMAT);
      return prev ? prev + ' ~ ' + timeStr : prev + timeStr;
    }, '');

  return (
    <div className={clsx(prefixCls, className)} style={style}>
      <div className={`${prefixCls}-title`}>
        {data?.title}
      </div>
      {data.time && (
        <div className={`${prefixCls}-time`}>
          {timeStr}
        </div>
      )}
    </div>
  )
}

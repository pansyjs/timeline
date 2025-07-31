import React from 'react';
import type { TimePointProps, Time } from '../../types';
import { clsx } from 'clsx';
import dayjs from 'dayjs';
import { TimeLineContext } from '../context';
import { DEFAULT_FORMAT } from '../../config';
import './styles/index.less';

export function TimePoint(props: TimePointProps) {
  const { className, style, time } = props;
  const { getPrefixCls } = React.useContext(TimeLineContext);
  const prefixCls = getPrefixCls('timeline-point');

  const isRange = Array.isArray(time) && time.length === 2;

  if (isRange) {
    return (
      <div
        className={clsx(prefixCls, `${prefixCls}-range`, className)}
        style={style}
      >
        <div className={`${prefixCls}-dot`} title={dayjs(time[0]).format(DEFAULT_FORMAT)} />
        <div className={`${prefixCls}-dot`} title={dayjs(time[1]).format(DEFAULT_FORMAT)} />
      </div>
    )
  }

  return (
    <div className={clsx(prefixCls, `${prefixCls}-dot`, className)} style={style} title={dayjs(time as Time).format(DEFAULT_FORMAT)} />
  )
}

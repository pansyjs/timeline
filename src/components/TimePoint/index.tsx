import React from 'react';
import type { TimePointProps } from '../../types';
import { clsx } from 'clsx';
import { TimeLineContext } from '../context';
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
        <div className={`${prefixCls}-dot`} />
        <div className={`${prefixCls}-dot`} />
      </div>
    )
  }

  return (
    <div className={clsx(prefixCls, `${prefixCls}-dot`, className)} style={style} />
  )
}

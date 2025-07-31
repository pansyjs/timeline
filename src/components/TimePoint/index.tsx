import React from 'react';
import type { TimePointProps } from '../../types';
import { TimeLineContext } from '../context';
import './styles/index.less';

export function TimePoint(props: TimePointProps) {
  const { time } = props;
  const { getPrefixCls } = React.useContext(TimeLineContext);
  const prefixCls = getPrefixCls('timeline-point');

  const isRange = Array.isArray(time) && time.length === 2;

  if (isRange) {
    return (
      <div className={`${prefixCls}-range`}>
        <div className={`${prefixCls}-dot`} />
        <div className={`${prefixCls}-dot`} />
      </div>
    )
  }

  return (
    <div className={`${prefixCls}-dot`} />
  )
}

import React from 'react';
import type { TimePointProps, Time } from '../../types';
import { clsx } from 'clsx';
import dayjs from 'dayjs';
import { TimeLineContext } from '../context';
import { DEFAULT_FORMAT } from '../../config';
import { adjustColorOpacity } from '../../utils';
import './styles/index.less';

export function TimePoint(props: TimePointProps & React.ComponentProps<'div'>) {
  const { className, style, data, hover, ...rest } = props;
  const { getPrefixCls, defaultColor } = React.useContext(TimeLineContext);
  const prefixCls = getPrefixCls('timeline-point');

  const { time, color = defaultColor } = data;
  const isRange = Array.isArray(time) && time.length === 2;

  if (isRange) {
    return (
      <div
        className={clsx({
          [prefixCls]: true,
          [`${prefixCls}-range`]: true,
          [`${prefixCls}-hover`]: hover,
        }, className)}
        style={{
          ...style,
          backgroundColor: color && hover ? adjustColorOpacity(color) : undefined
        }}
        {...rest}
      >
        <div
          className={`${prefixCls}-dot`}
          title={dayjs(time[0]).format(DEFAULT_FORMAT)}
          style={{
            backgroundColor: hover ? color : undefined,
          }}
        />
        <div
          className={`${prefixCls}-dot`}
          title={dayjs(time[1]).format(DEFAULT_FORMAT)}
          style={{
            backgroundColor: hover ? color : undefined,
          }}
        />
      </div>
    )
  }

  return (
    <div
      className={clsx({
        [prefixCls]: true,
        [`${prefixCls}-dot`]: true,
        [`${prefixCls}-hover`]: hover,
      }, className)}
      style={{
        ...style,
        backgroundColor: hover ? color : undefined,
      }}
      title={dayjs(time as Time).format(DEFAULT_FORMAT)}
    />
  )
}

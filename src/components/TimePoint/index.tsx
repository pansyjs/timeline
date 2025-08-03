import type { Time, TimePointProps } from '@/types';
import { clsx } from 'clsx';
import dayjs from 'dayjs';
import React from 'react';
import { DEFAULT_FORMAT } from '@/config';
import { adjustColorOpacityMemoize } from '@/utils';
import { TimeLineContext } from '../context';
import './styles/index.less';

export function TimePoint(props: TimePointProps & React.ComponentProps<'div'>) {
  const { className, style, data, checked, hover, ...rest } = props;
  const { getPrefixCls, defaultColor } = React.useContext(TimeLineContext);
  const prefixCls = getPrefixCls('timeline-point');

  const { time, color = defaultColor } = data;
  const isRange = Array.isArray(time) && time.length === 2;

  if (isRange) {
    return (
      <div
        className={clsx(prefixCls, `${prefixCls}-range`, className)}
        style={{
          ...style,
          backgroundColor: (hover || checked) ? adjustColorOpacityMemoize({ color }) : undefined,
        }}
        {...rest}
      >
        <div
          className={`${prefixCls}-dot`}
          title={dayjs(time[0]).format(DEFAULT_FORMAT)}
          style={{
            backgroundColor: (hover || checked) ? color : undefined,
          }}
        />
        <div
          className={`${prefixCls}-dot`}
          title={dayjs(time[1]).format(DEFAULT_FORMAT)}
          style={{
            backgroundColor: (hover || checked) ? color : undefined,
          }}
        />
      </div>
    );
  }

  return (
    <div
      className={clsx(prefixCls, `${prefixCls}-dot`, className)}
      style={{
        ...style,
        backgroundColor: (hover || checked) ? color : undefined,
      }}
      title={dayjs(time as Time).format(DEFAULT_FORMAT)}
    />
  );
}

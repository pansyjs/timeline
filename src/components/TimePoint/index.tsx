import type { Time, TimePointProps } from '@/types';
import { clsx } from 'clsx';
import dayjs from 'dayjs';
import React from 'react';
import { DEFAULT_COLOR, DEFAULT_FORMAT } from '@/config';
import { adjustColorOpacityMemoize } from '@/utils';
import { TimeLineContext } from '../context';
import './styles/index.less';

export function TimePoint(props: TimePointProps & React.ComponentProps<'div'>) {
  const {
    className,
    style,
    data,
    checked,
    defaultColor = DEFAULT_COLOR,
    hover,
    ...rest
  } = props;
  const { getPrefixCls } = React.useContext(TimeLineContext);
  const prefixCls = getPrefixCls('timeline-point');

  const { time, color = defaultColor } = data;
  const isRange = Array.isArray(time) && time.length === 2;

  if (isRange) {
    return (
      <div
        className={clsx(prefixCls, `${prefixCls}-range`, className)}
        style={{
          ...style,
          zIndex: checked ? 50 : 10,
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
        zIndex: checked ? 50 : 10,
        backgroundColor: (hover || checked) ? color : undefined,
      }}
      title={dayjs(time as Time).format(DEFAULT_FORMAT)}
    />
  );
}

import type { TimeCardProps, Time } from '../../types';
import { clsx } from 'clsx';
import dayjs from 'dayjs';
import { TimeLineContext } from '../context';
import { DEFAULT_FORMAT } from '../../config';
import React from 'react';
import './style/index.less';

export function TimeCard(props: TimeCardProps & React.ComponentProps<'div'>) {
  const { className, style, hover, data, ...rest } = props;

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
      className={
        clsx({
          [`${prefixCls}`]: true,
          [`${prefixCls}-hover`]: hover
        }, className)
      }
      style={style}
      {...rest}
    >
      <div
        className={`${prefixCls}-line`}
        style={hover ? { backgroundColor: color } : {}}
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

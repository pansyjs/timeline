import type { TimeCardProps, DataItem } from '../../types';
import { clsx } from 'clsx';
import dayjs from 'dayjs';
import { TimeLineContext } from '../context';
import { DEFAULT_FORMAT } from '../../config';
import React from 'react';
import './style/index.less';

function TimeCardInternal<D extends DataItem = DataItem>(
  props: TimeCardProps<D> & React.ComponentProps<'div'>,
  ref: React.ForwardedRef<HTMLDivElement>
) {
    const {
      className,
      style,
      hover,
      data,
      checked,
      position= 24,
      render,
      ...rest
    } = props;

    const { getPrefixCls, defaultColor } = React.useContext(TimeLineContext);
    const prefixCls = getPrefixCls('timeline-card');

    const { color = defaultColor, customRender = true, time } = data;

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

    const cardMemo = React.useMemo(
      () => {
        if (customRender && render) {
          return render({ ...data, color });
        }

        return (
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
        )
      },
      [data, color, customRender, render]
    )

    return (
      <div
        className={clsx(prefixCls, className)}
        style={{
          ...style,
          top: position,
          zIndex: checked ? 50 : undefined
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

        {cardMemo}
      </div>
    )
  }

const TimeCard = React.forwardRef(TimeCardInternal);

TimeCard.displayName = 'TimeCard';

export {
  TimeCard,
}

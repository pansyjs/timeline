import React from 'react';
import type { TimePointProps } from '../../types';
import { getPrefixCls } from '../../utils';

export function TimePoint(props: TimePointProps) {
  const { prefixCls } = props;
  const prefixClsVal = getPrefixCls('timeline-point', prefixCls);

  return (
    <>
      <div className={prefixClsVal}>
        123
      </div>
    </>
  )
}

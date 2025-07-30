import React from 'react';
import type { TimeAxisProps } from '../../types';
import { ConfigContext } from '../../context';
import './style/index.less';

export function TimeAxis(props: TimeAxisProps) {
  const { times } = props;

  const { getPrefixCls } = React.useContext(ConfigContext);
  const prefixCls = getPrefixCls('timeline-axis');

  if (!times) return null;

  return (
    <div className={prefixCls}>
      Hello World 123
    </div>
  )
}

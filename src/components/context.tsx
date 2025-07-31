import React from 'react';
import { defaultPrefixCls, DEFAULT_COLOR } from '../config';
import { getPrefixCls } from '../utils';

interface ConfigConsumerProps {
  prefixCls: string;
  rootElement: HTMLDivElement;
  defaultColor: string;
  getPrefixCls: (suffixCls?: string) => string;
}

const TimeLineContext = React.createContext<ConfigConsumerProps>({
  prefixCls: defaultPrefixCls,
  defaultColor: DEFAULT_COLOR,
  getPrefixCls,
} as ConfigConsumerProps);

export { TimeLineContext }

import React from 'react';
import { DEFAULT_COLOR, defaultPrefixCls } from '../config';
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

export { TimeLineContext };

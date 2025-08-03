import React from 'react';
import { defaultPrefixCls } from '@/config';
import { getPrefixCls } from '@/utils';

interface ConfigConsumerProps {
  prefixCls: string;
  getPrefixCls: (suffixCls?: string) => string;
}

const TimeLineContext = React.createContext<ConfigConsumerProps>({
  prefixCls: defaultPrefixCls,
  getPrefixCls,
} as ConfigConsumerProps);

export { TimeLineContext };

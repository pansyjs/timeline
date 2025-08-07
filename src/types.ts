import type React from 'react';
import type { DataItem, DataItemCollectionType, TimelineOptions } from './core/types';

interface TimeLineCoreOptions extends Partial<TimelineOptions> {
  getElement?: () => HTMLDivElement | null;
  data?: DataItemCollectionType;
}

interface TimeLineProps extends Omit<TimeLineCoreOptions, 'getElement' | 'items'> {
  className?: string;
  style?: React.CSSProperties;
  data?: DataItem[];
}

export type {
  DataItemCollectionType,
  TimeLineCoreOptions,
  TimelineOptions,
  TimeLineProps,
};

import type { DataItemCollectionType, TimeLineCoreOptions, TimelineOptions } from './types';
import { isEqual } from 'es-toolkit';
import { extend } from 'vis-util/esnext';
import { Timeline } from './core';

export class TimeLineCore {
  private timeline!: Timeline;
  private options!: TimeLineCoreOptions;
  private items: DataItemCollectionType;

  constructor(options: TimeLineCoreOptions) {
    this.items = options.data || [];
    this.setOptions(options);
  }

  setOptions(options: TimeLineCoreOptions) {
    this.options = extend({}, this.options, options);
  }

  _didMount = () => {
    const { getElement } = this.options;
    const element = getElement?.();

    if (element) {
      this.timeline = new Timeline(element, this.items, this.options as TimelineOptions);
    }

    return () => {
      this.timeline && this.timeline.destroy();
    };
  };

  _willUpdate = () => {
    if (!this.timeline)
      return;

    if (!isEqual(this.items, this.options.data)) {
      this.items = this.options.data!;
      this.timeline.setItems(this.options.data || []);
    }
  };
}

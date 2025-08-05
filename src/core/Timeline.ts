import type { Body, TimelineOptions } from './types';
import { merge } from 'es-toolkit';
import mitt from 'mitt';
import { Core } from './Core';

export class Timeline extends Core {
  private defaultOptions: TimelineOptions;
  private emitter: Body['emitter'];

  constructor(container: HTMLElement, options: TimelineOptions) {
    super();

    this.emitter = mitt();
    this.defaultOptions = {
      prefixCls: 'pansy-timeline',
    };
    this.options = merge({}, this.defaultOptions) as Required<TimelineOptions>;

    this._create(container);

    this.body = {
      dom: this.dom!,
      emitter: this.emitter,
    };

    // apply options
    if (options) {
      this.setOptions(options);
    }
  }

  setOptions(options: TimelineOptions) {
    Core.prototype.setOptions.call(this, options);
  }
}

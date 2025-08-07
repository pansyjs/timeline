import type { Body, DataInterfaceDataItem, DataItemCollectionType, TimelineOptions } from './types';
import { merge } from 'es-toolkit';
import mitt from 'mitt';
import { DataSet } from 'vis-data/esnext';
import { TimeAxis } from './components/TimeAxis';
import { Core } from './Core';
import { Range } from './Range';
import { isDataViewLike, typeCoerceDataSet } from './utils/util';

export class Timeline extends Core {
  private defaultOptions: TimelineOptions;
  private itemsDone: boolean;
  private initialFitDone: boolean;
  itemsData!: ReturnType<typeof typeCoerceDataSet>;

  constructor(container: HTMLElement, items: DataItemCollectionType, options?: TimelineOptions) {
    super();
    this.itemsDone = false;

    this.emitter = mitt();

    // eslint-disable-next-line ts/no-this-alias
    const me = this;
    this.defaultOptions = {
      prefixCls: 'pansy-timeline',
      minHeight: 500,
      hiddenDates: [],
    } as unknown as Required<TimelineOptions>;
    this.options = merge({}, this.defaultOptions) as Required<TimelineOptions>;

    this._create(container);

    // 这里列出的所有组件都将自动重新绘制
    this.components = [];

    this.body = {
      prefixCls: this.options.prefixCls,
      dom: this.dom!,
      domProps: this.props,
      emitter: this.emitter,
      hiddenDates: [],
      util: {
        toTime: me._toTime.bind(me),
        toScreen: me._toScreen.bind(me),
      },
    } as unknown as Body;

    // range
    this.range = new Range(this.body, this.options);
    this.components.push(this.range);
    this.body.range = this.range;

    // time axis
    this.timeAxis = new TimeAxis(this.body);
    this.components.push(this.timeAxis);

    this.initialFitDone = false;
    this.emitter.on('changed', () => {
      if (me.itemsData === null)
        return;

      if (!me.initialFitDone) {
        me.initialFitDone = true;
      }

      if (!me.initialDrawDone && (me.initialRangeChangeDone || (!me.options.start && !me.options.end))) {
        me.initialDrawDone = true;

        me.dom.root.style.visibility = 'visible';
        if (me.options.onInitialDrawComplete) {
          setTimeout(() => {
            return me.options.onInitialDrawComplete();
          }, 0);
        }
      }
    });

    // apply options
    if (options) {
      this.setOptions(options);
    }

    // create itemset
    if (items) {
      this.setItems(items);
    }

    // draw for the first time
    this._redraw();
  }

  setOptions(options: TimelineOptions) {
    Core.prototype.setOptions.call(this, options);
  }

  setItems(items: DataItemCollectionType) {
    this.itemsDone = false;

    let newDataSet;
    if (!items) {
      newDataSet = null;
    }
    else if (isDataViewLike(items)) {
      newDataSet = typeCoerceDataSet(items as DataInterfaceDataItem);
    }
    else {
      newDataSet = typeCoerceDataSet(new DataSet(items as any));
    }

    // set items
    if (this.itemsData) {
      // stop maintaining a coerced version of the old data set
      this.itemsData.dispose();
    }
    this.itemsData = newDataSet as ReturnType<typeof typeCoerceDataSet>;
  }

  _redraw() {
    Core.prototype._redraw.call(this);
  }
}

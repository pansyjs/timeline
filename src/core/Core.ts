import type { TimeAxis } from './components/TimeAxis';
import type { HammerInput, HammerManager } from './module/hammer';
import type { Range } from './Range';
import type { Body, Dom, EventKeys, Props, TimelineOptions } from './types';
import { option } from 'vis-util/esnext';
import Hammer from './module/hammer';
import * as DateUtil from './utils/date';
import * as hammerUtil from './utils/hammer';

export class Core {
  private redrawCount: number = 0;
  dom!: Dom;
  body!: Body;
  hammer!: HammerManager;
  options: Required<TimelineOptions> = {} as Required<TimelineOptions>;
  timeAxis!: TimeAxis;
  emitter!: Body['emitter'];
  range!: Range;
  props!: Props;
  components!: any[];
  initialDrawDone!: boolean;

  _create(container: HTMLElement) {
    const { prefixCls } = this.options;

    this.dom = {} as Dom;

    this.dom.container = container;
    this.dom.container.style.position = 'relative';

    this.dom.root = document.createElement('div');
    this.dom.top = document.createElement('div');
    this.dom.background = document.createElement('div');
    this.dom.centerContainer = document.createElement('div');
    this.dom.center = document.createElement('div');

    this.dom.root.className = `${prefixCls}`;
    this.dom.background.className = `${prefixCls}-panel ${prefixCls}-background`;
    this.dom.top.className = `${prefixCls}-panel ${prefixCls}-top`;
    this.dom.centerContainer.className = `${prefixCls}-panel ${prefixCls}-center`;
    this.dom.center.className = `${prefixCls}-content`;

    this.dom.root.appendChild(this.dom.background);
    this.dom.root.appendChild(this.dom.centerContainer);
    this.dom.root.appendChild(this.dom.top);

    this.dom.centerContainer.appendChild(this.dom.center);

    this.props = {
      root: {},
      background: {},
      centerContainer: {},
      center: {},
      top: {},
    } as Props;

    // eslint-disable-next-line ts/no-this-alias
    const me = this;

    this.hammer = new Hammer(this.dom.root);
    const pinchRecognizer = this.hammer.get('pinch').set({ enable: true });
    pinchRecognizer && hammerUtil.disablePreventDefaultVertically(pinchRecognizer);
    this.hammer.get('pan').set({
      threshold: 5,
      direction: Hammer.DIRECTION_ALL,
    });

    const events = [
      // 捏合
      'pinch',
      // 轻触
      'tap',
      // 拖动
      'pan',
      'panstart',
      'panmove',
      'panend',
    ];

    events.forEach((type) => {
      const listener = (event: HammerInput) => {
        if (me.isActive()) {
          me.emitter.emit(type as EventKeys, event);
        }
      };

      me.hammer.on(type, listener);
    });

    this.redrawCount = 0;
    this.initialDrawDone = false;

    if (!container)
      throw new Error('No container provided');
    container.appendChild(this.dom.root);
  }

  setOptions(options: TimelineOptions) {
    // eslint-disable-next-line no-console
    console.log(options);
  }

  /** 获取可见窗口 */
  getWindow() {
    const range = this.range.getRange();

    return {
      start: new Date(range.start),
      end: new Date(range.end),
    };
  }

  isActive() {
    return true;
  }

  destroy() {
    if (this.dom) {
      if (this.dom.root.parentNode) {
        this.dom.root.parentNode.removeChild(this.dom.root);
      }

      // @ts-expect-error 忽略报错
      this.dom = null;
    }
  }

  /** 重新绘制 */
  redraw() {
    this._redraw();
  }

  _toScreen(time: number) {
    return DateUtil.toScreen(this, time, this.props.center.width);
  }

  _redraw() {
    this.redrawCount++;
    const dom = this.dom;

    if (!dom || !dom.container || dom.root.offsetWidth === 0)
      return;

    let resized = false;
    const options = this.options;
    const props = this.props;

    // 更新根元素宽度和高度选项
    dom.root.style.maxHeight = option.asSize(options.maxHeight, '')!;
    dom.root.style.minHeight = option.asSize(options.minHeight, '')!;
    dom.root.style.width = option.asSize(options.width, '')!;
    const rootOffsetWidth = dom.root.offsetWidth;

    // 面板宽度
    props.root.width = rootOffsetWidth;

    this._setDOM();

    // redraw all components
    this.components.forEach((component) => {
      resized = component.redraw() || resized;
    });

    const MAX_REDRAW = 5;
    if (resized) {
      if (this.redrawCount < MAX_REDRAW) {
        this.body!.emitter.emit('_change');
      }
      else {
        // eslint-disable-next-line no-console
        console.log('WARNING: infinite loop in redraw?');
      }
    }
    else {
      this.body.emitter.emit('changed');
    }
  }

  _setDOM() {
    const props = this.props;
    const dom = this.dom;

    const centerWidth = props.root.width;
    props.top.width = centerWidth;

    // 调整面板大小
    dom.top.style.width = `${props.top.width}px`;

    // 重新定位面板
    dom.background.style.left = '0';
    dom.background.style.top = '0';
    dom.top.style.top = '0';
  }

  _toTime(x: number) {
    return DateUtil.toTime(this, x, this.props.center.width);
  }

  _initAutoResize() {

  }
}

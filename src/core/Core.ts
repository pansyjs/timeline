import type { TimeAxis } from './components/TimeAxis';
import type { Range } from './Range';
import type {
  Body,
  Dom,
  EventKeys,
  HammerInput,
  HammerManager,
  Props,
  TimelineOptions,
  Touch,
} from './types';
import { option } from 'vis-util/esnext';
import Hammer from './module/hammer';
import * as DateUtil from './utils/date';
import * as hammerUtil from './utils/hammer';

export class Core {
  private redrawCount: number = 0;
  private touch!: Touch;
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
  initialRangeChangeDone!: boolean;

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
      scrollTop: 0,
      scrollTopMin: 0,
    } as Props;

    this.emitter.on('touch', this._onTouch.bind(this));
    this.emitter.on('panmove', this._onDrag.bind(this));

    // eslint-disable-next-line ts/no-this-alias
    const me = this;

    this.emitter.on('rangechange', () => {
      if (this.initialDrawDone === true) {
        this._redraw();
      }
    });
    this.emitter.on('rangechanged', () => {
      if (!this.initialRangeChangeDone) {
        this.initialRangeChangeDone = true;
      }
    });

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

    hammerUtil.onTouch(this.hammer, (event) => {
      me.emitter.emit('touch', event);
    });
    hammerUtil.onRelease(this.hammer, (event) => {
      me.emitter.emit('release', event);
    });

    this.touch = {} as Touch;

    this.redrawCount = 0;
    this.initialDrawDone = false;
    this.initialRangeChangeDone = false;

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

    props.center.height = dom.center.offsetHeight;

    // 计算面板的高度
    props.root.height = dom.root.offsetHeight;
    props.centerContainer.height = props.root.height;

    // 计算面板的宽度
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
      this.redrawCount = 0;
    }

    this.body.emitter.emit('changed');
  }

  _onTouch() {
    this.touch.allowDragging = true;
    this.touch.initialScrollTop = this.props.scrollTop;
  }

  _onDrag(event: HammerInput) {
    if (!event)
      return;
    if (!this.touch.allowDragging)
      return;

    const delta = event.deltaY;

    const oldScrollTop = this._getScrollTop();
    const newScrollTop = this._setScrollTop(this.touch.initialScrollTop + delta);

    if (newScrollTop !== oldScrollTop) {
      this.emitter.emit('verticalDrag');
    }
  }

  _getScrollTop() {
    return this.props.scrollTop;
  }

  _setScrollTop(scrollTop: number) {
    this.props.scrollTop = scrollTop;
    this._updateScrollTop();

    return this.props.scrollTop;
  }

  _updateScrollTop() {
    // 重新计算 scrollTopMin
    const scrollTopMin = Math.min(this.props.centerContainer.height - this.props.center.height, 0); // is negative or zero
    if (scrollTopMin !== this.props.scrollTopMin) {
      this.props.scrollTopMin = scrollTopMin;
    }

    if (this.props.scrollTop > 0)
      this.props.scrollTop = 0;
    if (this.props.scrollTop < scrollTopMin)
      this.props.scrollTop = scrollTopMin;

    return this.props.scrollTop;
  }

  _setDOM() {
    const props = this.props;
    const dom = this.dom;

    const centerWidth = props.root.width;
    props.top.width = centerWidth;
    props.center.width = centerWidth;

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

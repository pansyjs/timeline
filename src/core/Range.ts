/* eslint-disable react/no-unused-class-component-members */
import type {
  Body,
  DateType,
  HammerInput,
  RangeProps,
  TimelineOptions,
} from './types';
import dayjs from 'dayjs';
import { preventDefault } from 'vis-util/esnext';
import { Component } from './components/Component';
import * as DateUtil from './utils/date';

interface SetRangeOptions {
  /** 是否开启动画 */
  animation?: boolean | {
    /**
     * 动画持续时间
     * @default 500ms
     */
    duration?: number;
    /**
     * 缓动函数
     * @default easeInOutQuad
     */
    easingFunction?: string;
  };
  byUser?: boolean;
  event?: HammerInput;
}

export class Range extends Component {
  body: Body;
  millisecondsPerPixelCache?: number;
  /** 开始时间 */
  start: number;
  /** 结束时间 */
  end: number;
  defaultOptions: Required<TimelineOptions>;
  options: Required<TimelineOptions>;
  props: RangeProps;
  timeoutId!: NodeJS.Timeout;
  startToFront: boolean;
  endToFront: boolean;
  deltaDifference: number;
  previousDelta!: number;
  scaleOffset: number;

  constructor(body: Body, options: TimelineOptions) {
    super();

    const now = dayjs().startOf('day');
    const start = now.clone().add(-3, 'days').valueOf();
    const end = now.clone().add(3, 'days').valueOf();
    this.millisecondsPerPixelCache = undefined;

    if (options === undefined) {
      this.start = start;
      this.end = end;
    }
    else {
      this.start = options.start || start;
      this.end = options.end || end;
    }

    this.body = body;
    this.deltaDifference = 0;
    this.scaleOffset = 0;
    this.startToFront = false;
    this.endToFront = true;

    this.defaultOptions = {
      start: null,
      end: null,
      min: null,
      max: null,
      moveable: true,
      zoomable: true,
      zoomMin: 10,
      zoomMax: 1000 * 60 * 60 * 24 * 365 * 10000,
    } as unknown as Required<TimelineOptions>;
    this.props = {
      touch: {},
    } as RangeProps;
    this.options = Object.assign({}, this.defaultOptions);

    // 监听拖动事件
    this.body.emitter.on('panstart', this._onDragStart.bind(this));
    this.body.emitter.on('panmove', this._onDrag.bind(this));

    this.body.emitter.on('touch', this._onTouch.bind(this));
  }

  setOptions(options: TimelineOptions) {
    if (options) {
      if ('start' in options || 'end' in options) {
        // apply a new range. both start and end are optional
        this.setRange(options.start, options.end);
      }
    }
  }

  setRange(
    start?: DateType,
    end?: DateType,
    options?: SetRangeOptions,
    callback?: () => void,
  ) {
    if (!options) {
      options = {};
    }

    if (options.byUser !== true) {
      options.byUser = false;
    }

    // eslint-disable-next-line ts/no-this-alias
    const me = this;
    const finalStart = start !== undefined ? dayjs(start).valueOf() : null;
    const finalEnd = end !== undefined ? dayjs(end).valueOf() : null;
    this.millisecondsPerPixelCache = undefined;

    const changed = this._applyRange(finalStart, finalEnd);

    if (changed) {
      const params = {
        start: new Date(this.start),
        end: new Date(this.end),
        byUser: options.byUser,
        event: options.event!,
      };

      me.body.emitter.emit('rangechange', params);
      me.timeoutId && clearTimeout(me.timeoutId);
      me.timeoutId = setTimeout(
        () => {
          me.body.emitter.emit('rangechanged', params);
        },
        200,
      );
      if (callback) {
        return callback();
      }
    }
  }

  /** 获取范围 */
  getRange() {
    return {
      start: this.start,
      end: this.end,
    };
  }

  /**
   * 根据提供的宽度，计算当前范围的转换偏移量和比例
   * @param {number} width
   * @param {number} [totalHidden]
   * @returns {{offset: number, scale: number}} conversion
   */
  conversion(width: number, totalHidden = 0) {
    return Range.conversion(this.start, this.end, width, totalHidden);
  }

  _onTouch(event: HammerInput) {
    this.props.touch.start = this.start;
    this.props.touch.end = this.end;
    this.props.touch.allowDragging = true;
    this.props.touch.center = null;
    this.props.touch.centerDate = null;
    this.scaleOffset = 0;
    this.deltaDifference = 0;

    preventDefault(event as unknown as Event);
  }

  _onDragStart(event: HammerInput) {
    this.deltaDifference = 0;
    this.previousDelta = 0;

    if (!this.options.moveable)
      return;

    if (!this._isInsideRange(event))
      return;

    if (!this.props.touch.allowDragging)
      return;

    this.props.touch.start = this.start;
    this.props.touch.end = this.end;
    this.props.touch.dragging = true;

    if (this.body.dom.root) {
      this.body.dom.root.style.cursor = 'move';
    }
  }

  _onDrag(event: HammerInput) {
    if (!event)
      return;

    if (!this.props.touch.dragging)
      return;

    if (!this.options.moveable)
      return;

    if (!this.props.touch.allowDragging)
      return;

    let delta = event.deltaX;
    delta -= this.deltaDifference;
    let interval = (this.props.touch.end - this.props.touch.start);

    const duration = DateUtil.getHiddenDurationBetween(this.body.hiddenDates, this.start, this.end);
    interval -= duration;

    const width = this.body.domProps.center.width;
    const diffRange = delta / width * interval;

    const newStart = this.props.touch.start + diffRange;
    const newEnd = this.props.touch.end + diffRange;

    const safeStart = DateUtil.snapAwayFromHidden(this.body.hiddenDates, newStart, this.previousDelta - delta, true);
    const safeEnd = DateUtil.snapAwayFromHidden(this.body.hiddenDates, newEnd, this.previousDelta - delta, true);

    if (safeStart !== newStart || safeEnd !== newEnd) {
      this.deltaDifference += delta;
      this.props.touch.start = safeStart;
      this.props.touch.end = safeEnd;
      this._onDrag(event);
      return;
    }

    this.previousDelta = delta;
    this._applyRange(newStart, newEnd);

    const startDate = new Date(this.start);
    const endDate = new Date(this.end);

    this.body.emitter.emit('rangechange', {
      start: startDate,
      end: endDate,
      byUser: true,
      event,
    });
  }

  _onDragEnd(event: HammerInput) {
    if (!this.props.touch.dragging)
      return;

    if (!this.options.moveable)
      return;

    if (!this.props.touch.allowDragging)
      return;

    this.props.touch.dragging = false;

    if (this.body.dom.root) {
      this.body.dom.root.style.cursor = 'auto';
    }

    this.body.emitter.emit('rangechanged', {
      start: new Date(this.start),
      end: new Date(this.end),
      byUser: true,
      event,
    });
  }

  /**
   * 测试鼠标事件中的鼠标是否位于可见窗口内，
   * 当前开始日期和结束日期之间
   * @param event 当位于可见窗口内时返回 true
   * @return {boolean}
   */
  _isInsideRange(event: HammerInput) {
    // @ts-expect-error 兼容代码
    const clientX = event.center ? event.center.x : event.clientX;
    const centerContainerRect = this.body.dom.centerContainer.getBoundingClientRect();

    const x = clientX - centerContainerRect.left;

    const time = this.body.util.toTime(x).valueOf();

    return time >= this.start && time <= this.end;
  }

  /**
   * 设置新的起始和结束范围
   * @param {number} [start]
   * @param {number} [end]
   * @returns {boolean} changed
   */
  _applyRange(start: number | null, end: number | null) {
    let newStart = (start !== null) ? dayjs(start).valueOf() : this.start;
    let newEnd = (end !== null) ? dayjs(end).valueOf() : this.end;
    const max = (this.options.max != null) ? dayjs(this.options.max).valueOf() : null;
    const min = (this.options.min != null) ? dayjs(this.options.min).valueOf() : null;
    let diff;

    // check for valid number
    if (Number.isNaN(newStart) || newStart === null) {
      throw new Error(`Invalid start '${start}'`);
    }
    if (Number.isNaN(newEnd) || newEnd === null) {
      throw new Error(`Invalid end '${end}'`);
    }

    // prevent end < start
    if (newEnd < newStart) {
      newEnd = newStart;
    }

    // prevent start < min
    if (min !== null) {
      if (newStart < min) {
        diff = (min - newStart);
        newStart += diff;
        newEnd += diff;

        // prevent end > max
        if (max != null) {
          if (newEnd > max) {
            newEnd = max;
          }
        }
      }
    }

    // prevent end > max
    if (max !== null) {
      if (newEnd > max) {
        diff = (newEnd - max);
        newStart -= diff;
        newEnd -= diff;

        // prevent start < min
        if (min != null) {
          if (newStart < min) {
            newStart = min;
          }
        }
      }
    }

    // prevent (end-start) < zoomMin
    if (this.options.zoomMin !== null) {
      let zoomMin = this.options.zoomMin;
      if (zoomMin < 0) {
        zoomMin = 0;
      }

      if ((newEnd - newStart) < zoomMin) {
        // compensate for a scale of 0.5 ms
        const compensation = 0.5;
        if ((this.end - this.start) === zoomMin && newStart >= this.start - compensation && newEnd <= this.end) {
          // ignore this action, we are already zoomed to the minimum
          newStart = this.start;
          newEnd = this.end;
        }
        else {
          // zoom to the minimum
          diff = (zoomMin - (newEnd - newStart));
          newStart -= diff / 2;
          newEnd += diff / 2;
        }
      }
    }

    // prevent (end-start) > zoomMax
    if (this.options.zoomMax !== null) {
      let zoomMax = this.options.zoomMax;
      if (zoomMax < 0) {
        zoomMax = 0;
      }

      if ((newEnd - newStart) > zoomMax) {
        if ((this.end - this.start) === zoomMax && newStart < this.start && newEnd > this.end) {
          // ignore this action, we are already zoomed to the maximum
          newStart = this.start;
          newEnd = this.end;
        }
        else {
          // zoom to the maximum
          diff = ((newEnd - newStart) - zoomMax);
          newStart += diff / 2;
          newEnd -= diff / 2;
        }
      }
    }

    const changed = (this.start !== newStart || this.end !== newEnd);

    this.start = newStart;
    this.end = newEnd;

    return changed;
  }

  /**
   * 根据提供的开始、结束和宽度，计算范围的转换偏移量和比例的静态方法
   * @param {number} start
   * @param {number} end
   * @param {number} width
   * @param {number} [totalHidden]
   * @returns {{ offset: number, scale: number }} conversion
   */
  static conversion(start: number, end: number, width: number, totalHidden = 0) {
    if (width !== 0 && (end - start !== 0)) {
      return {
        offset: start,
        scale: width / (end - start - totalHidden),
      };
    }
    else {
      return {
        offset: 0,
        scale: 1,
      };
    }
  }
}

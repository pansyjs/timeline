import type { ConfigType } from 'dayjs';
import type { Body, DateType } from './types';
import dayjs from 'dayjs';

interface RangeOptions {
  start?: number | null;
  end?: number | null;
  min?: ConfigType;
  max?: ConfigType;
  // milliseconds
  zoomMin?: number | string;
  // milliseconds
  zoomMax?: number | string;
}

interface SetRangeOptions {
  animation?: boolean;
  duration?: number;
  easingFunction?: string;
  byUser?: boolean;
  event?: Event;
}

export class Range {
  body: Body;
  millisecondsPerPixelCache?: number;
  /** 开始时间 */
  private start: number;
  /** 结束时间 */
  private end: number;
  defaultOptions: RangeOptions;
  options: RangeOptions;

  constructor(body: Body, options: RangeOptions) {
    const now = dayjs().startOf('day');
    const start = now.clone().add(-3, 'days').valueOf();
    const end = now.clone().add(-3, 'days').valueOf();

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

    this.defaultOptions = {
      start: null,
      end: null,
      min: null,
      max: null,
      zoomMin: 10,
      zoomMax: 1000 * 60 * 60 * 24 * 365 * 10000,
    };
    this.options = Object.assign({}, this.defaultOptions);
  }

  setRange(
    start: DateType,
    end: DateType,
    options: boolean | SetRangeOptions,
    callback: () => void,
  ) {
    if (!options) {
      options = {};
    }

    if ((options as SetRangeOptions).byUser !== true) {
      (options as SetRangeOptions).byUser = false;
    }

    const finalStart = start !== undefined ? dayjs(start).valueOf() : null;
    const finalEnd = end !== undefined ? dayjs(end).valueOf() : null;

    const changed = this._applyRange(finalStart, finalEnd);

    if (changed) {
      if (callback) {
        return callback();
      }
    }

    this.millisecondsPerPixelCache = undefined;
  }

  /** 获取范围 */
  getRange() {
    return {
      start: this.start,
      end: this.end,
    };
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
      let zoomMin = Number.parseFloat(this.options.zoomMin as string);
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
      }
      else {
        // zoom to the minimum
        diff = (zoomMin - (newEnd - newStart));
        newStart -= diff / 2;
        newEnd += diff / 2;
      }
    }

    // prevent (end-start) > zoomMax
    if (this.options.zoomMax !== null) {
      let zoomMax = Number.parseFloat(this.options.zoomMax as string);
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
}

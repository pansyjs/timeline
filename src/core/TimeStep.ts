/* eslint-disable style/max-statements-per-line */
import type { Dayjs } from 'dayjs';
import type { Body, Format, TimeAxisScaleType } from './types';
import dayjs from 'dayjs';
import isoweek from 'dayjs/plugin/isoweek';
import weekday from 'dayjs/plugin/weekday';
import * as DateUtil from './utils/date';

dayjs.extend(weekday);
dayjs.extend(isoweek);

interface TimeStepOptions {
  showMajorLabels: boolean;
  showWeekScale: boolean;
}

export class TimeStep {
  private _start: Dayjs;
  private _end: Dayjs;
  current: Dayjs;
  scale: TimeAxisScaleType;
  step: number;
  options: TimeStepOptions;
  autoScale: boolean;
  hiddenDates: Body['hiddenDates'];
  switchedDay: boolean;
  switchedMonth: boolean;
  switchedYear: boolean;
  format: Format;

  constructor(start: Date, end: Date, minimumStep: number, hiddenDates: Body['hiddenDates'], options?: TimeStepOptions) {
    this.options = (options || {}) as TimeStepOptions;

    this.current = dayjs();
    this._start = dayjs();
    this._end = dayjs();

    this.autoScale = true;
    this.scale = 'day';
    this.step = 1;

    this.setRange(start, end, minimumStep);

    this.switchedDay = false;
    this.switchedMonth = false;
    this.switchedYear = false;

    if (Array.isArray(hiddenDates)) {
      this.hiddenDates = hiddenDates;
    }
    else if (hiddenDates !== undefined) {
      this.hiddenDates = [hiddenDates];
    }
    else {
      this.hiddenDates = [];
    }

    this.format = TimeStep.FORMAT;
  }

  setRange(start: Date, end: Date, minimumStep: number) {
    if (!(start instanceof Date) || !(end instanceof Date)) {
      // eslint-disable-next-line no-throw-literal
      throw 'No legal start or end date in method setRange';
    }

    this._start = (start !== undefined) ? dayjs(start.valueOf()) : this._start;
    this._end = (end !== undefined) ? dayjs(end.valueOf()) : this._end;

    if (this.autoScale) {
      this.setMinimumStep(minimumStep);
    }
  }

  /**
   * Set the range iterator to the start date.
   */
  start() {
    this.current = this._start.clone();
    this.roundToMinor();
  }

  getCurrent() {
    return this.current.clone();
  }

  getLabelMinor(date: any) {
    if (date === undefined) {
      date = this.current;
    }
    if (date instanceof Date) {
      date = dayjs(date);
    }

    if (typeof (this.format.minorLabels) === 'function') {
      return this.format.minorLabels(date, this.scale, this.step);
    }

    const format = this.format.minorLabels[this.scale];

    switch (this.scale) {
      case 'week':
        // Don't draw the minor label if this date is the first day of a month AND if it's NOT the start of the week.
        // The 'date' variable may actually be the 'next' step when called from TimeAxis' _repaintLabels.
        if (date.date() === 1 && date.weekday() !== 0) {
          return '';
        }
      // eslint-disable-next-line no-fallthrough
      default:
        return (format && format.length > 0) ? dayjs(date).format(format) : '';
    }
  }

  getLabelMajor(date: any) {
    if (date === undefined) {
      date = this.current;
    }
    if (date instanceof Date) {
      date = dayjs(date);
    }

    if (typeof (this.format.majorLabels) === 'function') {
      return this.format.majorLabels(date, this.scale, this.step);
    }

    const format = this.format.majorLabels[this.scale];
    return (format && format.length > 0) ? dayjs(date).format(format) : '';
  }

  hasNext() {
    return (this.current.valueOf() <= this._end.valueOf());
  }

  next() {
    const prev = this.current.valueOf();

    switch (this.scale) {
      case 'millisecond': this.current = this.current.add(this.step, 'millisecond'); break;
      case 'second': this.current = this.current.add(this.step, 'second'); break;
      case 'minute': this.current = this.current.add(this.step, 'minute'); break;
      case 'hour':
        this.current = this.current.add(this.step, 'hour');

        if (this.current.month() < 6) {
          this.current = this.current.subtract(this.current.hour() % this.step, 'hour');
        }
        else {
          if (this.current.hour() % this.step !== 0) {
            this.current = this.current.add(this.step - this.current.hour() % this.step, 'hour');
          }
        }
        break;
      case 'weekday':
      case 'day': this.current = this.current.add(this.step, 'day'); break;
      case 'week':
        if (this.current.weekday() !== 0) { // we had a month break not correlating with a week's start before
          this.current = this.current.weekday(0).add(this.step, 'week'); // switch back to week cycles
        }
        else if (this.options.showMajorLabels === false) {
          this.current = this.current.add(this.step, 'week'); // the default case
        }
        else { // first day of the week
          const nextWeek = this.current.clone();
          nextWeek.add(1, 'week');
          if (nextWeek.isSame(this.current, 'month')) { // is the first day of the next week in the same month?
            this.current = this.current.add(this.step, 'week'); // the default case
          }
          else { // inject a step at each first day of the month
            this.current = this.current.add(this.step, 'week').date(1);
          }
        }
        break;
      case 'month': this.current = this.current.add(this.step, 'month'); break;
      case 'year': this.current = this.current.add(this.step, 'year'); break;
      default: break;
    }

    if (this.step !== 1) {
      switch (this.scale) {
        case 'millisecond':
          if (this.current.millisecond() > 0 && this.current.millisecond() < this.step)
            this.current = this.current.millisecond(0);
          break;
        case 'second':
          if (this.current.second() > 0 && this.current.second() < this.step)
            this.current = this.current.second(0);
          break;
        case 'minute':
          if (this.current.minute() > 0 && this.current.minute() < this.step)
            this.current = this.current.minute(0);
          break;
        case 'hour':
          if (this.current.hour() > 0 && this.current.hour() < this.step)
            this.current = this.current.hour(0);
          break;
        case 'weekday': // intentional fall through
        case 'day':
          if (this.current.date() < this.step + 1)
            this.current = this.current.date(1);
          break;
        // case 'week':
        //   if(this.current.week() < this.step) this.current = this.current.week(1); // week numbering starts at 1, not 0
        //   break;
        case 'month':
          if (this.current.month() < this.step)
            this.current = this.current.month(0);
          break;
        case 'year': break; // nothing to do for year
        default: break;
      }
    }

    if (this.current.valueOf() === prev) {
      this.current = this._end.clone();
    }

    this.switchedDay = false;
    this.switchedMonth = false;
    this.switchedYear = false;
  }

  isMajor() {
    if (this.switchedYear === true) {
      switch (this.scale) {
        case 'year':
        case 'month':
        case 'week':
        case 'weekday':
        case 'day':
        case 'hour':
        case 'minute':
        case 'second':
        case 'millisecond':
          return true;
        default:
          return false;
      }
    }
    else if (this.switchedMonth === true) {
      switch (this.scale) {
        case 'week':
        case 'weekday':
        case 'day':
        case 'hour':
        case 'minute':
        case 'second':
        case 'millisecond':
          return true;
        default:
          return false;
      }
    }
    else if (this.switchedDay === true) {
      switch (this.scale) {
        case 'millisecond':
        case 'second':
        case 'minute':
        case 'hour':
          return true;
        default:
          return false;
      }
    }

    const date = dayjs(this.current);
    switch (this.scale) {
      case 'millisecond':
        return (date.millisecond() === 0);
      case 'second':
        return (date.second() === 0);
      case 'minute':
        return (date.hour() === 0) && (date.minute() === 0);
      case 'hour':
        return (date.hour() === 0);
      case 'weekday': // intentional fall through
      case 'day':
        return this.options.showWeekScale ? (date.isoWeekday() === 1) : (date.date() === 1);
      case 'week':
        return (date.date() === 1);
      case 'month':
        return (date.month() === 0);
      case 'year':
        return false;
      default:
        return false;
    }
  }

  getClassName() {
    const current = dayjs(this.current);
    const step = this.step;
    const classNames = [];

    function even(value: number) {
      return (value / step % 2 === 0) ? ' vis-even' : ' vis-odd';
    }

    function today(date: Dayjs) {
      if (date.isSame(Date.now(), 'day')) {
        return ' vis-today';
      }
      if (date.isSame(dayjs().add(1, 'day'), 'day')) {
        return ' vis-tomorrow';
      }
      if (date.isSame(dayjs().add(-1, 'day'), 'day')) {
        return ' vis-yesterday';
      }
      return '';
    }

    function currentWeek(date: Dayjs) {
      return date.isSame(Date.now(), 'week') ? ' vis-current-week' : '';
    }

    function currentMonth(date: Dayjs) {
      return date.isSame(Date.now(), 'month') ? ' vis-current-month' : '';
    }

    function currentYear(date: Dayjs) {
      return date.isSame(Date.now(), 'year') ? ' vis-current-year' : '';
    }

    switch (this.scale) {
      case 'millisecond':
        classNames.push(today(current));
        classNames.push(even(current.millisecond()));
        break;
      case 'second':
        classNames.push(today(current));
        classNames.push(even(current.second()));
        break;
      case 'minute':
        classNames.push(today(current));
        classNames.push(even(current.minute()));
        break;
      case 'hour':
        classNames.push(`vis-h${current.hour()}${this.step === 4 ? `-h${current.hour() + 4}` : ''}`);
        classNames.push(today(current));
        classNames.push(even(current.hour()));
        break;
      case 'weekday':
        classNames.push(`vis-${current.format('dddd').toLowerCase()}`);
        classNames.push(today(current));
        classNames.push(currentWeek(current));
        classNames.push(even(current.date()));
        break;
      case 'day':
        classNames.push(`vis-day${current.date()}`);
        classNames.push(`vis-${current.format('MMMM').toLowerCase()}`);
        classNames.push(today(current));
        classNames.push(currentMonth(current));
        classNames.push(this.step <= 2 ? today(current) : '');
        classNames.push(this.step <= 2 ? `vis-${current.format('dddd').toLowerCase()}` : '');
        classNames.push(even(current.date() - 1));
        break;
      // case 'week':
      //   classNames.push(`vis-week${current.format('w')}`);
      //   classNames.push(currentWeek(current));
      //   classNames.push(even(current.week()));
      //   break;
      case 'month':
        classNames.push(`vis-${current.format('MMMM').toLowerCase()}`);
        classNames.push(currentMonth(current));
        classNames.push(even(current.month()));
        break;
      case 'year':
        classNames.push(`vis-year${current.year()}`);
        classNames.push(currentYear(current));
        classNames.push(even(current.year()));
        break;
    }

    return classNames.filter(String).join(' ');
  }

  roundToMinor() {
    if (this.scale === 'week') {
      this.current.weekday(0);
    }

    switch (this.scale) {
      case 'year':
        this.current = this.current
          .year(this.step * Math.floor(this.current.year() / this.step))
          .month(0);
      // eslint-disable-next-line no-fallthrough
      case 'month':
        this.current = this.current.date(1);
      // eslint-disable-next-line no-fallthrough
      case 'week':
      case 'day':
      case 'weekday':
        this.current = this.current.hour(0);
        // eslint-disable-next-line no-fallthrough
      case 'hour':
        this.current = this.current.minute(0);
      // eslint-disable-next-line no-fallthrough
      case 'minute':
        this.current = this.current.second(0);
      // eslint-disable-next-line no-fallthrough
      case 'second':
        this.current = this.current.millisecond(0);
    }

    if (this.step !== 1) {
      const priorCurrent = this.current.clone();

      switch (this.scale) {
        case 'millisecond': this.current = this.current.subtract(this.current.millisecond() % this.step, 'milliseconds'); break;
        case 'second': this.current = this.current.subtract(this.current.second() % this.step, 'seconds'); break;
        case 'minute': this.current = this.current.subtract(this.current.minute() % this.step, 'minutes'); break;
        case 'hour': this.current = this.current.subtract(this.current.hour() % this.step, 'hours'); break;
        case 'weekday': // intentional fall through
        case 'day': this.current = this.current.subtract((this.current.date() - 1) % this.step, 'day'); break;
        // case 'week': this.current = this.current.subtract(this.current. % this.step, 'week'); break;
        case 'month': this.current = this.current.subtract(this.current.month() % this.step, 'month'); break;
        case 'year': this.current = this.current.subtract(this.current.year() % this.step, 'year'); break;
        default: break;
      }

      if (!priorCurrent.isSame(this.current)) {
        this.current = dayjs(DateUtil.snapAwayFromHidden(this.hiddenDates, this.current.valueOf(), -1, true));
      }
    }
  }

  setMinimumStep(minimumStep: number) {
    if (minimumStep === undefined) {
      return;
    }

    const stepYear = (1000 * 60 * 60 * 24 * 30 * 12);
    const stepMonth = (1000 * 60 * 60 * 24 * 30);
    const stepDay = (1000 * 60 * 60 * 24);
    const stepHour = (1000 * 60 * 60);
    const stepMinute = (1000 * 60);
    const stepSecond = (1000);
    const stepMillisecond = (1);

    // find the smallest step that is larger than the provided minimumStep
    if (stepYear * 1000 > minimumStep) { this.scale = 'year'; this.step = 1000; }
    if (stepYear * 500 > minimumStep) { this.scale = 'year'; this.step = 500; }
    if (stepYear * 100 > minimumStep) { this.scale = 'year'; this.step = 100; }
    if (stepYear * 50 > minimumStep) { this.scale = 'year'; this.step = 50; }
    if (stepYear * 10 > minimumStep) { this.scale = 'year'; this.step = 10; }
    if (stepYear * 5 > minimumStep) { this.scale = 'year'; this.step = 5; }
    if (stepYear > minimumStep) { this.scale = 'year'; this.step = 1; }
    if (stepMonth * 3 > minimumStep) { this.scale = 'month'; this.step = 3; }
    if (stepMonth > minimumStep) { this.scale = 'month'; this.step = 1; }
    if (stepDay * 7 > minimumStep && this.options.showWeekScale) { this.scale = 'week'; this.step = 1; }
    if (stepDay * 2 > minimumStep) { this.scale = 'day'; this.step = 2; }
    if (stepDay > minimumStep) { this.scale = 'day'; this.step = 1; }
    // if (stepDay / 2 > minimumStep) { this.scale = 'weekday'; this.step = 1; }
    if (stepHour * 4 > minimumStep) { this.scale = 'hour'; this.step = 4; }
    if (stepHour > minimumStep) { this.scale = 'hour'; this.step = 1; }
    if (stepMinute * 15 > minimumStep) { this.scale = 'minute'; this.step = 15; }
    if (stepMinute * 10 > minimumStep) { this.scale = 'minute'; this.step = 10; }
    if (stepMinute * 5 > minimumStep) { this.scale = 'minute'; this.step = 5; }
    if (stepMinute > minimumStep) { this.scale = 'minute'; this.step = 1; }
    if (stepSecond * 15 > minimumStep) { this.scale = 'second'; this.step = 15; }
    if (stepSecond * 10 > minimumStep) { this.scale = 'second'; this.step = 10; }
    if (stepSecond * 5 > minimumStep) { this.scale = 'second'; this.step = 5; }
    if (stepSecond > minimumStep) { this.scale = 'second'; this.step = 1; }
    if (stepMillisecond * 200 > minimumStep) { this.scale = 'millisecond'; this.step = 200; }
    if (stepMillisecond * 100 > minimumStep) { this.scale = 'millisecond'; this.step = 100; }
    if (stepMillisecond * 50 > minimumStep) { this.scale = 'millisecond'; this.step = 50; }
    if (stepMillisecond * 10 > minimumStep) { this.scale = 'millisecond'; this.step = 10; }
    if (stepMillisecond * 5 > minimumStep) { this.scale = 'millisecond'; this.step = 5; }
    if (stepMillisecond > minimumStep) { this.scale = 'millisecond'; this.step = 1; }
  }

  static FORMAT = {
    minorLabels: {
      millisecond: 'SSS',
      second: 's',
      minute: 'HH:mm',
      hour: 'HH:mm',
      weekday: 'ddd D',
      day: 'D',
      week: 'w',
      month: 'MMM',
      year: 'YYYY',
    },
    majorLabels: {
      millisecond: 'HH:mm:ss',
      second: 'D MMMM HH:mm',
      minute: 'ddd D MMMM',
      hour: 'ddd D MMMM',
      weekday: 'MMMM YYYY',
      day: 'YYYY-MM',
      week: 'MMMM YYYY',
      month: 'YYYY',
      year: '',
    },
  };
}

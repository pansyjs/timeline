/* eslint-disable react/no-unused-class-component-members */
/* eslint-disable style/max-statements-per-line */
import type { Dayjs } from 'dayjs';
import type { Body, TimelineOptions } from '../types';
import dayjs from 'dayjs';
import { extend, forEach } from 'vis-util/esnext';
import { TimeStep } from '../TimeStep';
import * as DateUtil from '../utils/date';
import { Component } from './Component';

interface TimeAxisDom {
  foreground: HTMLElement;
  measureCharMinor: HTMLElement;
  measureCharMajor: HTMLElement;
  lines: HTMLElement[];
  majorTexts: HTMLElement[];
  minorTexts: HTMLElement[];
  redundant: {
    lines: HTMLElement[];
    majorTexts: HTMLElement[];
    minorTexts: HTMLElement[];
  };
}

interface TimeAxisProps {
  height: number;
  minorCharWidth: number;
  minorCharHeight: number;

  majorCharHeight: number;
  majorCharWidth: number;

  minorLabelHeight: number;
  majorLabelHeight: number;
}

let warnedForOverflow = false;

export class TimeAxis extends Component {
  private body: Body;
  dom: TimeAxisDom;
  props: TimeAxisProps;
  defaultOptions: Required<TimelineOptions>;
  options: Required<TimelineOptions>;
  step!: TimeStep;

  constructor(body: Body) {
    super();

    this.body = body;

    this.dom = {
      foreground: null,
      lines: [],
      majorTexts: [],
      minorTexts: [],
      redundant: {
        lines: [],
        majorTexts: [],
        minorTexts: [],
      },
    } as unknown as TimeAxisDom;
    this.props = {
      height: 52,
    } as TimeAxisProps;

    this.defaultOptions = {
      maxMinorChars: 7,
      showMinorLabels: true,
      showMajorLabels: true,
      showWeekScale: false,
    } as Required<TimelineOptions>;
    this.options = extend({}, this.defaultOptions);

    // create the HTML DOM
    this._create();
  }

  _create() {
    if (!this.body)
      return;
    const { prefixCls } = this.body;
    this.dom.foreground = document.createElement('div');

    this.dom.foreground.className = `${prefixCls}-time-axis ${prefixCls}-foreground`;
  }

  redraw() {
    const props = this.props;
    const foreground = this.dom.foreground;
    const parent = this.body.dom.top;

    // 计算字符的宽度和高度
    this._calculateCharSize();

    parent.appendChild(this.dom.foreground);

    const foregroundNextSibling = foreground.nextSibling;
    foreground.parentNode && foreground.parentNode.removeChild(foreground);

    const showMinorLabels = this.options.showMinorLabels;
    const showMajorLabels = this.options.showMajorLabels;

    props.minorLabelHeight = showMinorLabels ? props.minorCharHeight : 0;
    props.majorLabelHeight = showMajorLabels ? props.majorCharHeight : 0;
    foreground.style.height = `${this.props.height}px`;

    this._repaintLabels();

    if (foregroundNextSibling) {
      parent.insertBefore(foreground, foregroundNextSibling);
    }
    else {
      parent.appendChild(foreground);
    }

    return this._isResized();
  }

  /**
   * 重新绘制主要和次要文本标签和垂直网格线
   */
  _repaintLabels() {
    const start = dayjs(this.body.range.start).valueOf();
    const end = dayjs(this.body.range.end).valueOf();
    const timeLabelsize = this.body.util.toTime((this.props.minorCharWidth || 10) * this.options.maxMinorChars).valueOf();
    let minimumStep = timeLabelsize - DateUtil.getHiddenDurationBefore(this.body.hiddenDates, this.body.range, timeLabelsize);
    minimumStep -= this.body.util.toTime(0).valueOf();

    const step = new TimeStep(new Date(start), new Date(end), minimumStep, this.body.hiddenDates, {
      showMajorLabels: this.options.showMajorLabels,
      showWeekScale: this.options.showWeekScale,
    });

    this.step = step;

    const dom = this.dom;
    dom.redundant.lines = dom.lines;
    dom.redundant.majorTexts = dom.majorTexts;
    dom.redundant.minorTexts = dom.minorTexts;
    dom.lines = [];
    dom.majorTexts = [];
    dom.minorTexts = [];

    let current: Dayjs;
    let next: Dayjs;
    let x: number;
    let xNext: number;
    let isMajor: boolean;
    let showMinorGrid: boolean;
    let className: string = '';
    let width = 0;
    let prevWidth: number;
    let xFirstMajorLabel: number | undefined;
    let count = 0;
    const MAX = 1000;

    step.start();
    next = step.getCurrent();
    xNext = this.body.util.toScreen(next.valueOf());
    while (step.hasNext() && count < MAX) {
      count++;

      isMajor = step.isMajor();
      className = step.getClassName();

      current = next;
      x = xNext;

      step.next();
      next = step.getCurrent();
      xNext = this.body.util.toScreen(next.valueOf());

      prevWidth = width;
      width = xNext - x;

      switch (step.scale) {
        case 'week': showMinorGrid = true; break;
        default: showMinorGrid = (width >= prevWidth * 0.4); break;
      }

      if (this.options.showMinorLabels && showMinorGrid) {
        const label = this._repaintMinorText(x, step.getLabelMinor(current), className);
        label.style.width = `${width}px`;
      }

      if (isMajor && this.options.showMajorLabels) {
        if (x > 0) {
          if (xFirstMajorLabel === undefined) {
            xFirstMajorLabel = x;
          }
          this._repaintMajorText(x, step.getLabelMajor(current), className);
        }
      }
    }

    if (count === MAX && !warnedForOverflow) {
      console.warn(`Something is wrong with the Timeline scale. Limited drawing of grid lines to ${MAX} lines.`);
      warnedForOverflow = true;
    }

    if (this.options.showMajorLabels) {
      const leftTime = this.body.util.toTime(0);
      const leftText = step.getLabelMajor(leftTime);
      const widthText = leftText.length * (this.props.majorCharWidth || 10) + 10;

      if (xFirstMajorLabel === undefined || widthText < xFirstMajorLabel) {
        this._repaintMajorText(0, leftText, className);
      }
    }

    forEach(this.dom.redundant, (arr) => {
      while (arr.length) {
        const elem = arr.pop();
        if (elem && elem.parentNode) {
          elem.parentNode.removeChild(elem);
        }
      }
    });
  }

  _repaintMinorText(x: number, text: string, className: string) {
    const { prefixCls } = this.body;
    let label = this.dom.redundant.minorTexts.shift();

    if (!label) {
      const text = document.createElement('div');
      label = document.createElement('div');
      label.appendChild(text);
      this.dom.foreground.appendChild(label);
    }

    const textDom = label.firstElementChild;
    if (textDom) {
      textDom.innerHTML = text;
      textDom.className = `${prefixCls}-tick-text`;
    }
    label.className = `${prefixCls}-tick ${prefixCls}-minor ${className}`;

    const y = this.props.majorLabelHeight;
    this._setXY(label, x, y);

    this.dom.minorTexts.push(label);
    return label;
  }

  _repaintMajorText(x: number, text: string, className: string) {
    const { prefixCls } = this.body;
    let label = this.dom.redundant.majorTexts.shift();

    if (!label) {
      const text = document.createElement('div');
      label = document.createElement('div');
      label.appendChild(text);
      this.dom.foreground.appendChild(label);
    }

    const textDom = label.firstElementChild;
    if (textDom) {
      textDom.innerHTML = text;
      textDom.className = `${prefixCls}-tick-text`;
    }
    label.className = `${prefixCls}-tick ${prefixCls}-major ${className}`;

    const y = 0;
    this._setXY(label, x, y);

    this.dom.majorTexts.push(label);
    return label;
  }

  _setXY(label: HTMLElement, x: number, y: number) {
    const directionX = x;
    label.style.transform = `translate(${directionX}px, ${y}px)`;
  }

  destroy() {
    if (this.dom.foreground?.parentNode) {
      this.dom.foreground.parentNode.removeChild(this.dom.foreground);
    }

    // @ts-expect-error 忽略报错
    this.body = null;
  }

  _calculateCharSize() {
    const { prefixCls } = this.body;

    if (!this.dom.measureCharMinor) {
      this.dom.measureCharMinor = document.createElement('div');
      this.dom.measureCharMinor.className = `${prefixCls}-text ${prefixCls}-minor ${prefixCls}-measure`;
      this.dom.measureCharMinor.style.position = 'absolute';

      this.dom.measureCharMinor.appendChild(document.createTextNode('0'));
      this.dom.foreground.appendChild(this.dom.measureCharMinor);
    }
    this.props.minorCharHeight = this.dom.measureCharMinor.clientHeight;
    this.props.minorCharWidth = this.dom.measureCharMinor.clientWidth;

    if (!this.dom.measureCharMajor) {
      this.dom.measureCharMajor = document.createElement('div');
      this.dom.measureCharMajor.className = `${prefixCls}-text ${prefixCls}-major ${prefixCls}-measure`;
      this.dom.measureCharMajor.style.position = 'absolute';

      this.dom.measureCharMajor.appendChild(document.createTextNode('0'));
      this.dom.foreground.appendChild(this.dom.measureCharMajor);
    }
    this.props.majorCharHeight = this.dom.measureCharMajor.clientHeight;
    this.props.majorCharWidth = this.dom.measureCharMajor.clientWidth;
  }
}

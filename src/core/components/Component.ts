import type { Body } from '../types';
import { extend } from 'vis-util/esnext';

export interface BaseProps {
  _previousWidth: number;
  _previousHeight: number;
  width: number;
  height: number;
  [key: string]: any;
}

export class Component<
  Options extends object = Record<string, any>,
  Props extends BaseProps = any,
> {
  options: Options;
  props: Props;

  // eslint-disable-next-line unused-imports/no-unused-vars
  constructor(body?: Body, options?: Options) {
    // @ts-expect-error 忽略报错
    this.options = null;
    // @ts-expect-error 忽略报错
    this.props = null;
  }

  setOptions(options: Options) {
    if (options) {
      extend(this.options!, options);
    }
  }

  /**
   * 重新绘制组件
   * @return {boolean} 如果组件大小被调整，则返回 true
   */
  redraw() {
    // should be implemented by the component
    return false;
  }

  /** 销毁组件并清理 DOM 和事件监听器 */
  destroy() {}

  _isResized() {
    const resized = (
      this.props._previousWidth !== this.props.width
      || this.props._previousHeight !== this.props.height
    );

    this.props._previousWidth = this.props.width;
    this.props._previousHeight = this.props.height;

    return resized!;
  }
}

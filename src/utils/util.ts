import { defaultPrefixCls } from '../config';

export function getPrefixCls(suffixCls?: string, prefixCls = defaultPrefixCls) {
  return suffixCls ? `${prefixCls}-${suffixCls}` : prefixCls;
};

/** 获取滚动事件 */
export function getWheelType() {
  const wheelType = 'onwheel' in document.createElement('div')
    ? 'wheel'
    // @ts-expect-error 忽略此报错
    : document.onmousewheel !== undefined ? 'mousewheel' : 'DOMMouseScroll';

  return wheelType;
}

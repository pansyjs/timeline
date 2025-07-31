import { defaultPrefixCls } from '../config';

export function defaultGetPrefixCls(suffixCls?: string, customizePrefixCls?: string) {
  if (customizePrefixCls) return customizePrefixCls;

  return suffixCls ? `${defaultPrefixCls}-${suffixCls}` : defaultPrefixCls;
};

/** 获取滚动事件 */
export function getWheelType() {
  const wheelType = 'onwheel' in document.createElement('div')
    ? 'wheel'
    // @ts-expect-error 忽略此报错
    : document.onmousewheel !== undefined ? 'mousewheel' : 'DOMMouseScroll';

  return wheelType;
}

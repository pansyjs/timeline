import type { HammerInput, HammerManager, Recognizer } from '../module/hammer';

interface ReleaseCallback {
  (event: HammerInput): void;
  inputHandler?: (event: HammerInput) => void;
}

/**
 * 注册触摸事件，发生在手势之前
 * @param {Hammer} hammer
 * @param {Function} callback
 */
export function onTouch(hammer: HammerManager, callback: ReleaseCallback) {
  callback.inputHandler = function (event: HammerInput) {
    if (event.isFirst) {
      callback(event);
    }
  };

  hammer.on('hammer.input', callback.inputHandler);
}

/**
 * 注册发布事件，发生在手势之前
 * @param {Hammer} hammer
 * @param {Function} callback
 */
export function onRelease(hammer: HammerManager, callback: ReleaseCallback) {
  callback.inputHandler = function (event: HammerInput) {
    if (event.isFinal) {
      callback(event);
    }
  };

  return hammer.on('hammer.input', callback.inputHandler);
}

/**
 * 取消注册触摸事件
 * @param {Hammer} hammer
 * @param {Function} callback
 */
export function offTouch(hammer: HammerManager, callback: ReleaseCallback) {
  hammer.off('hammer.input', callback.inputHandler);
}

/**
 * 取消注册发布事件
 * @param {Hammer} hammer
 * @param {Function} callback
 */
export const offRelease = offTouch;

/**
 * Hack the PinchRecognizer such that it doesn't prevent default behavior
 * for vertical panning.
 *
 * https://github.com/hammerjs/hammer.js/issues/932
 *
 * @param {Hammer.Pinch} pinchRecognizer
 * @return {Hammer.Pinch} returns the pinchRecognizer
 */
export function disablePreventDefaultVertically(pinchRecognizer: Recognizer) {
  const TOUCH_ACTION_PAN_Y = 'pan-y';

  pinchRecognizer.getTouchAction = function () {
    // default method returns [TOUCH_ACTION_NONE]
    return [TOUCH_ACTION_PAN_Y];
  };

  return pinchRecognizer;
}

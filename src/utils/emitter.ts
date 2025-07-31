import mitt from 'mitt';

export const emitter = mitt<{
  /** 鼠标滚动事件 */
  wheel: WheelEvent;
  /** 拖动开始 */
  panstart: any;
  /** 拖动中 */
  panmove: any;
  /** 拖动结束 */
  panend: any;
}>()

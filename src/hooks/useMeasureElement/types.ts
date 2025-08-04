type Key = number | string | bigint;

interface Rect {
  /** 节点宽度 */
  width: number;
  /** 节点高度 */
  height: number;
}

interface VirtualItem extends Rect {
  /** 唯一标识 */
  key: Key;
  /** 横向坐标 */
  x: number;
  /** 纵向坐标 */
  y: number;
}

export type {
  Key,
  Rect,
  VirtualItem,
};

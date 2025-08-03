import type { VirtualItem, DataItem } from '../../types';

/**
 * 判断是否存在遮挡
 * @param a
 * @param b
 * @returns
 */
export function isOverlappingX(a: VirtualItem, b: VirtualItem) {
  const aLeft = a.x;
  const aRight = a.x + a.width;
  const bLeft = b.x;
  const bRight = b.x + b.width;

  return aLeft < bRight && aRight > bLeft;
}

/**
 * 获取开始时间
 */
export function getStartTime(time: DataItem['time']) {
  return Array.isArray(time) ? time[0] : time;
}

/**
 * 通过节点获取唯一标识
 * @param node
 * @param attributeKey
 * @returns
 */
export function keyFromElement(node: HTMLDivElement, attributeKey = 'data-key') {
  return node.getAttribute(attributeKey) || '';
}

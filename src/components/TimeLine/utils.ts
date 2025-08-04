import type { VirtualItem } from '../../types';

/**
 * 将存在重叠关系的VirtualItem元素分组
 * 重叠包括直接重叠和间接重叠（A与B重叠，B与C重叠，则A、B、C视为一组）
 * @param items 待分组的元素数组
 * @returns 分组后的结果，每个子数组包含至少两个重叠元素
 */
export function splitOverlappingItems(items: VirtualItem[]): VirtualItem[][] {
  if (items.length < 2)
    return [];

  // 按x坐标升序排序，便于高效处理重叠关系
  const sortedItems = [...items].sort((a, b) => a.x - b.x);

  // 定义组的结构，包含元素列表、最小左边界和最大右边界
  interface Group {
    items: VirtualItem[];
    minLeft: number;
    maxRight: number;
  }

  const groups: Group[] = [];

  for (const item of sortedItems) {
    const itemRight = item.x + item.width;
    // 找出所有与当前元素重叠的组
    const overlappingGroups: Group[] = [];

    for (const group of groups) {
      // 重叠条件：元素左边界小于组的最大右边界，且元素右边界大于组的最小左边界
      if (item.x < group.maxRight && itemRight > group.minLeft) {
        overlappingGroups.push(group);
      }
    }

    if (overlappingGroups.length > 0) {
      // 以第一个重叠组为目标组
      const targetGroup = overlappingGroups[0];
      // 将当前元素加入目标组
      targetGroup.items.push(item);
      // 更新目标组的边界
      targetGroup.minLeft = Math.min(targetGroup.minLeft, item.x);
      targetGroup.maxRight = Math.max(targetGroup.maxRight, itemRight);

      // 合并其他重叠的组
      for (let i = 1; i < overlappingGroups.length; i++) {
        const groupToMerge = overlappingGroups[i];
        // 合并元素
        targetGroup.items.push(...groupToMerge.items);
        // 更新边界
        targetGroup.minLeft = Math.min(targetGroup.minLeft, groupToMerge.minLeft);
        targetGroup.maxRight = Math.max(targetGroup.maxRight, groupToMerge.maxRight);
        // 从组列表中移除被合并的组
        const index = groups.indexOf(groupToMerge);
        if (index !== -1) {
          groups.splice(index, 1);
        }
      }
    }
    else {
      // 没有重叠组，创建新组
      groups.push({
        items: [item],
        minLeft: item.x,
        maxRight: itemRight,
      });
    }
  }

  // 过滤掉只有一个元素的组，返回结果
  return groups.map(group => group.items).filter(groupItems => groupItems.length >= 2);
}

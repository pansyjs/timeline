import { memoize } from 'es-toolkit/function';

interface AdjustColorOpacityOptions {
  color: string;
  opacity?: number;
}

/**
 * 调整颜色的透明度
 * @param {string} color - 原始颜色值（支持十六进制、rgb、rgba、颜色名称）
 * @param {number} opacity - 透明度值（0-1之间，例如0.3表示30%透明度）
 * @returns {string} 调整后的RGBA颜色字符串
 */
function adjustColorOpacity(opts: AdjustColorOpacityOptions) {
  const { color, opacity = 0.3 } = opts;

  if (!color) return undefined;

  if (typeof opacity !== 'number' || opacity < 0 || opacity > 1) {
    throw new Error('透明度必须是0到1之间的数字');
  }

  const tempEl = document.createElement('div');
  tempEl.style.display = 'none';
  tempEl.style.color = color;
  document.body.appendChild(tempEl);

  const computedColor = getComputedStyle(tempEl).color;
  document.body.removeChild(tempEl);

  const rgbMatch = computedColor.match(/^rgb(a)?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/);

  if (rgbMatch) {
    const [, , r, g, b] = rgbMatch;

    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }

  return undefined;
}

export const adjustColorOpacityMemoize = memoize(adjustColorOpacity, {
  getCacheKey: (opts: AdjustColorOpacityOptions) => opts.color + opts.opacity
})

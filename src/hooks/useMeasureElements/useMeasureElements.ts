import type { MeasureElementsOptions } from './MeasureElements';
import React from 'react';
import { useIsomorphicLayoutEffect } from '../useIsomorphicLayoutEffect';
import { MeasureElements } from './MeasureElements';

/**
 * 测量元素
 * @param options
 */
export function useMeasureElements<
  ContainerElement extends Element,
  ItemElement extends Element,
>(
  options: MeasureElementsOptions<ContainerElement, ItemElement>,
) {
  const rerender = React.useReducer(() => ({}), {})[1];

  const resolvedOptions: MeasureElementsOptions<ContainerElement, ItemElement> = {
    ...options,
    onChange: (instance) => {
      rerender();
      options.onChange?.(instance);
    },
  };

  const [instance] = React.useState(
    () => new MeasureElements<ContainerElement, ItemElement>(resolvedOptions),
  );

  instance.setOptions(resolvedOptions);

  useIsomorphicLayoutEffect(() => {
    return instance._didMount();
  }, []);

  useIsomorphicLayoutEffect(() => {
    return instance._willUpdate();
  });

  return instance;
}

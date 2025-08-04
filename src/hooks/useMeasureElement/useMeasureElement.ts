import type { MeasureElementOptions } from './MeasureElement';
import React from 'react';
import { useIsomorphicLayoutEffect } from '../useIsomorphicLayoutEffect';
import { MeasureElement } from './MeasureElement';

export function useMeasureElement<
  ContainerElement extends Element,
  ItemElement extends Element,
>(
  options: MeasureElementOptions<ContainerElement, ItemElement>,
) {
  const rerender = React.useReducer(() => ({}), {})[1];

  const resolvedOptions: MeasureElementOptions<ContainerElement, ItemElement> = {
    ...options,
    onChange: (instance) => {
      rerender();
      options.onChange?.(instance);
    },
  };

  const [instance] = React.useState(
    () => new MeasureElement<ContainerElement, ItemElement>(resolvedOptions),
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

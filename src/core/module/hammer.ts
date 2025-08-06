import Hammer from '@egjs/hammerjs';
// @ts-expect-error 忽略此报错
import propagating from 'propagating-hammerjs';

export type HammerType = typeof Hammer;
export type HammerManager = InstanceType<HammerType>;
export type Recognizer = ReturnType<HammerManager['get']>;
export type HammerInput = Parameters<Recognizer['emit']>['0'];

const modifiedHammer = propagating(Hammer, {
  preventDefault: 'mouse',
}) as HammerType;

export default modifiedHammer;

import type { HammerType } from '../types';
import Hammer from '@egjs/hammerjs';
// @ts-expect-error 忽略此报错
import propagating from 'propagating-hammerjs';

const modifiedHammer = propagating(Hammer, {
  preventDefault: 'mouse',
}) as HammerType;

export default modifiedHammer;

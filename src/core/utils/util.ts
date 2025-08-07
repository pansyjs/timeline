import type { DataInterfaceDataItem, DataItemCollectionType } from '../types';
import dayjs from 'dayjs';
import { createNewDataPipeFrom, DataSet, isDataViewLike as isDataViewLikeUpstream } from 'vis-data/esnext';

export function isDataViewLike(obj: DataItemCollectionType) {
  if (!obj) {
    return false;
  }
  // @ts-expect-error 兼容代码
  const idProp = obj.idProp ?? obj._idProp;

  if (!idProp) {
    return false;
  }

  return isDataViewLikeUpstream(idProp, obj);
}

export function typeCoerceDataSet(
  rawDS: DataInterfaceDataItem,
  type = { start: 'Date', end: 'Date' },
) {
  const idProp = rawDS.idProp;
  const coercedDS = new DataSet({ fieldId: idProp });

  const dateKeys = Object.keys(type);

  const pipe = createNewDataPipeFrom(rawDS)
    .map(item =>
      Object.keys(item).reduce((acc, key) => {
        if (dateKeys.includes(key)) {
          // @ts-expect-error 暂时忽略
          acc[key] = dayjs(item[key]);
        }
        else {
          // @ts-expect-error 暂时忽略
          acc[key] = item[key];
        }
        return acc;
      }, {}),
    )
    .to(coercedDS);

  pipe.all().start();

  return {
    // Write only.
    // @ts-expect-error 忽略报错
    add: (...args) => rawDS.getDataSet().add(...args),
    // @ts-expect-error 忽略报错
    remove: (...args) => rawDS.getDataSet().remove(...args),
    // @ts-expect-error 忽略报错
    update: (...args) => rawDS.getDataSet().update(...args),
    // @ts-expect-error 忽略报错
    updateOnly: (...args) => rawDS.getDataSet().updateOnly(...args),
    // @ts-expect-error 忽略报错
    clear: (...args) => rawDS.getDataSet().clear(...args),

    // Read only.
    forEach: coercedDS.forEach.bind(coercedDS),
    get: coercedDS.get.bind(coercedDS),
    getIds: coercedDS.getIds.bind(coercedDS),
    off: coercedDS.off.bind(coercedDS),
    on: coercedDS.on.bind(coercedDS),

    get length() {
      return coercedDS.length;
    },

    // Non standard.
    idProp,
    type,

    rawDS,
    coercedDS,
    dispose: () => pipe.stop(),
  };
}

export function getWheelType() {
  const wheelType = 'onwheel' in document.createElement('div')
    ? 'wheel'
    // @ts-expect-error 兼容代码
    : document.onmousewheel !== undefined
      ? 'mousewheel'
      : 'onmousewheel';

  return wheelType as 'wheel';
}

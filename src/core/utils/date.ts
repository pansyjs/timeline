import type { Core } from '../Core';
import type { Body, DateType, HiddenDatesType } from '../types';
import dayjs from 'dayjs';
import dayOfYear from 'dayjs/plugin/dayOfYear';

dayjs.extend(dayOfYear);

export function getHiddenDurationBefore(hiddenDates: Body['hiddenDates'], range: Body['range'], time: DateType) {
  let timeOffset = 0;
  const timeValue = dayjs(time).toDate().valueOf();

  for (let i = 0; i < hiddenDates.length; i++) {
    const startDate = hiddenDates[i].start;
    const endDate = hiddenDates[i].end;
    // if time after the cutout, and the
    if (startDate >= range.start && endDate < range.end) {
      if (timeValue >= endDate) {
        timeOffset += (endDate - startDate);
      }
    }
  }

  return timeOffset;
}

/**
 * 检查时间是否被隐藏
 * @param time
 * @param hiddenDates
 */
function getIsHidden(time: number, hiddenDates: Body['hiddenDates']) {
  let startDate;
  let endDate;

  for (let i = 0; i < hiddenDates.length; i++) {
    startDate = hiddenDates[i].start;
    endDate = hiddenDates[i].end;

    if (time >= startDate && time < endDate) { // if the start is entering a hidden zone
      return { hidden: true, startDate, endDate };
    }
  }
  return { hidden: false, startDate, endDate } as {
    hidden: boolean;
    startDate: number;
    endDate: number;
  };
}

/**
 * 从隐藏日期列表中删除重复项
 * @param body
 */
export function removeDuplicates(body: Body) {
  const hiddenDates = body.hiddenDates;

  const safeDates = [];

  for (let i = 0; i < hiddenDates.length; i++) {
    for (let j = 0; j < hiddenDates.length; j++) {
      if (i !== j && hiddenDates[j].remove !== true && hiddenDates[i].remove !== true) {
        // j inside i
        if (hiddenDates[j].start >= hiddenDates[i].start && hiddenDates[j].end <= hiddenDates[i].end) {
          hiddenDates[j].remove = true;
        }
        // j start inside i
        else if (hiddenDates[j].start >= hiddenDates[i].start && hiddenDates[j].start <= hiddenDates[i].end) {
          hiddenDates[i].end = hiddenDates[j].end;
          hiddenDates[j].remove = true;
        }
        // j end inside i
        else if (hiddenDates[j].end >= hiddenDates[i].start && hiddenDates[j].end <= hiddenDates[i].end) {
          hiddenDates[i].start = hiddenDates[j].start;
          hiddenDates[j].remove = true;
        }
      }
    }
  }

  for (let i = 0; i < hiddenDates.length; i++) {
    if (hiddenDates[i].remove !== true) {
      safeDates.push(hiddenDates[i]);
    }
  }

  body.hiddenDates = safeDates;
  body.hiddenDates.sort((a, b) => a.start - b.start);
}

/**
 * 更新隐藏日期
 * @param body
 * @param hiddenDates
 */
export function updateHiddenDates(body: Body, hiddenDates: HiddenDatesType) {
  if (hiddenDates && !Array.isArray(hiddenDates)) {
    return updateHiddenDates(body, [hiddenDates]);
  }

  if (hiddenDates && body.domProps.centerContainer.width !== undefined) {
    const start = dayjs(body.range.start);
    const end = dayjs(body.range.end);

    const totalRange = (body.range.end - body.range.start);
    const pixelTime = totalRange / body.domProps.centerContainer.width;

    for (let i = 0; i < hiddenDates.length; i++) {
      if (hiddenDates[i].repeat !== undefined) {
        let startDate = dayjs(hiddenDates[i].start);
        let endDate = dayjs(hiddenDates[i].end);

        const duration = endDate.valueOf() - startDate.valueOf();

        if (duration >= 4 * pixelTime) {
          let offset = 0;
          const runUntil = end.clone();

          switch (hiddenDates[i].repeat) {
            case 'daily':
              if (startDate.day() !== endDate.day()) {
                offset = 1;
              }

              startDate = startDate.dayOfYear(start.dayOfYear())
                .year(start.year())
                .subtract(7, 'days');

              endDate = endDate.dayOfYear(start.dayOfYear())
                .year(start.year())
                .subtract(7 - offset, 'days');

              runUntil.add(1, 'weeks');
              break;
            case 'weekly': {
              const dayOffset = endDate.diff(startDate, 'days');
              const day = startDate.day();

              startDate = startDate.date(start.date())
                .month(start.month())
                .year(start.year());
              endDate = startDate.clone();

              startDate = startDate.day(day).subtract(1, 'weeks');
              endDate = endDate.day(day)
                .add(dayOffset, 'days')
                .subtract(1, 'weeks');

              runUntil.add(1, 'weeks');
              break;
            }
            case 'monthly':
              if (startDate.month() !== endDate.month()) {
                offset = 1;
              }

              startDate = startDate.month(start.month())
                .year(start.year())
                .subtract(1, 'months');

              endDate = endDate.month(start.month())
                .year(start.year())
                .subtract(1, 'months')
                .add(offset, 'months');

              runUntil.add(1, 'months');
              break;

            case 'yearly':
              if (startDate.year() !== endDate.year()) {
                offset = 1;
              }

              startDate = startDate.year(start.year())
                .subtract(1, 'years');
              endDate = endDate.year(start.year())
                .subtract(1, 'years')
                .add(offset, 'years');

              runUntil.add(1, 'years');
              break;
            default:
              // eslint-disable-next-line no-console
              console.log('Wrong repeat format, allowed are: daily, weekly, monthly, yearly. Given:', hiddenDates[i].repeat);
              return;
          }

          while (startDate < runUntil) {
            body.hiddenDates.push({ start: startDate.valueOf(), end: endDate.valueOf() });

            switch (hiddenDates[i].repeat) {
              case 'daily':
                startDate = startDate.add(1, 'days');
                endDate = endDate.add(1, 'days');
                break;
              case 'weekly':
                startDate = startDate.add(1, 'weeks');
                endDate = endDate.add(1, 'weeks');
                break;
              case 'monthly':
                startDate = startDate.add(1, 'months');
                endDate = endDate.add(1, 'months');
                break;
              case 'yearly':
                startDate = startDate.add(1, 'y');
                endDate = endDate.add(1, 'y');
                break;
              default:
                // eslint-disable-next-line no-console
                console.log('Wrong repeat format, allowed are: daily, weekly, monthly, yearly. Given:', hiddenDates[i].repeat);
                return;
            }
          }

          body.hiddenDates.push({ start: startDate.valueOf(), end: endDate.valueOf() });
        }
      }
    }

    removeDuplicates(body);
    const startHidden = getIsHidden(body.range.start, body.hiddenDates);
    const endHidden = getIsHidden(body.range.end, body.hiddenDates);

    let rangeStart = body.range.start;
    let rangeEnd = body.range.end;

    if (startHidden.hidden === true) {
      rangeStart = body.range.startToFront === true ? startHidden.startDate - 1 : startHidden.endDate + 1;
    }

    if (endHidden.hidden === true) {
      rangeEnd = body.range.endToFront === true ? endHidden.startDate - 1 : endHidden.endDate + 1;
    }

    if (startHidden.hidden === true || endHidden.hidden === true) {
      body.range._applyRange(rangeStart, rangeEnd);
    }
  }
}

export function toTime(
  core: InstanceType<typeof Core>,
  x: number,
  width: number,
) {
  const conversion = core.range.conversion(width);
  return new Date(x / conversion.scale + conversion.offset);
}

export function snapAwayFromHidden(
  hiddenDates: Body['hiddenDates'],
  time: number,
  direction: number,
  correctionEnabled: boolean,
) {
  const isHidden = getIsHidden(time, hiddenDates);
  if (isHidden.hidden === true) {
    if (direction < 0) {
      if (correctionEnabled === true) {
        return isHidden.startDate - (isHidden.endDate - time) - 1;
      }
      else {
        return isHidden.startDate - 1;
      }
    }
    else {
      if (correctionEnabled === true) {
        return isHidden.endDate + (time - isHidden.startDate) + 1;
      }
      else {
        return isHidden.endDate + 1;
      }
    }
  }
  else {
    return time;
  }
}

export function toScreen(core: InstanceType<typeof Core>, time: number, width: number) {
  let conversion;
  if (core.body.hiddenDates.length === 0) {
    conversion = core.range.conversion(width);
    return (time - conversion.offset) * conversion.scale;
  }
  else {
    const hidden = getIsHidden(time, core.body.hiddenDates);
    if (hidden.hidden === true) {
      time = hidden.startDate;
    }

    const duration = getHiddenDurationBetween(core.body.hiddenDates, core.range.start, core.range.end);
    if (time < core.range.start) {
      conversion = core.range.conversion(width, duration);
      const hiddenBeforeStart = getHiddenDurationBeforeStart(core.body.hiddenDates, time, conversion.offset);
      time = dayjs(time).toDate().valueOf();
      time = time + hiddenBeforeStart;
      return -(conversion.offset - time.valueOf()) * conversion.scale;
    }
    else if (time > core.range.end) {
      const rangeAfterEnd = { start: core.range.start, end: time };
      time = correctTimeForHidden(core.body.hiddenDates, rangeAfterEnd as Body['range'], time);
      conversion = core.range.conversion(width, duration);
      return (time.valueOf() - conversion.offset) * conversion.scale;
    }
    else {
      time = correctTimeForHidden(core.body.hiddenDates, core.range, time);
      conversion = core.range.conversion(width, duration);
      return (time.valueOf() - conversion.offset) * conversion.scale;
    }
  }
}

export function correctTimeForHidden(hiddenDates: Body['hiddenDates'], range: Body['range'], time: DateType) {
  time = dayjs(time).toDate().valueOf();
  time -= getHiddenDurationBefore(hiddenDates, range, time);
  return time;
}

export function getHiddenDurationBetween(hiddenDates: Body['hiddenDates'], start: number, end: number) {
  let duration = 0;
  for (let i = 0; i < hiddenDates.length; i++) {
    const startDate = hiddenDates[i].start;
    const endDate = hiddenDates[i].end;
    // if time after the cutout, and the
    if (startDate >= start && endDate < end) {
      duration += endDate - startDate;
    }
  }
  return duration;
}

export function getHiddenDurationBeforeStart(hiddenDates: Body['hiddenDates'], start: number, end: number) {
  let duration = 0;
  for (let i = 0; i < hiddenDates.length; i++) {
    const startDate = hiddenDates[i].start;
    const endDate = hiddenDates[i].end;

    if (startDate >= start && endDate <= end) {
      duration += endDate - startDate;
    }
  }
  return duration;
}

import type { TimeLineProps } from '@pansy/react-timeline';
import { TimeLine } from '@pansy/react-timeline';
import React from 'react';
import VisTimeline from './VisTimeline';

// eslint-disable-next-line unused-imports/no-unused-vars
const data: TimeLineProps['data'] = [
  {
    id: '1',
    title: '单点事件',
    color: '#A140E7',
    start: '2024-03-10 10:00:00',
  },
  {
    id: '1111',
    title: '单点事件',
    start: '2024-03-10 10:01:00',
  },
  {
    id: '2',
    title: '时间范围事件',
    color: '#A140E7',
    start: '2024-03-10 11:30:00',
    end: '2024-03-10 13:30:00',
  },
  {
    id: '3',
    title: '单点事件',
    start: '2024-03-10 16:00:00',
  },
  {
    id: '4',
    title: '长时间范围事件',
    start: '2024-03-10 14:15:00',
    end: '2024-03-10 18:15:00',
  },
  {
    id: '5',
    title: '长时间范围事件',
    start: '2024-03-10 19:15:00',
    end: '2024-03-10 23:15:00',
  },
];

function Demo() {
  const [list] = React.useState<TimeLineProps['data']>([]);

  return (
    <div style={{ padding: 24, background: '#0000001d' }}>
      <VisTimeline />

      <br />

      <TimeLine data={list} />
    </div>
  );
};

export default Demo;

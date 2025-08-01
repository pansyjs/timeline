import type { TimeLineProps } from '@pansy/react-timeline';
import React from 'react';
import { TimeLine } from '@pansy/react-timeline';

const data: TimeLineProps['data'] = [
  {
    id: '1',
    title: '单点事件',
    color: '#A140E7',
    customRender: false,
    time: '2024-03-10 10:00:00',
  },
  {
    id: '1111',
    title: '单点事件',
    time: '2024-03-10 10:01:00',
  },
  {
    id: '2',
    title: '时间范围事件',
    color: '#A140E7',
    customRender: false,
    time: ['2024-03-10 11:30:00', '2024-03-10 13:30:00'],
  },
  {
    id: '3',
    title: '单点事件',
    customRender: false,
    time: '2024-03-10 16:00:00',
  },
  {
    id: '4',
    title: '长时间范围事件',
    customRender: false,
    time: ['2024-03-10 14:15:00', '2024-03-10 18:15:00'],
  },
    {
    id: '5',
    title: '长时间范围事件',
    customRender: false,
    time: ['2024-03-10 19:15:00', '2024-03-10 23:15:00'],
  }
];

function Demo() {
  return (
    <TimeLine
      data={data}
      renderCard={(data) => {
        return (
          <div
            style={{
              background: '#fff',
              width: 180,
              height: 80,
              borderLeft: `3px solid ${data.color}`
            }}
          >
            {data.title}
          </div>
        )
      }}
    />
  );
};

export default Demo;

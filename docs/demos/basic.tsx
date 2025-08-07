import { TimeLine } from '@pansy/react-timeline';
import React from 'react';
import VisTimeline from './VisTimeline';

function Demo() {
  return (
    <div style={{ padding: 24, background: '#0000001d' }}>
      <VisTimeline />

      <br />

      <TimeLine />
    </div>
  );
};

export default Demo;

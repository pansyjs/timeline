import React from 'react';
import { Timeline } from 'vis-timeline/standalone';
import 'vis-timeline/styles/vis-timeline-graph2d.css';

function Demo() {
  const rootRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(
    () => {
      const root = rootRef.current;

      if (root) {
        const timeline = new Timeline(root, [], {
          showCurrentTime: false,
          hiddenDates: [
            { start: '2025-08-07 00:00:00', end: '2025-08-08 00:00:00' },
          ],
        });

        return () => {
          timeline.destroy();
        };
      }
    },
    [],
  );

  return (
    <div ref={rootRef} />
  );
};

export default Demo;

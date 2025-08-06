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

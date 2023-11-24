import { NodeSpecJSON, NodeDescription, Socket } from '@magickml/behave-graph';
import React from 'react';

import Node from './Node.js';

const NodePreview = ({ description, inputs, outputs, spec }: Props) => {
  return (
    <div
      style={{
        background: 'rgb(30, 31, 34)',
        backgroundImage:
          'linear-gradient(rgb(37,38,40) .1em, transparent .1em), linear-gradient(90deg, rgb(37,38,40) .1em, transparent .1em)',
        backgroundSize: '1em 1em',
        padding: '2em',
        width: 'fit-content'
      }}
    >
      <Node spec={spec} />
    </div>
  );
};

export type Props = {
  description: NodeDescription;
  inputs: Socket[];
  outputs: Socket[];
  spec: NodeSpecJSON;
};

export default NodePreview;

import { INode, NodeSpecJSON } from '@magickml/behave-graph';

import socketsTable from './inputs-table.js';

export default (node: INode, specJSON: NodeSpecJSON) => {
  if (
    !('inputs' in node) ||
    !Array.isArray(node.inputs) ||
    node.inputs.length === 0
  ) {
    return '';
  }

  return `## Inputs

${socketsTable(node.inputs, specJSON)}`;
};

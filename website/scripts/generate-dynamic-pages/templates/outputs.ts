import { INode, NodeSpecJSON } from '@magickml/behave-graph';

import socketsTable from './outputs-table.js';

export default (node: INode, specJSON: NodeSpecJSON) => {
  if (
    !('outputs' in node) ||
    !Array.isArray(node.outputs) ||
    node.outputs.length === 0
  ) {
    return '';
  }

  return `## Outputs

${socketsTable(node.outputs)}`;
};

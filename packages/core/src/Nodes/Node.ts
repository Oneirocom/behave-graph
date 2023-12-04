import { IGraph } from '../Graphs/Graph.js';
import { Socket } from '../Sockets/Socket.js';
import { generateUuid } from '../generateUuid.js';
import { INode, NodeType } from './NodeInstance.js';
import { readInputFromSockets, writeOutputsToSocket } from './NodeSockets.js';
import { INodeDescription } from './Registry/NodeDescription.js';

export interface IStateService {
  getState(nodeId: string, graph: IGraph): any;
  setState(nodeId: string, state: any, graph: IGraph): void;
}

export type NodeConfiguration = {
  [key: string]: any;
};

export abstract class Node<TNodeType extends NodeType> implements INode {
  public readonly inputs: Socket[];
  public readonly outputs: Socket[];
  public readonly description: INodeDescription;
  // public typeName: string;
  public nodeType: TNodeType;
  public readonly otherTypeNames: string[] | undefined;
  public graph: IGraph;
  public label?: string;
  public metadata: any;
  public id: string;
  public readonly configuration: NodeConfiguration;

  constructor(node: Omit<INode, 'nodeType' | 'id'> & { nodeType: TNodeType }) {
    this.id = generateUuid();
    this.inputs = node.inputs;
    this.outputs = node.outputs;
    this.description = node.description;
    this.nodeType = node.nodeType;
    this.graph = node.graph;
    this.configuration = node.configuration;
    this.metadata = node.metadata || {};
  }

  readInput = <T>(inputName: string): T => {
    return readInputFromSockets(
      this.inputs,
      inputName,
      this.description.typeName
    );
  };

  writeOutput = <T>(outputName: string, value: T) => {
    writeOutputsToSocket(
      this.outputs,
      outputName,
      value,
      this.description.typeName
    );
  };
}

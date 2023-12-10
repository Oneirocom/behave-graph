import { IGraph } from '../Graphs/Graph.js';
import { Socket } from '../Sockets/Socket.js';
import { generateUuid } from '../generateUuid.js';
import { INode, NodeType } from './NodeInstance.js';
import { readInputFromSockets, writeOutputsToSocket } from './NodeSockets.js';
import { INodeDescription } from './Registry/NodeDescription.js';

export interface IStateService {
  getState(nodeId: string, graph: IGraph): Promise<any> | any;
  setState(nodeId: string, state: any, graph: IGraph): Promise<void> | void;
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
  public _state: any;
  public id: string;
  public readonly configuration: NodeConfiguration;

  async getState() {
    const stateService = this.graph.getDependency<IStateService>(
      'IStateService',
      true
    );
    if (stateService) {
      const serviceState = await stateService.getState(this.id, this.graph);
      return {
        ...this._state,
        ...serviceState
      };
    }
    return this._state;
  }

  async setState(value: Record<string, any>) {
    // check if value is an object and if so, check for functions and store them separately
    const functions: any = {};
    const obj: any = {};
    for (const key in value) {
      if (typeof value[key] === 'function') {
        functions[key] = value[key];
        delete value[key];
      } else {
        obj[key] = value[key];
      }
    }

    this._state = {
      ...this._state,
      ...functions
    };

    const stateService = this.graph.getDependency<IStateService>(
      'IStateService',
      true
    );
    if (stateService) {
      await stateService.setState(this.id, value, this.graph);
      return;
    }
    this._state = {
      ...this._state,
      ...obj
    };
  }

  constructor(node: Omit<INode, 'nodeType'> & { nodeType: TNodeType }) {
    this.id = node.id;
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

import { Assert } from '../Diagnostics/Assert.js';
import { Engine } from '../Execution/Engine.js';
import { IGraph } from '../Graphs/Graph.js';
import { Socket } from '../Sockets/Socket.js';
import { generateUuid } from '../generateUuid.js';
import { IStateService, Node, NodeConfiguration } from './Node.js';
import { IAsyncNodeDefinition, NodeCategory } from './NodeDefinitions.js';
import { IAsyncNode, INode, NodeType } from './NodeInstance.js';
import { NodeDescription } from './Registry/NodeDescription.js';

// async flow node with only a single flow input
export class AsyncNode extends Node<NodeType.Async> {
  constructor(
    description: NodeDescription,
    graph: IGraph,
    inputs: Socket[] = [],
    outputs: Socket[] = [],
    configuration: NodeConfiguration = {},
    id: string
  ) {
    super({
      description: {
        ...description,
        category: description.category as NodeCategory
      },
      id,
      inputs,
      outputs,
      graph,
      nodeType: NodeType.Async,
      configuration
    });

    // must have at least one input flow socket
    Assert.mustBeTrue(
      this.inputs.some((socket) => socket.valueTypeName === 'flow')
    );

    // must have at least one output flow socket
    Assert.mustBeTrue(
      this.outputs.some((socket) => socket.valueTypeName === 'flow')
    );
  }

  // eslint-disable-next-line unused-imports/no-unused-vars, @typescript-eslint/no-unused-vars
  triggered(
    engine: Engine,
    triggeringSocketName: string,
    finished: () => void
  ) {
    throw new Error('not implemented');
  }

  dispose() {
    throw new Error('not implemented');
  }
}

export class AsyncNode2 extends AsyncNode {
  constructor(props: {
    description: NodeDescription;
    graph: IGraph;
    inputs?: Socket[];
    outputs?: Socket[];
    id: string;
  }) {
    super(
      props.description,
      props.graph,
      props.inputs,
      props.outputs,
      {},
      props.id
    );
  }
}

export class AsyncNodeInstance<TAsyncNodeDef extends IAsyncNodeDefinition>
  extends Node<NodeType.Async>
  implements IAsyncNode
{
  private triggeredInner: TAsyncNodeDef['triggered'];
  private disposeInner: TAsyncNodeDef['dispose'];

  constructor(
    node: Omit<INode, 'nodeType'> &
      Pick<TAsyncNodeDef, 'triggered' | 'initialState' | 'dispose'>
  ) {
    super({ ...node, nodeType: NodeType.Async });

    this.triggeredInner = node.triggered;
    this.disposeInner = node.dispose;

    this.setState(node.initialState);
  }

  triggered = async (
    engine: Pick<Engine, 'commitToNewFiber'>,
    triggeringSocketName: string,
    finished: () => void
  ) => {
    const currentState = await this.getState();
    const nextState = await this.triggeredInner({
      read: this.readInput,
      write: this.writeOutput,
      commit: (outFlowname, fiberCompletedListener) =>
        engine.commitToNewFiber(this, outFlowname, fiberCompletedListener),
      configuration: this.configuration,
      graph: this.graph,
      state: currentState,
      finished,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      triggeringSocketName
    });

    await this.setState(nextState);
  };
  dispose = async () => {
    const currentState = this.getState();
    const state = this.disposeInner({
      state: currentState,
      setState: this.setState,
      graph: this.graph
    });
    this.setState(state);
  };
}

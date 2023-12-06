import { Fiber } from '../../../Execution/Fiber.js';
import { IGraph } from '../../../Graphs/Graph.js';
import { FlowNode } from '../../../Nodes/FlowNode.js';
import {
  NodeDescription,
  NodeDescription2
} from '../../../Nodes/Registry/NodeDescription.js';
import { Socket } from '../../../Sockets/Socket.js';

// this is equivalent to Promise.all()
export class WaitAll extends FlowNode {
  public static Description = new NodeDescription2({
    typeName: 'flow/waitAll',
    category: 'Flow',
    label: 'WaitAll',
    configuration: {
      numInputs: {
        valueType: 'number',
        defaultValue: 3
      }
    },
    factory: (description, graph, config, id) =>
      new WaitAll(description, graph, config.numInputs, config, id)
  });

  private isOn = true;

  constructor(
    description: NodeDescription,
    graph: IGraph,
    private numInputs: number,
    config: Record<string, unknown>,
    id: string
  ) {
    const inputs: Socket[] = [];
    for (let i = 1; i <= numInputs; i++) {
      inputs.push(new Socket('flow', `${i}`));
    }

    super(
      description,
      graph,
      [
        ...inputs,
        new Socket('flow', 'reset'),
        new Socket('boolean', 'autoReset')
      ],
      [new Socket('flow', 'flow')],
      config,
      id
    );

    this.reset();
  }

  private triggeredMap: { [key: string]: boolean } = {};
  private triggeredCount = 0;
  private outputTriggered = false;

  private reset() {
    for (let inputIndex = 1; inputIndex <= this.numInputs; inputIndex++) {
      this.triggeredMap[`${inputIndex}`] = false;
    }
    this.triggeredCount = 0;
    this.outputTriggered = false;
  }

  triggered(fiber: Fiber, triggeringSocketName: string) {
    if (triggeringSocketName === 'reset') {
      this.reset();
      return;
    }

    if (this.triggeredMap[triggeringSocketName]) {
      return;
    }

    this.triggeredMap[triggeringSocketName] = true;
    this.triggeredCount++;

    // if a & b are triggered, first output!
    if (this.triggeredCount === this.numInputs && !this.outputTriggered) {
      fiber.commit(this, 'flow');
      this.outputTriggered = true;

      // auto-reset if required.
      if (this.readInput('autoReset') === true) {
        this.reset();
      }
    }
  }
}

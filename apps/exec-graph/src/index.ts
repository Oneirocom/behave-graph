import { promises as fs } from 'node:fs';
import process from 'node:process';

import {
  DefaultLogger,
  Engine,
  ILifecycleEventEmitter,
  Logger,
  LogLevel,
  ManualLifecycleEventEmitter,
  parseSafeFloat,
  readGraphFromJSON,
  registerCoreProfile,
  validateGraph,
  validateRegistry
} from '@magickml/behave-graph';
import { DummyScene, registerSceneProfile } from '@behave-graph/scene';
import { program } from 'commander';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const packageInfo = require('../package.json');

const { name, version } = packageInfo as { name: string; version: string };

type ProgramOptions = {
  upgrade?: boolean;
  logLevel?: number;
  dryRun?: boolean;
  iterations: string;
};

async function execGraph({
  jsonPattern,
  programOptions
}: {
  jsonPattern: string;
  programOptions: ProgramOptions;
}) {
  const registry = registerSceneProfile(
    registerCoreProfile({
      values: {},
      nodes: {},
      dependencies: {
        ILogger: new DefaultLogger(),
        ILifecycleEventEmitter: new ManualLifecycleEventEmitter(),
        IScene: new DummyScene()
      }
    })
  );

  if (programOptions.logLevel) {
    Logger.logLevel = programOptions.logLevel as LogLevel;
  }
  const graphJsonPath = jsonPattern;
  Logger.verbose(`reading behavior graph: ${graphJsonPath}`);
  const textFile = await fs.readFile(graphJsonPath);
  const graph = readGraphFromJSON({
    graphJson: JSON.parse(textFile.toString('utf8')),
    registry
  });
  graph.name = graphJsonPath;

  const errorList: string[] = [];
  errorList.push(...validateRegistry(registry), ...validateGraph(graph));

  if (errorList.length > 0) {
    Logger.error(`${errorList.length} errors found:`);
    errorList.forEach((errorText, errorIndex) => {
      Logger.error(`${errorIndex}: ${errorText}`);
    });
    return;
  }

  /* if (programOptions.upgrade) {
    const newGraphJson = writeGraphToJSON(graph);
    await fs.writeFile(graphJsonPath, JSON.stringify(newGraphJson, null, 2));
  }*/

  Logger.verbose('creating behavior graph');
  const engine = new Engine(graph.nodes);

  // do not log at all to the verbose if not verbose is not enabled, makes a big performance difference.
  if (programOptions.logLevel === LogLevel.Verbose) {
    engine.onNodeExecutionStart.addListener((node) =>
      Logger.verbose(`<< ${node.description.typeName} >> START`)
    );
    engine.onNodeExecutionEnd.addListener((node) =>
      Logger.verbose(`<< ${node.description.typeName} >> END`)
    );
  }

  if (programOptions.dryRun) {
    return;
  }

  const lifecycleEventEmitter = registry.dependencies
    .ILifecycleEventEmitter! as ILifecycleEventEmitter;
  const startTime = Date.now();
  if (lifecycleEventEmitter.startEvent.listenerCount > 0) {
    Logger.verbose('triggering start event');
    lifecycleEventEmitter.startEvent.emit();

    Logger.verbose('executing all (async)');
    await engine.executeAllAsync(5);
  }

  if (lifecycleEventEmitter.tickEvent.listenerCount > 0) {
    const iterations = parseSafeFloat(programOptions.iterations, 5);
    for (let tick = 0; tick < iterations; tick++) {
      Logger.verbose(`triggering tick (${tick} of ${iterations})`);
      lifecycleEventEmitter.tickEvent.emit();

      Logger.verbose('executing all (async)');
      // eslint-disable-next-line no-await-in-loop
      await engine.executeAllAsync(5);
    }
  }

  if (lifecycleEventEmitter.endEvent.listenerCount > 0) {
    Logger.verbose('triggering end event');
    lifecycleEventEmitter.endEvent.emit();

    Logger.verbose('executing all (async)');
    await engine.executeAllAsync(5);
  }

  const deltaTime = Date.now() - startTime;
  Logger.verbose(
    `profile results: ${engine.executionSteps} nodes executed in ${
      deltaTime / 1000
    } seconds, at a rate of ${Math.round(
      (engine.executionSteps * 1000) / deltaTime
    )} steps/second`
  );

  engine.dispose();
}

export const main = async () => {
  program
    .name(name)
    .version(version)
    .argument('<filename>', 'path to the behavior-graph json to execute')
    .option('-l, --logLevel <logLevel>', `trace node execution`, '1')
    .option('-p, --profile', `profile execution time`)
    .option('-d, --dryRun', `do not run graph`)
    .option(
      '-u, --upgrade',
      `write json graph back to read location, upgrading format`
    )
    .option('-i, --iterations <iterations>', 'number of tick iterations', '5');

  program.parse(process.argv);
  const programOptions = program.opts() as ProgramOptions;

  const jsonPattern = program.args[0];

  await execGraph({ programOptions, jsonPattern });
};

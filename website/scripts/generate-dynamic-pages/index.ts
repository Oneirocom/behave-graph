import { join } from 'node:path';

// import generatePagesFromDescriptions from './generate-pages-from-descriptions.js';
// import { descriptions as coreDescriptions } from './profiles/core.js';
// generatePagesFromDescriptions(
//   coreDescriptions,
//   join(__dirname, '../../docs/profiles/Core')
// );
import {
  registerCoreProfile,
  registerSceneProfile,
  Registry
} from '@magickml/behave-graph';
import generatePagesFromExamples from './generate-pages-from-examples.js';
import generatePagesFromRegistry from './generate-pages-from-registry.js';

const coreRegistry = new Registry();

registerCoreProfile(coreRegistry);

generatePagesFromRegistry(
  coreRegistry,
  join(__dirname, '../../docs/profiles/Core')
);

const sceneRegistry = new Registry();
const sceneFunctionalRegistry = new Registry();

registerSceneProfile(sceneRegistry);
registerCoreProfile(sceneFunctionalRegistry);
registerSceneProfile(sceneFunctionalRegistry);

generatePagesFromRegistry(
  sceneRegistry,
  join(__dirname, '../../docs/profiles/Scene'),
  sceneFunctionalRegistry
);

generatePagesFromExamples(
  join(__dirname, '../../../graphs'),
  join(__dirname, '../../docs/examples')
);

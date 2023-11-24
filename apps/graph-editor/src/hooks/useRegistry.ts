import {
  DefaultLogger,
  IRegistry,
  ManualLifecycleEventEmitter,
  registerCoreProfile
} from '@magickml/behave-graph';
import { DummyScene, registerSceneProfile } from '@behave-graph/scene';
import { useMemo } from 'react';

export const useRegistry = () => {
  return useMemo<IRegistry>(
    () =>
      registerSceneProfile(
        registerCoreProfile({
          values: {},
          nodes: {},
          dependencies: {
            ILogger: new DefaultLogger(),
            ILifecycleEventEmitter: new ManualLifecycleEventEmitter(),
            IScene: new DummyScene()
          }
        })
      ),
    []
  );
};

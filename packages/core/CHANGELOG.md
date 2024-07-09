# @magickml/behave-graph

## 0.14.15

### Patch Changes

- Improve error logging from read graph JSON validation

## 0.14.14

### Patch Changes

- Use socket list definition for graph socket json

## 0.14.13

### Patch Changes

- Add type support gor graph inputs and outputs

## 0.14.12

### Patch Changes

- Update IStateService

## 0.14.11

### Patch Changes

- Make data property optional on graphJSON

## 0.14.10

### Patch Changes

- Add data property to GraphJSON type

## 0.14.9

### Patch Changes

- Await inner init function in event node and remove console log.

## 0.14.8

### Patch Changes

- Add optional choices to confguration type

## 0.14.7

### Patch Changes

- Add reset state to state service interface

## 0.14.6

### Patch Changes

- Add onNodeCommit event emitter

## 0.14.5

### Patch Changes

- Remove event inint emit and add onNodeExecutionError

## 0.14.4

### Patch Changes

- Don't have resolveSockets optional

## 0.14.3

### Patch Changes

- Commit callback now takes a helper function to resolve socket values if needed

## 0.14.2

### Patch Changes

- Fix promise check function in fiber listener callback

## 0.14.1

### Patch Changes

- Fix error in fiber complete wrapper listener

## 0.14.0

### Minor Changes

- Removes get and set state and uses a proxy. Fix fiber listeners.

## 0.13.7

### Patch Changes

- Fix for fiber callbacks with async functions

## 0.13.6

### Patch Changes

- Resolve socket values on commit callback and fix delay node

## 0.13.5

### Patch Changes

- Support asycn pure functions. Reduces speed but gives more flexible value access.

## 0.13.4

### Patch Changes

- Expand the values allowed for ValueJSON

## 0.13.3

### Patch Changes

- Export node factory helpers

## 0.13.2

### Patch Changes

- Update build process

## 0.13.1

### Patch Changes

- fixed bug on async node definition state

## 0.13.0

### Minor Changes

- Changed graph to execute async aawait and added state functions

## 0.12.0

### Minor Changes

- Convert nodes and add support for individual node ids.

## 0.11.1

### Patch Changes

- Add unique id to engione class on creation

## 0.11.0

### Minor Changes

- Adds IState Service to node states

### Patch Changes

- 7d8cce5: Add engine and node to event init definition

## 0.10.1

### Patch Changes

- 43932de: Fixes scene import and build issues

## 0.10.0

### Minor Changes

- Updates core packages to work in browser and node

## 0.9.13

### Patch Changes

- 3b0f9dd: Adds exports for missing graph flow code

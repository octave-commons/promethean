```
<!-- SYMPKG:PKG:BEGIN -->
```
# @promethean-os/fsm
```
**Folder:** `packages/fsm`
```
```
**Version:** `0.1.0`
```
```
**Domain:** `_root`
```
```mermaid
graph LR
  A["@promethean-os/fsm"]
```
## Dependencies
- _None_
## Dependents
- _None_
```


## 📁 Implementation

### Core Files

- [61](../../../packages/fsm/src/61)

### View Source

- [GitHub](https://github.com/promethean-ai/promethean/tree/main/packages/fsm/src)
- [VS Code](vscode://file/packages/fsm/src)


## 📚 API Reference

### Interfaces

#### [- **adapters.ts**](../../../packages/fsm/src/[src/adapters.ts](../../../packages/fsm/src/adapters.ts) (264 lines)#L1)

#### [- **core/types.ts**](../../../packages/fsm/src/[src/core/types.ts](../../../packages/fsm/src/core/types.ts) (214 lines)#L1)

#### [- **graph/index.ts**](../../../packages/fsm/src/[src/graph/index.ts](../../../packages/fsm/src/graph/index.ts) (87 lines)#L1)

#### [- **immutability.ts**](../../../packages/fsm/src/[src/immutability.ts](../../../packages/fsm/src/immutability.ts) (16 lines)#L1)

#### [- **index.ts**](../../../packages/fsm/src/[src/index.ts](../../../packages/fsm/src/index.ts) (103 lines)#L1)

#### [- **machine.ts**](../../../packages/fsm/src/[src/machine.ts](../../../packages/fsm/src/machine.ts) (231 lines)#L1)

#### [- **sequence.ts**](../../../packages/fsm/src/[src/sequence.ts](../../../packages/fsm/src/sequence.ts) (148 lines)#L1)

#### [- **simple/functional-core.ts**](../../../packages/fsm/src/[src/simple/functional-core.ts](../../../packages/fsm/src/simple/functional-core.ts) (356 lines)#L1)

#### [- **simple/index.ts**](../../../packages/fsm/src/[src/simple/index.ts](../../../packages/fsm/src/simple/index.ts) (32 lines)#L1)

#### [- **simple/legacy-wrapper.ts**](../../../packages/fsm/src/[src/simple/legacy-wrapper.ts](../../../packages/fsm/src/simple/legacy-wrapper.ts) (207 lines)#L1)

#### [- **simple/simple-machine.ts**](../../../packages/fsm/src/[src/simple/simple-machine.ts](../../../packages/fsm/src/simple/simple-machine.ts) (33 lines)#L1)

#### [- **tests/integration-fsm-architecture.test.ts**](../../../packages/fsm/src/[src/tests/integration-fsm-architecture.test.ts](../../../packages/fsm/src/tests/integration-fsm-architecture.test.ts) (871 lines)#L1)

#### [- **tests/machine.test.ts**](../../../packages/fsm/src/[src/tests/machine.test.ts](../../../packages/fsm/src/tests/machine.test.ts) (312 lines)#L1)

#### [- **types.ts**](../../../packages/fsm/src/[src/types.ts](../../../packages/fsm/src/types.ts) (128 lines)#L1)

#### [- **UnifiedFSMEngine**](../../../packages/fsm/src/[UnifiedFSMEngine](../../../packages/fsm/src/adapters.ts#L45)

#### [- **FSMGraph**](../../../packages/fsm/src/[FSMGraph](../../../packages/fsm/src/graph/index.ts#L77)

#### [- **SimpleMachine**](../../../packages/fsm/src/[SimpleMachine](../../../packages/fsm/src/simple/legacy-wrapper.ts#L35)

#### [- **is**](../../../packages/fsm/src/[is](../../../packages/fsm/src/simple/legacy-wrapper.ts#L43)

#### [- **createKanbanFSM()**](../../../packages/fsm/src/[createKanbanFSM()](../../../packages/fsm/src/adapters.ts#L196)

#### [- **createAgentsWorkflowFSM()**](../../../packages/fsm/src/[createAgentsWorkflowFSM()](../../../packages/fsm/src/adapters.ts#L200)

#### [- **createPiperFSM()**](../../../packages/fsm/src/[createPiperFSM()](../../../packages/fsm/src/adapters.ts#L204)

#### [- **basicKanbanConfig()**](../../../packages/fsm/src/[basicKanbanConfig()](../../../packages/fsm/src/adapters.ts#L210)

#### [- **basicWorkflowConfig()**](../../../packages/fsm/src/[basicWorkflowConfig()](../../../packages/fsm/src/adapters.ts#L230)

#### [- **GitHub**](../../../packages/fsm/src/[View on GitHub](https#L1)

#### [- **VS Code**](../../../packages/fsm/src/[Open in VS Code](vscode#L1)

#### [**Location**](../../../packages/fsm/src/[UnifiedFSMEngine](../../../packages/fsm/src/adapters.ts#L45)

#### [**Description**](../../../packages/fsm/src/Main class for unifiedfsmengine functionality.#L1)

#### [**File**](../../../packages/fsm/src/`src/adapters.ts`#L1)

#### [**Location**](../../../packages/fsm/src/[FSMGraph](../../../packages/fsm/src/graph/index.ts#L77)

#### [**Description**](../../../packages/fsm/src/Main class for fsmgraph functionality.#L1)

#### [**File**](../../../packages/fsm/src/`src/graph/index.ts`#L1)

#### [**Location**](../../../packages/fsm/src/[SimpleMachine](../../../packages/fsm/src/simple/legacy-wrapper.ts#L35)

#### [**Description**](../../../packages/fsm/src/Main class for simplemachine functionality.#L1)

#### [**File**](../../../packages/fsm/src/`src/simple/legacy-wrapper.ts`#L1)

#### [**Location**](../../../packages/fsm/src/[is](../../../packages/fsm/src/simple/legacy-wrapper.ts#L43)

#### [**Description**](../../../packages/fsm/src/Main class for is functionality.#L1)

#### [**File**](../../../packages/fsm/src/`src/simple/legacy-wrapper.ts`#L1)

#### [**Location**](../../../packages/fsm/src/[createKanbanFSM()](../../../packages/fsm/src/adapters.ts#L196)

#### [**Description**](../../../packages/fsm/src/Key function for createkanbanfsm operations.#L1)

#### [**File**](../../../packages/fsm/src/`src/adapters.ts`#L1)

#### [**Location**](../../../packages/fsm/src/[createAgentsWorkflowFSM()](../../../packages/fsm/src/adapters.ts#L200)

#### [**Description**](../../../packages/fsm/src/Key function for createagentsworkflowfsm operations.#L1)

#### [**File**](../../../packages/fsm/src/`src/adapters.ts`#L1)

#### [**Location**](../../../packages/fsm/src/[createPiperFSM()](../../../packages/fsm/src/adapters.ts#L204)

#### [**Description**](../../../packages/fsm/src/Key function for createpiperfsm operations.#L1)

#### [**File**](../../../packages/fsm/src/`src/adapters.ts`#L1)

#### [**Location**](../../../packages/fsm/src/[basicKanbanConfig()](../../../packages/fsm/src/adapters.ts#L210)

#### [**Description**](../../../packages/fsm/src/Key function for basickanbanconfig operations.#L1)

#### [**File**](../../../packages/fsm/src/`src/adapters.ts`#L1)

#### [**Location**](../../../packages/fsm/src/[basicWorkflowConfig()](../../../packages/fsm/src/adapters.ts#L230)

#### [**Description**](../../../packages/fsm/src/Key function for basicworkflowconfig operations.#L1)

#### [**File**](../../../packages/fsm/src/`src/adapters.ts`#L1)

#### [**Location**](../../../packages/fsm/src/[basicPipelineConfig()](../../../packages/fsm/src/adapters.ts#L249)

#### [**Description**](../../../packages/fsm/src/Key function for basicpipelineconfig operations.#L1)

#### [**File**](../../../packages/fsm/src/`src/adapters.ts`#L1)

#### [**Location**](../../../packages/fsm/src/[freezeArray()](../../../packages/fsm/src/immutability.ts#L3)

#### [**Description**](../../../packages/fsm/src/Key function for freezearray operations.#L1)

#### [**File**](../../../packages/fsm/src/`src/immutability.ts`#L1)

#### [**Location**](../../../packages/fsm/src/[freezeSnapshot()](../../../packages/fsm/src/immutability.ts#L7)

#### [**Description**](../../../packages/fsm/src/Key function for freezesnapshot operations.#L1)

#### [**File**](../../../packages/fsm/src/`src/immutability.ts`#L1)

#### [**Location**](../../../packages/fsm/src/[createMachine()](../../../packages/fsm/src/machine.ts#L16)

#### [**Description**](../../../packages/fsm/src/Key function for createmachine operations.#L1)

#### [**File**](../../../packages/fsm/src/`src/machine.ts`#L1)

#### [**Location**](../../../packages/fsm/src/[defineTransition()](../../../packages/fsm/src/machine.ts#L28)

#### [**Description**](../../../packages/fsm/src/Key function for definetransition operations.#L1)

#### [**File**](../../../packages/fsm/src/`src/machine.ts`#L1)

#### [**Location**](../../../packages/fsm/src/[createSnapshot()](../../../packages/fsm/src/machine.ts#L36)

#### [**Description**](../../../packages/fsm/src/Key function for createsnapshot operations.#L1)

#### [**File**](../../../packages/fsm/src/`src/machine.ts`#L1)

#### [**Location**](../../../packages/fsm/src/[transition()](../../../packages/fsm/src/machine.ts#L185)

#### [**Description**](../../../packages/fsm/src/Key function for transition operations.#L1)

#### [**File**](../../../packages/fsm/src/`src/machine.ts`#L1)

#### [**Location**](../../../packages/fsm/src/[availableTransitions()](../../../packages/fsm/src/machine.ts#L203)

#### [**Description**](../../../packages/fsm/src/Key function for availabletransitions operations.#L1)

#### [**File**](../../../packages/fsm/src/`src/machine.ts`#L1)

#### [**Location**](../../../packages/fsm/src/[canTransition()](../../../packages/fsm/src/machine.ts#L213)

#### [**Description**](../../../packages/fsm/src/Key function for cantransition operations.#L1)

#### [**File**](../../../packages/fsm/src/`src/machine.ts`#L1)

#### [**Location**](../../../packages/fsm/src/[transitionMany()](../../../packages/fsm/src/sequence.ts#L125)

#### [**Description**](../../../packages/fsm/src/Key function for transitionmany operations.#L1)

#### [**File**](../../../packages/fsm/src/`src/sequence.ts`#L1)

#### [**Location**](../../../packages/fsm/src/[transitionManyFromParams()](../../../packages/fsm/src/sequence.ts#L135)

#### [**Description**](../../../packages/fsm/src/Key function for transitionmanyfromparams operations.#L1)

#### [**File**](../../../packages/fsm/src/`src/sequence.ts`#L1)

#### [**Location**](../../../packages/fsm/src/[createSimpleMachineState()](../../../packages/fsm/src/simple/functional-core.ts#L61)

#### [**Description**](../../../packages/fsm/src/Key function for createsimplemachinestate operations.#L1)

#### [**File**](../../../packages/fsm/src/`src/simple/functional-core.ts`#L1)

#### [**Location**](../../../packages/fsm/src/[getCurrentSimpleState()](../../../packages/fsm/src/simple/functional-core.ts#L80)

#### [**Description**](../../../packages/fsm/src/Key function for getcurrentsimplestate operations.#L1)

#### [**File**](../../../packages/fsm/src/`src/simple/functional-core.ts`#L1)

#### [**Location**](../../../packages/fsm/src/[getCurrentSimpleContext()](../../../packages/fsm/src/simple/functional-core.ts#L83)

#### [**Description**](../../../packages/fsm/src/Key function for getcurrentsimplecontext operations.#L1)

#### [**File**](../../../packages/fsm/src/`src/simple/functional-core.ts`#L1)

#### [**Location**](../../../packages/fsm/src/[canSimpleTransition()](../../../packages/fsm/src/simple/functional-core.ts#L87)

#### [**Description**](../../../packages/fsm/src/Key function for cansimpletransition operations.#L1)

#### [**File**](../../../packages/fsm/src/`src/simple/functional-core.ts`#L1)

#### [**Location**](../../../packages/fsm/src/[simpleTransition()](../../../packages/fsm/src/simple/functional-core.ts#L116)

#### [**Description**](../../../packages/fsm/src/Key function for simpletransition operations.#L1)

#### [**File**](../../../packages/fsm/src/`src/simple/functional-core.ts`#L1)

#### [**Location**](../../../packages/fsm/src/[resetSimpleMachine()](../../../packages/fsm/src/simple/functional-core.ts#L207)

#### [**Description**](../../../packages/fsm/src/Key function for resetsimplemachine operations.#L1)

#### [**File**](../../../packages/fsm/src/`src/simple/functional-core.ts`#L1)

#### [**Location**](../../../packages/fsm/src/[getSimpleAvailableTransitions()](../../../packages/fsm/src/simple/functional-core.ts#L224)

#### [**Description**](../../../packages/fsm/src/Key function for getsimpleavailabletransitions operations.#L1)

#### [**File**](../../../packages/fsm/src/`src/simple/functional-core.ts`#L1)

#### [**Location**](../../../packages/fsm/src/[createSimpleMachine()](../../../packages/fsm/src/simple/legacy-wrapper.ts#L202)

#### [**Description**](../../../packages/fsm/src/Key function for createsimplemachine operations.#L1)

#### [**File**](../../../packages/fsm/src/`src/simple/legacy-wrapper.ts`#L1)

#### [**Location**](../../../packages/fsm/src/[SystemConfig](../../../packages/fsm/src/adapters.ts#L16)

#### [**Description**](../../../packages/fsm/src/Type definition for systemconfig.#L1)

#### [**File**](../../../packages/fsm/src/`src/adapters.ts`#L1)

#### [**Location**](../../../packages/fsm/src/[StateConfig](../../../packages/fsm/src/adapters.ts#L25)

#### [**Description**](../../../packages/fsm/src/Type definition for stateconfig.#L1)

#### [**File**](../../../packages/fsm/src/`src/adapters.ts`#L1)

#### [**Location**](../../../packages/fsm/src/[TransitionConfig](../../../packages/fsm/src/adapters.ts#L33)

#### [**Description**](../../../packages/fsm/src/Type definition for transitionconfig.#L1)

#### [**File**](../../../packages/fsm/src/`src/adapters.ts`#L1)

#### [**Location**](../../../packages/fsm/src/[KanbanContext](../../../packages/fsm/src/adapters.ts#L150)

#### [**Description**](../../../packages/fsm/src/Type definition for kanbancontext.#L1)

#### [**File**](../../../packages/fsm/src/`src/adapters.ts`#L1)

#### [**Location**](../../../packages/fsm/src/[WorkflowContext](../../../packages/fsm/src/adapters.ts#L164)

#### [**Description**](../../../packages/fsm/src/Type definition for workflowcontext.#L1)

#### [**File**](../../../packages/fsm/src/`src/adapters.ts`#L1)

#### [**Location**](../../../packages/fsm/src/[PipelineContext](../../../packages/fsm/src/adapters.ts#L179)

#### [**Description**](../../../packages/fsm/src/Type definition for pipelinecontext.#L1)

#### [**File**](../../../packages/fsm/src/`src/adapters.ts`#L1)

#### [**Location**](../../../packages/fsm/src/[CoreTransition](../../../packages/fsm/src/core/types.ts#L22)

#### [**Description**](../../../packages/fsm/src/Type definition for coretransition.#L1)

#### [**File**](../../../packages/fsm/src/`src/core/types.ts`#L1)

#### [**Location**](../../../packages/fsm/src/[FSMSnapshot](../../../packages/fsm/src/core/types.ts#L33)

#### [**Description**](../../../packages/fsm/src/Type definition for fsmsnapshot.#L1)

#### [**File**](../../../packages/fsm/src/`src/core/types.ts`#L1)

#### [**Location**](../../../packages/fsm/src/[StateActions](../../../packages/fsm/src/core/types.ts#L47)

#### [**Description**](../../../packages/fsm/src/Type definition for stateactions.#L1)

#### [**File**](../../../packages/fsm/src/`src/core/types.ts`#L1)

#### [**Location**](../../../packages/fsm/src/[FSMError](../../../packages/fsm/src/core/types.ts#L53)

#### [**Description**](../../../packages/fsm/src/Type definition for fsmerror.#L1)

#### [**File**](../../../packages/fsm/src/`src/core/types.ts`#L1)

#### [**Location**](../../../packages/fsm/src/[MachineConfig](../../../packages/fsm/src/core/types.ts#L63)

#### [**Description**](../../../packages/fsm/src/Type definition for machineconfig.#L1)

#### [**File**](../../../packages/fsm/src/`src/core/types.ts`#L1)

#### [**Location**](../../../packages/fsm/src/[TransitionDefinition](../../../packages/fsm/src/core/types.ts#L72)

#### [**Description**](../../../packages/fsm/src/Type definition for transitiondefinition.#L1)

#### [**File**](../../../packages/fsm/src/`src/core/types.ts`#L1)

#### [**Location**](../../../packages/fsm/src/[StateDefinition](../../../packages/fsm/src/core/types.ts#L82)

#### [**Description**](../../../packages/fsm/src/Type definition for statedefinition.#L1)

#### [**File**](../../../packages/fsm/src/`src/core/types.ts`#L1)

#### [**Location**](../../../packages/fsm/src/[MachineDefinition](../../../packages/fsm/src/core/types.ts#L93)

#### [**Description**](../../../packages/fsm/src/Type definition for machinedefinition.#L1)

#### [**File**](../../../packages/fsm/src/`src/core/types.ts`#L1)

#### [**Location**](../../../packages/fsm/src/[ValidationResult](../../../packages/fsm/src/core/types.ts#L100)

#### [**Description**](../../../packages/fsm/src/Type definition for validationresult.#L1)

#### [**File**](../../../packages/fsm/src/`src/core/types.ts`#L1)

#### [**Location**](../../../packages/fsm/src/[MachineAnalysis](../../../packages/fsm/src/core/types.ts#L107)

#### [**Description**](../../../packages/fsm/src/Type definition for machineanalysis.#L1)

#### [**File**](../../../packages/fsm/src/`src/core/types.ts`#L1)

#### [**Location**](../../../packages/fsm/src/[EventResult](../../../packages/fsm/src/core/types.ts#L116)

#### [**Description**](../../../packages/fsm/src/Type definition for eventresult.#L1)

#### [**File**](../../../packages/fsm/src/`src/core/types.ts`#L1)

#### [**Location**](../../../packages/fsm/src/[MachineBuilder](../../../packages/fsm/src/core/types.ts#L139)

#### [**Description**](../../../packages/fsm/src/Type definition for machinebuilder.#L1)

#### [**File**](../../../packages/fsm/src/`src/core/types.ts`#L1)

#### [**Location**](../../../packages/fsm/src/[SerializedMachine](../../../packages/fsm/src/core/types.ts#L151)

#### [**Description**](../../../packages/fsm/src/Type definition for serializedmachine.#L1)

#### [**File**](../../../packages/fsm/src/`src/core/types.ts`#L1)

#### [**Location**](../../../packages/fsm/src/[SerializedTransition](../../../packages/fsm/src/core/types.ts#L157)

#### [**Description**](../../../packages/fsm/src/Type definition for serializedtransition.#L1)

#### [**File**](../../../packages/fsm/src/`src/core/types.ts`#L1)

#### [**Location**](../../../packages/fsm/src/[Inspector](../../../packages/fsm/src/core/types.ts#L171)

#### [**Description**](../../../packages/fsm/src/Type definition for inspector.#L1)

#### [**File**](../../../packages/fsm/src/`src/core/types.ts`#L1)

#### [**Location**](../../../packages/fsm/src/[PerformanceMetrics](../../../packages/fsm/src/core/types.ts#L181)

#### [**Description**](../../../packages/fsm/src/Type definition for performancemetrics.#L1)

#### [**File**](../../../packages/fsm/src/`src/core/types.ts`#L1)

#### [**Location**](../../../packages/fsm/src/[MachineSnapshot](../../../packages/fsm/src/core/types.ts#L190)

#### [**Description**](../../../packages/fsm/src/Type definition for machinesnapshot.#L1)

#### [**File**](../../../packages/fsm/src/`src/core/types.ts`#L1)

#### [**Location**](../../../packages/fsm/src/[MachineEvent](../../../packages/fsm/src/core/types.ts#L192)

#### [**Description**](../../../packages/fsm/src/Type definition for machineevent.#L1)

#### [**File**](../../../packages/fsm/src/`src/core/types.ts`#L1)

#### [**Location**](../../../packages/fsm/src/[InitialContext](../../../packages/fsm/src/core/types.ts#L197)

#### [**Description**](../../../packages/fsm/src/Type definition for initialcontext.#L1)

#### [**File**](../../../packages/fsm/src/`src/core/types.ts`#L1)

#### [**Location**](../../../packages/fsm/src/[TransitionResult](../../../packages/fsm/src/core/types.ts#L202)

#### [**Description**](../../../packages/fsm/src/Type definition for transitionresult.#L1)

#### [**File**](../../../packages/fsm/src/`src/core/types.ts`#L1)

#### [**Location**](../../../packages/fsm/src/[FSMConfig](../../../packages/fsm/src/graph/index.ts#L36)

#### [**Description**](../../../packages/fsm/src/Type definition for fsmconfig.#L1)

#### [**File**](../../../packages/fsm/src/`src/graph/index.ts`#L1)

#### [**Location**](../../../packages/fsm/src/[FSMState](../../../packages/fsm/src/graph/index.ts#L47)

#### [**Description**](../../../packages/fsm/src/Type definition for fsmstate.#L1)

#### [**File**](../../../packages/fsm/src/`src/graph/index.ts`#L1)

#### [**Location**](../../../packages/fsm/src/[FSMTransition](../../../packages/fsm/src/graph/index.ts#L52)

#### [**Description**](../../../packages/fsm/src/Type definition for fsmtransition.#L1)

#### [**File**](../../../packages/fsm/src/`src/graph/index.ts`#L1)

#### [**Location**](../../../packages/fsm/src/[FSMTransitionResult](../../../packages/fsm/src/graph/index.ts#L61)

#### [**Description**](../../../packages/fsm/src/Type definition for fsmtransitionresult.#L1)

#### [**File**](../../../packages/fsm/src/`src/graph/index.ts`#L1)

#### [**Location**](../../../packages/fsm/src/[FSMValidationResult](../../../packages/fsm/src/graph/index.ts#L70)

#### [**Description**](../../../packages/fsm/src/Type definition for fsmvalidationresult.#L1)

#### [**File**](../../../packages/fsm/src/`src/graph/index.ts`#L1)

#### [**Location**](../../../packages/fsm/src/[SimpleStateConfig](../../../packages/fsm/src/simple/functional-core.ts#L23)

#### [**Description**](../../../packages/fsm/src/Type definition for simplestateconfig.#L1)

#### [**File**](../../../packages/fsm/src/`src/simple/functional-core.ts`#L1)

#### [**Location**](../../../packages/fsm/src/[SimpleTransitionConfig](../../../packages/fsm/src/simple/functional-core.ts#L31)

#### [**Description**](../../../packages/fsm/src/Type definition for simpletransitionconfig.#L1)

#### [**File**](../../../packages/fsm/src/`src/simple/functional-core.ts`#L1)

#### [**Location**](../../../packages/fsm/src/[SimpleMachineDefinition](../../../packages/fsm/src/simple/functional-core.ts#L45)

#### [**Description**](../../../packages/fsm/src/Type definition for simplemachinedefinition.#L1)

#### [**File**](../../../packages/fsm/src/`src/simple/functional-core.ts`#L1)

#### [Code links saved to](../../../packages/fsm/src//home/err/devel/promethean/tmp/fsm-code-links.json#L1)



---

*Enhanced with code links via SYMPKG documentation enhancer*
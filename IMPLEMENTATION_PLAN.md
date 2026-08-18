# Data Structures Visualization Platform -- Implementation Plan

## Table of Contents

1. Folder Structure
2. Plugin Interface
3. State Management with Zustand
4. Step / Event System
5. Scene Graph Design
6. Telemetry Service
7. Persistence Layer
8. Component Tree
9. Data Flow
10. Build Order

---

## 1. Folder Structure

```
ds-algo-viz/
├── index.html
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.ts
├── package.json
├── public/
│   └── favicon.svg
└── src/
    ├── main.tsx                        # ReactDOM entry
    ├── App.tsx                         # Root component
    ├── index.css                       # Tailwind directives + global styles
    │
    ├── core/
    │   ├── index.ts                    # Barrel export
    │   ├── types.ts                    # Core shared types (StepEvent, Highlight, etc.)
    │   ├── VisualizationEngine.ts      # Orchestrates plugin → render pipeline
    │   ├── OperationEngine.ts          # Calls plugin operation, collects steps
    │   ├── StepGenerator.ts            # Base step generation utilities
    │   ├── StateReducer.ts             # Immutable state transition application
    │   ├── SceneGraph.ts               # SceneNode type definitions + builder helpers
    │   ├── renderer/
    │   │   ├── index.ts
    │   │   ├── D3Renderer.ts           # D3.js-based renderer for linear/tree structures
    │   │   ├── FlowRenderer.ts         # React Flow-based renderer for graphs
    │   │   └── CanvasController.ts     # Shared SVG/container management
    │   └── playback/
    │       ├── index.ts
    │       └── PlaybackController.ts   # Timer-based step advancement
    │
    ├── plugins/
    │   ├── index.ts                    # Barrel + registry initialization
    │   ├── types.ts                    # Plugin interface, DSOperation, VisualizationConfig
    │   ├── registry.ts                 # PluginRegistry class (register, get, list)
    │   ├── array/
    │   │   ├── index.ts                # Plugin export
    │   │   ├── ArrayPlugin.ts          # DataStructurePlugin<ArrayState> implementation
    │   │   ├── ArrayState.ts           # ArrayState interface
    │   │   ├── operations.ts           # insert, delete, search, update, sort, reverse, slice
    │   │   ├── visualization.ts        # renderScene, highlightFn, layout
    │   │   ├── pseudocode.ts           # Pseudocode for each operation
    │   │   └── complexities.ts         # Time/space complexity per operation
    │   ├── linked-list/
    │   │   └── ...                     # Same structure
    │   ├── stack/
    │   │   └── ...
    │   ├── queue/
    │   │   └── ...
    │   ├── hash-table/
    │   │   └── ...
    │   ├── bst/
    │   │   └── ...
    │   ├── heap/
    │   │   └── ...
    │   └── graph/
    │       └── ...
    │
    ├── services/
    │   ├── index.ts
    │   ├── telemetry/
    │   │   ├── index.ts
    │   │   ├── TelemetryService.ts     # Interface + default impl
    │   │   └── TelemetryBuffer.ts      # Non-blocking write buffer
    │   ├── persistence/
    │   │   ├── index.ts
    │   │   ├── PersistenceService.ts   # Interface definition
    │   │   ├── LocalStorageService.ts  # LocalStorage implementation
    │   │   ├── IndexedDBService.ts     # IndexedDB implementation
    │   │   └── SessionService.ts       # Session save/load/export
    │   └── service-provider.ts         # Dependency injection / service locator
    │
    ├── store/
    │   ├── index.ts                    # Combined store export
    │   ├── useStore.ts                 # Zustand store creation + middleware
    │   ├── slices/
    │   │   ├── pluginSlice.ts          # Plugin registry state + actions
    │   │   ├── visualizationSlice.ts   # Steps, currentStepIndex, playback state
    │   │   ├── operationSlice.ts       # Active operation, params
    │   │   ├── uiSlice.ts              # Panel visibility, theme, layout prefs
    │   │   └── sessionSlice.ts         # Session recording state
    │   ├── selectors/
    │   │   ├── pluginSelectors.ts
    │   │   ├── visualizationSelectors.ts
    │   │   ├── operationSelectors.ts
    │   │   └── uiSelectors.ts
    │   └── middleware/
    │       ├── logger.ts               # Zustand middleware to log all store changes
    │       └── telemetryMiddleware.ts  # Dispatch telemetry events on mutations
    │
    ├── components/
    │   ├── layout/
    │   │   ├── AppLayout.tsx           # Three-column responsive layout
    │   │   ├── Sidebar.tsx             # Left sidebar wrapper
    │   │   ├── MainContent.tsx         # Center content wrapper
    │   │   └── SidePanel.tsx           # Right panel wrapper with tabs
    │   ├── sidebar/
    │   │   ├── DataStructureList.tsx   # List of available DS plugins
    │   │   ├── DSItem.tsx             # Individual DS entry (icon, name)
    │   │   └── OperationPanel.tsx      # Operation selector + param inputs
    │   ├── visualization/
    │   │   ├── VisualizationPane.tsx   # Container for the visual canvas
    │   │   ├── VisualizationCanvas.tsx # D3.js rendered SVG area
    │   │   ├── GraphCanvas.tsx         # React Flow rendered graph area
    │   │   └── VisualizationTooltip.tsx# Hover tooltip on elements
    │   ├── controls/
    │   │   ├── PlaybackControls.tsx    # Play/pause/step/restart bar
    │   │   ├── SpeedControl.tsx        # Speed slider
    │   │   └── StepProgress.tsx        # Step progress bar / scrubber
    │   ├── panels/
    │   │   ├── ExplanationPanel.tsx    # Step-by-step text explanation
    │   │   ├── PseudocodePanel.tsx     # Pseudocode with line highlighting
    │   │   ├── PseudocodeLine.tsx      # Single line component
    │   │   ├── ComplexityPanel.tsx     # Time/space complexity display
    │   │   └── LogPanel.tsx            # Telemetry log viewer
    │   ├── session/
    │   │   ├── SessionPanel.tsx        # Session save/load/export UI
    │   │   └── SessionList.tsx         # List of saved sessions
    │   └── common/
    │       ├── Badge.tsx
    │       ├── Button.tsx
    │       ├── Select.tsx
    │       ├── Slider.tsx
    │       ├── Tabs.tsx
    │       └── Icon.tsx
    │
    ├── hooks/
    │   ├── usePlugin.ts               # Access active plugin
    │   ├── usePlayback.ts             # Playback timer management
    │   ├── useD3Renderer.ts           # D3.js mount/update lifecycle
    │   ├── useFlowRenderer.ts         # React Flow mount/update lifecycle
    │   └── useKeyboardShortcuts.ts    # Space/arrows/enter for playback
    │
    ├── data/
    │   ├── lessons/
    │   │   ├── array-lessons.json
    │   │   ├── linked-list-lessons.json
    │   │   └── ...
    │   └── exercises/
    │       ├── array-exercises.json
    │       ├── linked-list-exercises.json
    │       └── ...
    │
    └── utils/
        ├── id.ts                      # nanoid-based ID generation
        ├── deepClone.ts               # Structured clone helper
        └── time.ts                    # Formatting utilities
```

**Rationale**: Every DS plugin is a folder under `plugins/` containing its own state type, operations, visualization config, pseudocode, and complexity data. The `core/` layer has zero knowledge of any specific DS type -- it only speaks in terms of `StepEvent[]`, `SceneNode`, and `DataStructurePlugin<unknown>`. Services use interface-first design so that LocalStorage/IndexedDB can be swapped for API calls later.

---

## 2. Plugin Interface

Every data structure lives in a plugin file that exports a single object conforming to `DataStructurePlugin<State>`.

### Core Plugin Types (in `src/plugins/types.ts`)

```typescript
// ── Operation Definition ─────────────────────────────────────────────

export interface DSOperation<State> {
  /** Unique operation ID within this plugin (e.g. "insert", "delete") */
  id: string;

  /** Human-readable name */
  name: string;

  /** Short description shown in operation selector */
  description: string;

  /** Parameter schema for the UI to render input fields */
  params?: OperationParam[];

  /** The actual operation logic. Returns new state + intermediate steps. */
  execute(
    state: State,
    params: Record<string, unknown>,
    stepContext: StepGeneratorContext
  ): OperationResult<State>;
}

export interface OperationParam {
  name: string;
  label: string;
  type: 'number' | 'string' | 'boolean' | 'select';
  defaultValue?: unknown;
  options?: { label: string; value: unknown }[];  // for 'select'
  validation?: (value: unknown) => string | null;  // returns error msg or null
}

export interface OperationResult<State> {
  /** Final immutable state after operation */
  finalState: State;
  /** Ordered array of visualization steps */
  steps: StepEvent[];
  /** Optional return value (for search etc.) */
  returnValue?: unknown;
}

// ── Step Generator Context ────────────────────────────────────────────

/**
 * Each plugin operation receives a StepGeneratorContext to help it
 * produce properly-structured step events. The context provides:
 *   - `createStep()`  -- factory for building StepEvent objects
 *   - `pushStep()`    -- appends to internal collection (returned as steps[])
 *   - `getSnapshot()` -- shallow-deep clone of current state at this point
 */
export interface StepGeneratorContext {
  operationId: string;
  addStep(partial: Omit<StepEvent, 'id' | 'timestamp' | 'operationId' | 'pluginId'>): StepEvent;
  getSnapshot(): unknown;
}

// ── Visualization Config ──────────────────────────────────────────────

export interface VisualizationConfig<State> {
  /** Build a scene tree from current DS state */
  renderScene(state: State, highlights: Highlight[]): SceneNode;

  /** Return highlight annotations given the current step */
  getHighlights(step: StepEvent, state: State): Highlight[];

  /** Layout hints for the renderer */
  layout: LayoutConfig;
}

export interface LayoutConfig {
  /** Preferred renderer engine */
  engine: 'd3' | 'react-flow';
  /** Orientation for tree-like structures */
  orientation?: 'horizontal' | 'vertical';
  /** Spacing between nodes */
  nodeSpacing?: number;
  /** Maximum zoom range */
  zoom?: { min: number; max: number };
}

export interface Highlight {
  /** Scene node IDs to highlight */
  nodeIds: string[];
  /** Type of highlight */
  type: 'active' | 'compared' | 'swapped' | 'visited' | 'found' | 'inserted' | 'deleted';
  /** Optional CSS class override */
  className?: string;
}

// ── Pseudocode ────────────────────────────────────────────────────────

export interface PseudocodeBlock {
  /** Lines of pseudocode for this operation */
  lines: PseudocodeLine[];
  /** For each step index in the generated steps, map to a pseudocode line index */
  stepLineMapping: number[];  // stepIndex → lineIndex
}

export interface PseudocodeLine {
  text: string;
  indentLevel: number;  // 0, 1, 2, ...
  /** Optional: highlighting keywords */
  highlights?: { start: number; end: number }[];
}

// ── Complexity ────────────────────────────────────────────────────────

export interface ComplexityInfo {
  time: string;   // e.g. "O(n)"
  space: string;  // e.g. "O(1)"
  bestCase?: string;
  worstCase?: string;
  averageCase?: string;
  description?: string;
}

// ── Full Plugin Interface ────────────────────────────────────────────

export interface DataStructurePlugin<State = unknown, Config = Record<string, unknown>> {
  /** Unique plugin ID -- must match folder name */
  id: string;

  /** Display name */
  name: string;

  /** One-line description */
  description: string;

  /** Optional SVG path or icon name */
  icon?: string;

  /** Default configuration values */
  defaultConfig: Config;

  /** Create the initial (empty) state for this data structure */
  createInitialState(config?: Partial<Config>): State;

  /** All operations this plugin supports */
  operations: Record<string, DSOperation<State>>;

  /** Visualization configuration */
  visualization: VisualizationConfig<State>;

  /** Pseudocode blocks, keyed by operation ID */
  pseudocode: Record<string, PseudocodeBlock>;

  /** Complexity info, keyed by operation ID */
  complexities: Record<string, ComplexityInfo>;
}
```

### Plugin Registry (in `src/plugins/registry.ts`)

```typescript
export class PluginRegistry {
  private plugins = new Map<string, DataStructurePlugin<unknown>>();

  register<State>(plugin: DataStructurePlugin<State>): void {
    if (this.plugins.has(plugin.id)) {
      throw new Error(`Plugin "${plugin.id}" is already registered`);
    }
    this.plugins.set(plugin.id, plugin as DataStructurePlugin<unknown>);
  }

  get<State>(id: string): DataStructurePlugin<State> | undefined {
    return this.plugins.get(id) as DataStructurePlugin<State> | undefined;
  }

  getAll(): DataStructurePlugin<unknown>[] {
    return Array.from(this.plugins.values());
  }

  list(): { id: string; name: string; description: string; icon?: string }[] {
    return this.getAll().map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      icon: p.icon,
    }));
  }
}

/** Singleton exported for the app */
export const pluginRegistry = new PluginRegistry();
```

### Example: Array Plugin Skeleton (in `src/plugins/array/ArrayPlugin.ts`)

```typescript
import type { DataStructurePlugin } from '../types';

export interface ArrayState {
  elements: number[];
  length: number;
}

export const ArrayPlugin: DataStructurePlugin<ArrayState> = {
  id: 'array',
  name: 'Array',
  description: 'A contiguous block of memory storing elements at indexed positions.',
  icon: 'array-icon',

  defaultConfig: { initialSize: 0 },

  createInitialState(config = {}) {
    return { elements: [], length: 0 };
  },

  operations: {
    insert: { id: 'insert', name: 'Insert', description: 'Insert element at index', ... },
    delete: { id: 'delete', name: 'Delete', description: 'Delete element at index', ... },
    search: { id: 'search', name: 'Search', description: 'Find element by value', ... },
    update: { id: 'update', name: 'Update', description: 'Update element at index', ... },
    sort:   { id: 'sort', name: 'Sort', description: 'Sort array in place', ... },
  },

  visualization: { ... },
  pseudocode: { ... },
  complexities: { ... },
};
```

---

## 3. State Management with Zustand

### Store Structure (in `src/store/useStore.ts`)

```typescript
import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

// ── Store Type ────────────────────────────────────────────────────────

export interface AppStore {
  // ── Plugin Slice ────────────────────────────────────────────────
  pluginRegistry: PluginRegistry;
  activePluginId: string | null;
  activePlugin: DataStructurePlugin<unknown> | null;

  loadPlugin: (pluginId: string) => void;

  // ── Data Structure State ─────────────────────────────────────────
  currentState: unknown;
  initialState: unknown;

  resetState: () => void;

  // ── Steps / Playback ─────────────────────────────────────────────
  steps: StepEvent[];
  currentStepIndex: number;
  playbackStatus: 'idle' | 'playing' | 'paused' | 'completed';
  playbackSpeed: number; // 0.25, 0.5, 1, 2, 4

  executeOperation: (operationId: string, params: Record<string, unknown>) => void;
  stepForward: () => void;
  stepBackward: () => void;
  play: () => void;
  pause: () => void;
  restart: () => void;
  setSpeed: (speed: number) => void;
  jumpToStep: (index: number) => void;

  // ── Operation ────────────────────────────────────────────────────
  selectedOperationId: string | null;
  operationParams: Record<string, unknown>;
  operationResult: unknown;

  selectOperation: (operationId: string) => void;
  setOperationParam: (name: string, value: unknown) => void;

  // ── UI ───────────────────────────────────────────────────────────
  panels: {
    explanation: boolean;
    pseudocode: boolean;
    complexity: boolean;
    logs: boolean;
    sessions: boolean;
  };
  togglePanel: (panel: keyof AppStore['panels']) => void;

  // ── Session ──────────────────────────────────────────────────────
  sessionId: string | null;
  recordedOps: number;
  startSession: () => void;
  stopSession: () => void;

  // ── Derived / Computed (stores as functions) ─────────────────────
  getCurrentStep: () => StepEvent | null;
  getCurrentHighlights: () => Highlight[];
  getPseudocode: () => PseudocodeBlock | null;
  getComplexity: () => ComplexityInfo | null;
}

// ── Store Creation ────────────────────────────────────────────────────

export const useStore = create<AppStore>()(
  devtools(
    subscribeWithSelector(
      immer((set, get) => ({
        // ... initial values and actions defined below
      }))
    ),
    { name: 'ds-viz-store' }
  )
);
```

### Slice Definitions

**pluginSlice.ts** -- manages plugin registry and active plugin selection:

```typescript
// Inside the store creation:
loadPlugin: (pluginId) => {
  const registry = pluginRegistry; // imported singleton
  const plugin = registry.get(pluginId);
  if (!plugin) return;

  const initialState = plugin.createInitialState();

  set((state) => {
    state.pluginRegistry = registry;           // always same reference
    state.activePluginId = pluginId;
    state.activePlugin = plugin;
    state.currentState = initialState;
    state.initialState = initialState;
    state.steps = [];
    state.currentStepIndex = -1;
    state.playbackStatus = 'idle';
    state.selectedOperationId = null;
    state.operationResult = undefined;
  });
},
```

**visualizationSlice.ts** -- step execution and playback:

```typescript
executeOperation: (operationId, params) => {
  const { activePlugin, currentState } = get();
  if (!activePlugin) return;

  const operation = activePlugin.operations[operationId];
  if (!operation) return;

  const stepContext = createStepGeneratorContext(operationId);
  const result = operation.execute(currentState, params, stepContext);

  set((state) => {
    state.currentState = result.finalState;
    state.steps = result.steps;
    state.currentStepIndex = 0;
    state.playbackStatus = 'idle';
    state.operationResult = result.returnValue;
    state.recordedOps += 1;
  });
},

stepForward: () => {
  const { steps, currentStepIndex, playbackStatus } = get();
  if (currentStepIndex >= steps.length - 1) {
    if (playbackStatus === 'playing') {
      set({ playbackStatus: 'completed' });
    }
    return;
  }
  set({ currentStepIndex: currentStepIndex + 1 });
},

stepBackward: () => {
  const { currentStepIndex } = get();
  if (currentStepIndex <= 0) return;
  set({ currentStepIndex: currentStepIndex - 1 });
},

play: () => {
  const { steps, currentStepIndex } = get();
  if (currentStepIndex >= steps.length - 1) {
    // Restart from beginning
    set({ currentStepIndex: 0 });
  }
  set({ playbackStatus: 'playing' });
},

pause: () => set({ playbackStatus: 'paused' }),

restart: () => {
  const { initialState } = get();
  set({
    currentState: deepClone(initialState),
    currentStepIndex: -1,
    playbackStatus: 'idle',
    steps: [],
    operationResult: undefined,
  });
},

setSpeed: (speed) => set({ playbackSpeed: speed }),

jumpToStep: (index) => {
  set({ currentStepIndex: index, playbackStatus: 'paused' });
},
```

### Selectors (in `src/store/selectors/`)

```typescript
// visualizationSelectors.ts
export const selectCurrentStep = (s: AppStore) =>
  s.steps[s.currentStepIndex] ?? null;

export const selectCurrentHighlights = (s: AppStore) => {
  const step = s.steps[s.currentStepIndex];
  if (!step || !s.activePlugin) return [];
  return s.activePlugin.visualization.getHighlights(step, s.currentState);
};

export const selectIsPlaying = (s: AppStore) =>
  s.playbackStatus === 'playing';

export const selectCanStepForward = (s: AppStore) =>
  s.currentStepIndex < s.steps.length - 1;

export const selectCanStepBackward = (s: AppStore) =>
  s.currentStepIndex > 0;

export const selectProgress = (s: AppStore) =>
  s.steps.length > 0
    ? ((s.currentStepIndex + 1) / s.steps.length) * 100
    : 0;

export const selectCurrentSceneNode = (s: AppStore): SceneNode | null => {
  if (!s.activePlugin) return null;
  const highlights = selectCurrentHighlights(s);
  return s.activePlugin.visualization.renderScene(s.currentState, highlights);
};

// pluginSelectors.ts
export const selectActivePluginOperations = (s: AppStore) =>
  s.activePlugin ? Object.values(s.activePlugin.operations) : [];

export const selectActivePluginComplexities = (s: AppStore) =>
  s.activePlugin ? s.activePlugin.complexities : {};

export const selectPseudocodeForOperation = (operationId: string) =>
  (s: AppStore) =>
    s.activePlugin?.pseudocode[operationId] ?? null;
```

### Playback Hook (in `src/hooks/usePlayback.ts`)

```typescript
import { useEffect, useRef } from 'react';
import { useStore } from '../store';

export function usePlayback() {
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const playbackStatus = useStore((s) => s.playbackStatus);
  const playbackSpeed = useStore((s) => s.playbackSpeed);
  const stepForward = useStore((s) => s.stepForward);

  useEffect(() => {
    if (playbackStatus === 'playing') {
      const intervalMs = Math.max(50, Math.round(1000 / playbackSpeed));
      timerRef.current = setInterval(() => {
        stepForward();
      }, intervalMs);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [playbackStatus, playbackSpeed, stepForward]);
}
```

---

## 4. Step / Event System

### StepEvent Type (in `src/core/types.ts`)

```typescript
export interface StepEvent {
  /** Unique step identifier */
  id: string;
  /** Monotonic timestamp within operation execution */
  timestamp: number;
  /** Which plugin produced this step */
  pluginId: string;
  /** Which operation produced this step */
  operationId: string;

  /** The specific action that occurred */
  action: StepAction;

  /** Human-readable explanation */
  explanation: string;

  /** Pseudocode line index to highlight (0-based) */
  pseudocodeLine: number;

  /** Elements to highlight in the visualization */
  highlights: Highlight[];

  /** Snapshot of DS state after this step */
  snapshot: unknown;

  /** Animation transition (optional, for smooth rendering) */
  animation?: AnimationConfig;
}

export type StepAction =
  | { type: 'READ'; targets: string[]; values?: unknown[] }
  | { type: 'WRITE'; targets: string[]; oldValues?: unknown[]; newValues: unknown[] }
  | { type: 'COMPARE'; targets: string[]; a: unknown; b: unknown; result: number | boolean }
  | { type: 'SWAP'; targets: [string, string]; values: [unknown, unknown] }
  | { type: 'ALLOCATE'; target: string; value: unknown }
  | { type: 'FREE'; targets: string[] }
  | { type: 'MARK'; targets: string[]; marker: string }
  | { type: 'TRAVERSE'; path: string[] }
  | { type: 'RETURN'; value: unknown }
  | { type: 'CUSTOM'; name: string; data: Record<string, unknown> };

export interface AnimationConfig {
  /** CSS transition duration in ms */
  duration: number;
  /** Easing function */
  easing?: string;
  /** Delay before animation starts */
  delay?: number;
}
```

### StepGeneratorContext Implementation (in `src/core/StepGenerator.ts`)

```typescript
import { generateId } from '../utils/id';

export function createStepGeneratorContext(
  operationId: string,
  pluginId: string
): StepGeneratorContext {
  const steps: StepEvent[] = [];
  let stepCounter = 0;

  return {
    operationId,

    addStep(partial) {
      const step: StepEvent = {
        id: generateId(),
        timestamp: Date.now() + stepCounter,  // preserve ordering
        pluginId,
        operationId,
        ...partial,
      };
      steps.push(step);
      stepCounter++;
      return step;
    },

    getSnapshot() {
      // Structured clone for immutable snapshot
      return deepClone(currentState);
    },
  };
}
```

### How Steps are Generated -- Array "insert" Example

```typescript
// Inside plugins/array/operations.ts
execute(state: ArrayState, params: { index: number; value: number }, ctx: StepGeneratorContext) {
  const { index, value } = params;
  const elements = [...state.elements];    // immutable copy

  // Validate index
  if (index < 0 || index > elements.length) {
    throw new Error(`Index ${index} out of bounds`);
  }

  // Step 1: READ — look at elements that will shift
  ctx.addStep({
    action: { type: 'READ', targets: elements.map((_, i) => `element[${i}]`) },
    explanation: `Reading array elements that will shift right from index ${index}.`,
    pseudocodeLine: 0,
    highlights: [{ nodeIds: elements.map((_, i) => `element-${i}`), type: 'visited' }],
    snapshot: { elements: [...elements], length: elements.length },
  });

  // Step 2: Shift elements right (one at a time, right to left)
  for (let i = elements.length; i > index; i--) {
    elements[i] = elements[i - 1];
    ctx.addStep({
      action: {
        type: 'WRITE',
        targets: [`element[${i}]`],
        oldValues: [elements[i]],
        newValues: [elements[i - 1]],
      },
      explanation: `Shifting element from index ${i - 1} to index ${i}.`,
      pseudocodeLine: 1,
      highlights: [{ nodeIds: [`element-${i}`, `element-${i - 1}`], type: 'swapped' }],
      snapshot: { elements: [...elements], length: elements.length },
      animation: { duration: 300 },
    });
  }

  // Step 3: Insert new value
  elements[index] = value;
  ctx.addStep({
    action: { type: 'WRITE', targets: [`element[${index}]`], newValues: [value] },
    explanation: `Inserting value ${value} at index ${index}.`,
    pseudocodeLine: 2,
    highlights: [{ nodeIds: [`element-${index}`], type: 'inserted' }],
    snapshot: { elements: [...elements], length: elements.length },
    animation: { duration: 200 },
  });

  // Step 4: Update length
  const newLength = elements.length;
  ctx.addStep({
    action: { type: 'WRITE', targets: ['length'], oldValues: [state.length], newValues: [newLength] },
    explanation: `Array length updated from ${state.length} to ${newLength}.`,
    pseudocodeLine: 3,
    highlights: [],
    snapshot: { elements: [...elements], length: newLength },
  });

  return {
    finalState: { elements, length: newLength },
    steps: ctx.steps,   // <-- now contains all steps
  };
}
```

### Replay -- How Steps Drive State Reconstruction

During playback (step forward/backward), the system maintains the `initialState` and uses `currentStepIndex` to determine which snapshot to display. Two strategies exist:

**Option A -- Snapshot-based** (simpler, recommended):
Each `StepEvent` contains a `snapshot` field that is a complete copy of the DS state at that point. Step forward/backward just reads the snapshot from `steps[currentStepIndex]`. This is O(1) per step but memory-heavy.

**Option B -- Journal-based** (memory-efficient):
Store only the `action` and replay from `initialState`, applying actions sequentially up to `currentStepIndex`. Uses a `reduceState(action, state) => state` function. More complex but the correct approach for long sessions.

**Recommendation**: Use Option A for now (snapshot in each step). The `deepClone` utility uses `structuredClone()` which is well-supported. If memory becomes an issue, switch to Option B later.

---

## 5. Scene Graph Design

The scene graph is a **declarative, serializable rendering tree**. It decouples the plugin's layout logic from the actual rendering library (D3.js or React Flow).

### SceneNode Types (in `src/core/SceneGraph.ts`)

```typescript
// ── Primitive Scene Nodes ─────────────────────────────────────────────

export type SceneNode =
  | SceneGroup
  | SceneRect
  | SceneCircle
  | SceneEllipse
  | SceneText
  | SceneLine
  | SceneArrow
  | ScenePath
  | ScenePolygon
  | SceneCustom
  | SceneLabel
  | ScenePointer;

// ── Container ─────────────────────────────────────────────────────────

export interface SceneGroup {
  type: 'group';
  id: string;
  children: SceneNode[];
  transform?: {
    x: number;
    y: number;
    scale?: number;
    rotate?: number;
  };
  opacity?: number;
  className?: string;
  transition?: string;     // CSS transition string
  onClick?: string;        // Event name (handled by bridge)
  data?: Record<string, unknown>;  // Arbitrary plugin data
}

// ── Geometries ────────────────────────────────────────────────────────

export interface SceneRect {
  type: 'rect';
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rx?: number;   // corner radius
  ry?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
  className?: string;
  transition?: string;
  onClick?: string;
  data?: Record<string, unknown>;
}

export interface SceneCircle {
  type: 'circle';
  id: string;
  cx: number;
  cy: number;
  r: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
  className?: string;
  transition?: string;
  onClick?: string;
  data?: Record<string, unknown>;
}

export interface SceneText {
  type: 'text';
  id: string;
  x: number;
  y: number;
  text: string;
  fontSize?: number;
  fontFamily?: string;
  fill?: string;
  textAnchor?: 'start' | 'middle' | 'end';
  dominantBaseline?: 'auto' | 'middle' | 'hanging';
  className?: string;
  transition?: string;
}

export interface SceneLine {
  type: 'line';
  id: string;
  x1: number; y1: number;
  x2: number; y2: number;
  stroke: string;
  strokeWidth: number;
  className?: string;
  transition?: string;
}

export interface SceneArrow {
  type: 'arrow';
  id: string;
  x1: number; y1: number;
  x2: number; y2: number;
  stroke?: string;
  strokeWidth?: number;
  markerEnd?: string;  // arrowhead marker ID
  className?: string;
  transition?: string;
}

export interface ScenePath {
  type: 'path';
  id: string;
  d: string;           // SVG path data
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  className?: string;
  transition?: string;
}

export interface ScenePolygon {
  type: 'polygon';
  id: string;
  points: { x: number; y: number }[];
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
  className?: string;
}

// ── Label (text inside a rect) ────────────────────────────────────────

export interface SceneLabel {
  type: 'label';
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  fontSize?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  rx?: number;
  className?: string;
  transition?: string;
}

// ── Pointer (arrow pointing to a node, e.g. "head" or "tail") ────────

export interface ScenePointer {
  type: 'pointer';
  id: string;
  label: string;       // e.g. "head", "tail", "current"
  targetNodeId: string;
  offsetX?: number;
  offsetY?: number;
  color?: string;
}

// ── Custom (for React Flow graph nodes) ───────────────────────────────

export interface SceneCustom {
  type: 'custom';
  id: string;
  /** Component name for React Flow (e.g. "GraphNode", "GraphEdge") */
  component: string;
  props: Record<string, unknown>;
  position: { x: number; y: number };
  className?: string;
}
```

### Scene Graph Builder Helpers

```typescript
// Helper functions to build scene nodes without repeating boilerplate
// Each returns a partial or factory function.

export function rect(id: string, x: number, y: number, w: number, h: number, opts?: Partial<SceneRect>): SceneRect {
  return { type: 'rect', id, x, y, width: w, height: h, fill: '#e2e8f0', stroke: '#94a3b8', strokeWidth: 1, ...opts };
}

export function circle(id: string, cx: number, cy: number, r: number, opts?: Partial<SceneCircle>): SceneCircle {
  return { type: 'circle', id, cx, cy, r, fill: '#e2e8f0', stroke: '#64748b', strokeWidth: 2, ...opts };
}

export function text(id: string, x: number, y: number, t: string, opts?: Partial<SceneText>): SceneText {
  return { type: 'text', id, x, y, text: t, fontSize: 14, fill: '#1e293b', textAnchor: 'middle', ...opts };
}

export function label(id: string, x: number, y: number, w: number, h: number, t: string, opts?: Partial<SceneLabel>): SceneLabel {
  return { type: 'label', id, x, y, width: w, height: h, text: t, fontSize: 14, fill: '#f8fafc', rx: 4, ...opts };
}

export function arrow(id: string, x1: number, y1: number, x2: number, y2: number, opts?: Partial<SceneArrow>): SceneArrow {
  return { type: 'arrow', id, x1, y1, x2, y2, stroke: '#64748b', strokeWidth: 2, ...opts };
}

export function group(id: string, children: SceneNode[], opts?: Partial<SceneGroup>): SceneGroup {
  return { type: 'group', id, children, ...opts };
}
```

### How a Plugin Builds a Scene Graph -- Array Example

```typescript
// In plugins/array/visualization.ts
renderScene(state: ArrayState, highlights: Highlight[]): SceneNode {
  const { elements } = state;
  const nodeWidth = 60;
  const nodeHeight = 40;
  const gap = 10;
  const startX = 20;
  const startY = 20;

  // Collect all highlighted node IDs for quick lookup
  const highlightedIds = new Set(
    highlights.flatMap((h) => h.nodeIds)
  );

  const children: SceneNode[] = [];

  // Draw index labels above each element
  elements.forEach((_, i) => {
    children.push(
      text(
        `index-${i}`,
        startX + i * (nodeWidth + gap) + nodeWidth / 2,
        startY - 8,
        String(i),
        { fontSize: 12, fill: '#64748b' }
      )
    );
  });

  // Draw element boxes
  elements.forEach((value, i) => {
    const nodeId = `element-${i}`;
    const isHighlighted = highlightedIds.has(nodeId);

    children.push(
      rect(
        nodeId,
        startX + i * (nodeWidth + gap),
        startY,
        nodeWidth,
        nodeHeight,
        {
          fill: isHighlighted ? getHighlightFill(highlights, nodeId) : '#e2e8f0',
          stroke: isHighlighted ? '#3b82f6' : '#94a3b8',
          strokeWidth: isHighlighted ? 3 : 1,
          rx: 4,
          transition: 'all 0.3s ease',
        }
      ),
      text(
        `value-${i}`,
        startX + i * (nodeWidth + gap) + nodeWidth / 2,
        startY + nodeHeight / 2 + 5,
        String(value),
        { fontSize: 16, fontWeight: 600 }
      )
    );
  });

  return group('array-group', children);
}

function getHighlightFill(highlights: Highlight[], nodeId: string): string {
  const type = highlights.find((h) => h.nodeIds.includes(nodeId))?.type;
  switch (type) {
    case 'active':    return '#dbeafe';  // blue-100
    case 'compared':  return '#fef3c7';  // amber-100
    case 'swapped':   return '#fee2e2';  // red-100
    case 'visited':   return '#f3f4f6';  // gray-100
    case 'found':     return '#d1fae5';  // green-100
    case 'inserted':  return '#dbeafe';  // blue-100
    case 'deleted':   return '#fee2e2';  // red-100
    default:          return '#e2e8f0';  // slate-200
  }
}
```

---

## 6. Telemetry Service

### Service Interface (in `src/services/telemetry/TelemetryService.ts`)

```typescript
export interface TelemetryEvent {
  type: TelemetryEventType;
  timestamp: number;
  pluginId?: string;
  operationId?: string;
  data: Record<string, unknown>;
  /** Browser performance metrics (optional, populated by service) */
  performance?: {
    duration?: number;   // ms
    memory?: number;     // heap used in bytes (if available)
  };
}

export type TelemetryEventType =
  | 'app_init'
  | 'plugin_loaded'
  | 'operation_executed'
  | 'step_navigated'
  | 'playback_started'
  | 'playback_paused'
  | 'playback_completed'
  | 'playback_speed_changed'
  | 'panel_toggled'
  | 'session_saved'
  | 'session_loaded'
  | 'session_exported'
  | 'error'
  | 'performance';

/**
 * ITelemetryService -- interface so backend can be swapped in later.
 * The browser implementation uses a non-blocking write buffer.
 */
export interface ITelemetryService {
  /** Enqueue an event for logging (never throws, never blocks rendering) */
  log(event: TelemetryEvent): void;

  /** Flush buffered events to storage */
  flush(): Promise<void>;

  /** Return all stored events */
  getEvents(): TelemetryEvent[];

  /** Export all events as a JSON string */
  exportAsJson(): string;

  /** Clear all stored events */
  clear(): Promise<void>;

  /** Register a flush callback (called after each flush cycle) */
  onFlush(callback: (events: TelemetryEvent[]) => void): void;
}
```

### Non-Blocking Implementation (in `src/services/telemetry/TelemetryBuffer.ts`)

```typescript
export class TelemetryService implements ITelemetryService {
  private buffer: TelemetryEvent[] = [];
  private isFlushing = false;
  private persistence: PersistenceService;
  private flushCallbacks: ((events: TelemetryEvent[]) => void)[] = [];

  constructor(persistence: PersistenceService) {
    this.persistence = persistence;
    // Use requestIdleCallback for non-blocking periodic flush
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      this.scheduleFlush();
    }
  }

  log(event: TelemetryEvent): void {
    this.buffer.push(event);
    // If buffer is large enough, schedule immediate flush
    if (this.buffer.length >= 50) {
      // schedule microtask to flush (non-blocking)
      queueMicrotask(() => this.flush());
    }
  }

  async flush(): Promise<void> {
    if (this.isFlushing || this.buffer.length === 0) return;
    this.isFlushing = true;

    try {
      // Read existing events
      const existing = await this.persistence.get<TelemetryEvent[]>('telemetry_events') ?? [];
      const merged = [...existing, ...this.buffer];

      // Cap at 10,000 events (prevent unbounded growth)
      const trimmed = merged.length > 10000
        ? merged.slice(merged.length - 10000)
        : merged;

      await this.persistence.set('telemetry_events', trimmed);
      this.buffer = [];

      // Notify callbacks
      this.flushCallbacks.forEach((cb) => cb(trimmed));
    } catch (err) {
      // Never throw -- telemetry must not crash the app
      console.warn('[Telemetry] Flush failed:', err);
    } finally {
      this.isFlushing = false;
    }
  }

  getEvents(): TelemetryEvent[] {
    // Return events that are persisted (may miss recently buffered ones)
    // For full results, call flush() first then getEvents().
    return this.buffer; // simplified; real version reads from persistence
  }

  exportAsJson(): string {
    // Flush then return all events as JSON
    // (In practice, flush async then read from persistence)
    return JSON.stringify(this.buffer, null, 2);
  }

  async clear(): Promise<void> {
    this.buffer = [];
    await this.persistence.set('telemetry_events', []);
  }

  onFlush(callback: (events: TelemetryEvent[]) => void): void {
    this.flushCallbacks.push(callback);
  }

  private scheduleFlush(): void {
    requestIdleCallback(
      () => {
        this.flush();
        this.scheduleFlush();  // reschedule
      },
      { timeout: 5000 } // max delay 5s
    );
  }
}
```

### Zustand Telemetry Middleware (in `src/store/middleware/telemetryMiddleware.ts`)

```typescript
import type { StoreApi } from 'zustand';
import { telemetryService } from '../../services/service-provider';

/**
 * Zustand middleware that automatically dispatches telemetry events
 * for state mutations. The `telemetryMeta` property on the partial
 * state can include event metadata; if absent, no event is fired.
 */
export const telemetryMiddleware =
  <T extends object>(
    config: (set: StoreApi<T>['setState'], get: StoreApi<T>['getState'], api: StoreApi<T>) => T
  ): ((set: StoreApi<T>['setState'], get: StoreApi<T>['getState'], api: StoreApi<T>) => T) =>
  (set, get, api) =>
    config(
      (partial, replace) => {
        set(partial, replace);
        // The `partial` might have a __telemetry property attached by actions
        const telemetryPartial = partial as Partial<{ __telemetry: TelemetryEvent }>;
        if (telemetryPartial.__telemetry) {
          telemetryService.log(telemetryPartial.__telemetry);
        }
      },
      get,
      api
    );
```

---

## 7. Persistence Layer

### Service Interface (in `src/services/persistence/PersistenceService.ts`)

```typescript
/**
 * Generic key-value persistence service.
 * Interface-first design -- backends (API, etc.) can be swapped in later.
 */
export interface PersistenceService {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
  keys(): Promise<string[]>;
}

/**
 * Session-specific persistence, built on top of PersistenceService.
 */
export interface SessionPersistenceService {
  saveSession(session: Session): Promise<string>;
  loadSession(id: string): Promise<Session | null>;
  listSessions(): Promise<SessionSummary[]>;
  deleteSession(id: string): Promise<void>;
  exportSessionAsJson(id: string): Promise<string>;
}

export interface Session {
  id: string;
  name: string;
  pluginId: string;
  operationId: string;
  params: Record<string, unknown>;
  steps: StepEvent[];
  createdAt: number;
  updatedAt: number;
  duration: number;       // playback duration at 1x speed (ms)
}

export interface SessionSummary {
  id: string;
  name: string;
  pluginId: string;
  operationId?: string;
  createdAt: number;
  stepCount: number;
}
```

### LocalStorage Implementation (in `src/services/persistence/LocalStorageService.ts`)

```typescript
export class LocalStorageService implements PersistenceService {
  private readonly prefix: string;

  constructor(prefix = 'ds_viz_') {
    this.prefix = prefix;
  }

  private prefixed(key: string): string {
    return `${this.prefix}${key}`;
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const raw = localStorage.getItem(this.prefixed(key));
      if (raw === null) return null;
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    try {
      localStorage.setItem(this.prefixed(key), JSON.stringify(value));
    } catch (err) {
      // Might fail if storage is full -- let caller handle
      throw err;
    }
  }

  async delete(key: string): Promise<void> {
    localStorage.removeItem(this.prefixed(key));
  }

  async clear(): Promise<void> {
    const keys = await this.keys();
    keys.forEach((k) => localStorage.removeItem(k));
  }

  async keys(): Promise<string[]> {
    const result: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.prefix)) {
        result.push(key.slice(this.prefix.length));
      }
    }
    return result;
  }
}
```

### IndexedDB Implementation (in `src/services/persistence/IndexedDBService.ts`)

```typescript
export class IndexedDBService implements PersistenceService {
  private dbName: string;
  private storeName: string;
  private db: IDBDatabase | null = null;

  constructor(dbName = 'ds_viz_db', storeName = 'kv_store') {
    this.dbName = dbName;
    this.storeName = storeName;
  }

  private async getDb(): Promise<IDBDatabase> {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName);
        }
      };
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async get<T>(key: string): Promise<T | null> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.storeName, 'readonly');
      const store = tx.objectStore(this.storeName);
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result ?? null);
      request.onerror = () => reject(request.error);
    });
  }

  async set<T>(key: string, value: T): Promise<void> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.storeName, 'readwrite');
      const store = tx.objectStore(this.storeName);
      const request = store.put(value, key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async delete(key: string): Promise<void> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.storeName, 'readwrite');
      const store = tx.objectStore(this.storeName);
      store.delete(key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async clear(): Promise<void> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.storeName, 'readwrite');
      const store = tx.objectStore(this.storeName);
      store.clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async keys(): Promise<string[]> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.storeName, 'readonly');
      const store = tx.objectStore(this.storeName);
      const request = store.getAllKeys();
      request.onsuccess = () => resolve(request.result as string[]);
      request.onerror = () => reject(request.error);
    });
  }
}
```

### Session Service (in `src/services/persistence/SessionService.ts`)

```typescript
export class SessionService implements SessionPersistenceService {
  private persistence: PersistenceService;
  private readonly SESSION_PREFIX = 'session_';
  private readonly INDEX_KEY = 'session_index';

  constructor(persistence: PersistenceService) {
    this.persistence = persistence;
  }

  async saveSession(session: Session): Promise<string> {
    await this.persistence.set(`${this.SESSION_PREFIX}${session.id}`, session);

    // Update index
    const index = await this.persistence.get<SessionSummary[]>(this.INDEX_KEY) ?? [];
    const existingIdx = index.findIndex((s) => s.id === session.id);
    const summary: SessionSummary = {
      id: session.id,
      name: session.name,
      pluginId: session.pluginId,
      operationId: session.operationId,
      createdAt: session.createdAt,
      stepCount: session.steps.length,
    };
    if (existingIdx >= 0) {
      index[existingIdx] = summary;
    } else {
      index.push(summary);
    }
    await this.persistence.set(this.INDEX_KEY, index);
    return session.id;
  }

  async loadSession(id: string): Promise<Session | null> {
    return this.persistence.get<Session>(`${this.SESSION_PREFIX}${id}`);
  }

  async listSessions(): Promise<SessionSummary[]> {
    return this.persistence.get<SessionSummary[]>(this.INDEX_KEY) ?? [];
  }

  async deleteSession(id: string): Promise<void> {
    await this.persistence.delete(`${this.SESSION_PREFIX}${id}`);
    const index = await this.listSessions();
    await this.persistence.set(
      this.INDEX_KEY,
      index.filter((s) => s.id !== id)
    );
  }

  async exportSessionAsJson(id: string): Promise<string> {
    const session = await this.loadSession(id);
    if (!session) throw new Error(`Session ${id} not found`);
    return JSON.stringify(session, null, 2);
  }
}
```

### Service Provider (in `src/services/service-provider.ts`)

```typescript
import { IndexedDBService } from './persistence/IndexedDBService';
import { LocalStorageService } from './persistence/LocalStorageService';
import { SessionService } from './persistence/SessionService';
import { TelemetryService } from './telemetry/TelemetryBuffer';

/**
 * Central service locator. Makes it easy to swap implementations
 * (e.g., LocalStorage -> API service) in one place.
 */
export function createServices() {
  // For large data: IndexedDB. For small metadata: LocalStorage.
  const persistence: PersistenceService = new IndexedDBService();
  const userPrefs: PersistenceService = new LocalStorageService('ds_viz_prefs_');
  const sessionService = new SessionService(persistence);
  const telemetryService = new TelemetryService(persistence);

  return {
    persistence,
    userPrefs,
    sessionService,
    telemetryService,
  };
}

// Exported singleton -- initialized at app startup
export const services = createServices();
export const telemetryService = services.telemetryService;
export const sessionService = services.sessionService;
```

---

## 8. Component Tree

```
<App>                                    // Initializes plugins, services, keyboard shortcuts
  <AppLayout>
    ├── <Sidebar>                        // Fixed left panel
    │   ├── <DataStructureList>          // Scrollable list of plugin cards
    │   │   ├── <DSItem />               // One per plugin (icon + name + badge)
    │   │   └── ...
    │   └── <OperationPanel>             // Shown when a DS is selected
    │       ├── <Select>                 // Operation dropdown
    │       ├── <ParamInputs>            // Dynamic fields from operation.params
    │       │   ├── <NumberInput />
    │       │   └── <TextInput />
    │       └── <Button>                 // "Execute" button
    │
    ├── <MainContent>                    // Flex-grow center
    │   ├── <VisualizationPane>
    │   │   ├── <VisualizationCanvas />  // D3.js SVG (for array, list, stack, queue, BST, heap)
    │   │   └── <GraphCanvas />          // React Flow (for graph, shown conditionally)
    │   └── <PlaybackControls>
    │       ├── <Button> restart
    │       ├── <Button> step-back
    │       ├── <Button> play/pause
    │       ├── <Button> step-forward
    │       ├── <SpeedControl />         // Slider: 0.25x to 4x
    │       └── <StepProgress />         // Track bar with step count
    │
    └── <SidePanel>                      // Right panel with tabs
        ├── <Tabs>
        │   ├── tab "Explanation"
        │   ├── tab "Pseudocode"
        │   ├── tab "Complexity"
        │   └── tab "Logs"
        └── [Active tab content]:
            ├── <ExplanationPanel>       // Current step description text
            ├── <PseudocodePanel>        // Lines with highlight on current line
            │   └── <PseudocodeLine />   // Individual line with indent
            ├── <ComplexityPanel>        // Time/space complexity table
            └── <LogPanel>              // Streaming log entries

  <!-- Optional persistent bottom drawer -->
  <SessionPanel>                         // Save/Load/Export session
    ├── <Button> "Save Session"
    ├── <Button> "Export as JSON"
    └── <SessionList />                  // List of saved sessions
```

### Key Component Responsibilities

| Component | Props / Store Dependencies | Behavior |
|---|---|---|
| `App` | none | Initializes plugins into registry, creates services, sets up keyboard shortcuts. Renders `<AppLayout>`. |
| `AppLayout` | none | CSS Grid layout: `grid-cols-[250px_1fr_350px]`. Handles responsive collapse. |
| `DataStructureList` | uses `pluginRegistry.list()` | Renders one `<DSItem>` per plugin. Clicking calls `store.loadPlugin(id)`. |
| `OperationPanel` | `activePlugin`, `selectedOperationId` | Dropdown loads from `activePlugin.operations`. When operation selected, renders param inputs per `operation.params`. Execute button calls `store.executeOperation(opId, params)`. |
| `VisualizationCanvas` | `selectCurrentSceneNode` (from store) | Uses `useD3Renderer` hook. On scene node change, computes enter/update/exit D3 joins. Embeds SVG with zoom/pan. |
| `GraphCanvas` | `selectCurrentSceneNode`, `activePlugin` | Uses `useFlowRenderer` hook. Renders React Flow `ReactFlow` component with custom nodes/edges. Used only when `layout.engine === 'react-flow'`. |
| `PlaybackControls` | `playbackStatus`, `currentStepIndex`, `steps.length`, `playbackSpeed` | Dispatches play/pause/step/restart actions. Disables buttons at boundaries. |
| `ExplanationPanel` | `selectCurrentStep` | Renders `step.explanation` text. Shows action type and affected targets. |
| `PseudocodePanel` | `selectPseudocodeForOperation`, `currentStepIndex` | Renders pseudocode lines. Applies highlight class to line at `steps[currentStepIndex].pseudocodeLine`. |
| `ComplexityPanel` | `selectActivePluginComplexities`, `selectedOperationId` | Shows O-notation for current operation in a styled card. |
| `LogPanel` | none directly; reads from `telemetryService` | Shows recent log entries in a scrollable list. Auto-scrolls on new entries. |
| `SessionPanel` | none directly; uses `sessionService` | Save: captures current steps/state; Load: restores session; Export: triggers JSON download. |

---

## 9. Data Flow

### Flow 1: User loads a data structure

```
User clicks "Binary Search Tree" in sidebar
  │
  ▼
DataStructureList.onClick("bst")
  │ dispatch
  ▼
store.loadPlugin("bst")
  │
  ├── pluginRegistry.get("bst")  →  BSTPlugin
  ├── BSTPlugin.createInitialState()  →  { root: null, size: 0 }
  │
  ├── set state:
  │     activePluginId = "bst"
  │     activePlugin = BSTPlugin
  │     currentState = { root: null, size: 0 }
  │     initialState = { root: null, size: 0 }
  │     steps = []
  │     currentStepIndex = -1
  │     playbackStatus = "idle"
  │     selectedOperationId = null
  │
  ├── telemetryService.log({ type: "plugin_loaded", pluginId: "bst" })
  │
  ▼
React re-renders:
  ├── OperationPanel: shows BST operations (insert, delete, search, traverse)
  ├── VisualizationCanvas: calls renderScene({ root: null }, []) → empty canvas
  ├── ExplanationPanel: shows "Select an operation to begin"
  ├── PseudocodePanel: hidden (no operation selected)
  └── ComplexityPanel: hidden
```

### Flow 2: User executes an operation

```
User selects "Insert" operation, enters value=42, clicks "Execute"
  │
  ▼
store.executeOperation("insert", { value: 42 })
  │
  ├── activePlugin = BSTPlugin
  ├── operation = BSTPlugin.operations["insert"]
  ├── context = createStepGeneratorContext("insert", "bst")
  │
  ▼
  operation.execute(currentState, { value: 42 }, context)
  │
  ├── Step 1: Compare 42 with root (null) → allocate root
  │   └── ctx.addStep({ action: {type:COMPARE, targets:["root"]}, pseudocodeLine:0,
  │                    explanation:"Checking if root is null...", highlights:[...],
  │                    snapshot: {...} })
  │
  ├── Step 2: Create new node with value 42
  │   └── ctx.addStep({ action: {type:ALLOCATE, target:"node-1", value:42}, ... })
  │
  ├── Step 3: Assign root = new node
  │   └── ctx.addStep({ action: {type:WRITE, targets:["root"], newValues:["node-1"]}, ... })
  │
  ├── returns { finalState: { root: { value:42, left:null, right:null }, size:1 },
  │              steps: [step1, step2, step3] }
  │
  ▼
  store set:
  │   currentState = { root: { value:42, left:null, right:null }, size:1 }
  │   steps = [step1, step2, step3]
  │   currentStepIndex = 0
  │   playbackStatus = "idle"
  │   selectedOperationId = "insert"
  │
  ├── telemetryService.log({ type: "operation_executed",
  │                          pluginId: "bst", operationId: "insert",
  │                          data: { stepCount: 3, param: 42 } })
  │
  ▼
React re-renders (showing step 0):
  │
  ├── VisualizationCanvas
  │   │
  │   ├── useSelector: selectCurrentSceneNode(s)
  │   │   = activePlugin.visualization.renderScene(currentState, currentHighlights)
  │   │   = SceneGroup with tree layout, root node highlighted blue
  │   │
  │   └── useD3Renderer(sceneNode) hook:
  │       ├── D3Renderer.render(sceneNode)
  │       │   ├── traverse SceneNode tree
  │       │   ├── for each SceneNode: create/update/remove SVG elements
  │       │   ├── apply transitions from step.animation
  │       │   └── apply highlight CSS classes
  │
  ├── ExplanationPanel: shows "Checking if root is null..."
  ├── PseudocodePanel: highlights line 0 of "insert" pseudocode
  └── ComplexityPanel: shows O(log n) average, O(n) worst case
```

### Flow 3: User steps through the visualization

```
User clicks "Step Forward" (→)
  │
  ▼
store.stepForward()
  │
  ├── currentStepIndex increments: 0 → 1
  │
  ├── telemetryService.log({ type: "step_navigated",
  │     data: { direction: "forward", fromIndex: 0, toIndex: 1 } })
  │
  ▼
React re-renders:
  ├── VisualizationCanvas: scene graph updates → D3 transition animates allocation of new node
  ├── ExplanationPanel: shows "Creating new node with value 42..."
  ├── PseudocodePanel: line highlight moves from line 0 to line 1
  └── PlaybackControls: StepProgress bar advances from 33% to 66%
```

### Flow 4: Playback in motion

```
User clicks "Play" (▶)
  │
  ▼
store.play()
  │
  ├── playbackStatus = "playing"
  ├── telemetryService.log({ type: "playback_started", data: { speed: 1 } })
  │
  ▼
usePlayback() hook (via useEffect):
  ├── interval = setInterval(stepForward, 1000 / speed = 1000ms)
  │
  ├── [after 1000ms] stepForward() → index 0→1, re-render
  ├── [after 2000ms] stepForward() → index 1→2, re-render
  ├── [after 3000ms] stepForward() → index 2→3 → completed
  │
  ├── [at last step] playbackStatus = "completed"
  │   telemetryService.log({ type: "playback_completed", ... })
  │
  └── setInterval cleared by cleanup function
```

### Flow 5: Step backward (state reconstruction)

```
User clicks "Step Backward" (←)
  │
  ▼
store.stepBackward()
  │
  ├── currentStepIndex decrements: 1 → 0
  │
  ▼
React re-renders:
  └── VisualizationCanvas: uses snapshot from steps[0] for rendering
      (No need to replay from initialState -- snapshot is embedded in step)
```

### Flow 6: Session save and export

```
User clicks "Save Session"
  │
  ▼
SessionPanel.onSave()
  │
  ├── Builds Session object from store:
  │     { id, name, pluginId: snapshot.activePluginId, operationId, params,
  │       steps: snapshot.steps, createdAt, updatedAt, duration }
  │
  ├── sessionService.saveSession(session)
  │   ├── IndexedDB persistence.set("session_{id}", session)
  │   └── IndexedDB persistence.set("session_index", updatedIndex[])
  │
  ├── telemetryService.log({ type: "session_saved", data: { sessionId: id } })
  │
  └── UI shows success toast

User clicks "Export as JSON"
  │
  ▼
  ├── sessionService.exportSessionAsJson(id) → JSON string
  ├── Creates Blob, triggers download via <a download> element
  └── telemetryService.log({ type: "session_exported", ... })
```

---

## 10. Build Order

Each phase produces a testable artifact. No phase depends on a later phase.

### Phase 1: Project Scaffolding (Day 1)

**Goal**: Empty Vite project running in browser with Tailwind.

```
Files to create:
  ├── package.json
  ├── vite.config.ts
  ├── tsconfig.json
  ├── tailwind.config.ts
  ├── postcss.config.js
  ├── index.html
  └── src/
      ├── main.tsx          // ReactDOM.createRoot, renders <h1>Hello</h1>
      ├── App.tsx           // Empty component
      └── index.css         // @tailwind directives
```

**Test**: `npm run dev` -- see "Hello" on white background.
**Commands**: `npm create vite@latest`, `npm install react react-dom typescript @types/react @types/react-dom`, `npm install -D tailwindcss @tailwindcss/vite postcss autoprefixer`, `npm install zustand d3 @types/d3 reactflow immer`

### Phase 2: Core Types + Utils (Day 1-2)

**Goal**: All TypeScript types are defined. Nothing compiles yet but types are available.

```
Files:
  ├── src/core/types.ts         // StepEvent, StepAction, Highlight, AnimationConfig
  ├── src/core/SceneGraph.ts    // SceneNode union type + all scene node interfaces
  ├── src/plugins/types.ts      // DSOperation, OperationResult, VisualizationConfig,
  │                             //   PseudocodeBlock, ComplexityInfo, DataStructurePlugin
  ├── src/services/telemetry/TelemetryService.ts  // ITelemetryService interface
  ├── src/services/persistence/PersistenceService.ts  // Interfaces
  ├── src/utils/id.ts           // generateId() using crypto.randomUUID
  └── src/utils/deepClone.ts    // structuredClone wrapper
```

**Test**: `npx tsc --noEmit` -- no errors.

### Phase 3: Plugin Registry + One Plugin (Day 2-3)

**Goal**: Plugin registry works. Array plugin is fully implemented (state + operations + visualization layout + pseudocode + complexity). Tested in isolation.

```
Files:
  ├── src/plugins/registry.ts
  ├── src/plugins/array/ArrayPlugin.ts
  ├── src/plugins/array/ArrayState.ts
  ├── src/plugins/array/operations.ts   // insert, delete, search, update, sort, reverse, slice
  ├── src/plugins/array/visualization.ts
  ├── src/plugins/array/pseudocode.ts
  └── src/plugins/array/complexities.ts
```

**Test**: Write a small test script (or Jest test) that calls `registry.register(ArrayPlugin)`, then `registry.get('array')`, creates initial state, runs `insert` operation, verifies 4+ steps returned, verifies final state is correct.

### Phase 4: Zustand Store (Day 3-4)

**Goal**: Full store wired up. Can `loadPlugin`, `executeOperation`, `stepForward/Backward`, play/pause/restart through Zustand devtools.

```
Files:
  ├── src/store/useStore.ts
  ├── src/store/slices/pluginSlice.ts
  ├── src/store/slices/visualizationSlice.ts
  ├── src/store/slices/operationSlice.ts
  ├── src/store/slices/uiSlice.ts
  ├── src/store/slices/sessionSlice.ts
  ├── src/store/selectors/pluginSelectors.ts
  ├── src/store/selectors/visualizationSelectors.ts
  ├── src/store/selectors/operationSelectors.ts
  ├── src/store/selectors/uiSelectors.ts
  └── src/store/middleware/telemetryMiddleware.ts
```

**Test**: Mount a debug component that displays `JSON.stringify(useStore.getState(), null, 2)`. Click a button to load Array plugin. Click another to execute "insert(0, 42)". Verify step count, currentStepIndex, currentState update in the debug output. Test step forward/backward updates currentStepIndex.

### Phase 5: Scene Graph Renderer (D3.js) (Day 4-5)

**Goal**: D3.js renderer reads a SceneNode tree and renders it to an SVG. Animation transitions work.

```
Files:
  ├── src/core/renderer/D3Renderer.ts
  ├── src/core/renderer/CanvasController.ts
  ├── src/hooks/useD3Renderer.ts
  └── src/components/visualization/VisualizationCanvas.tsx
```

**Test**: Hardcode a SceneNode tree (rectangles with text, arrows) and render it to the browser. Verify elements appear, transitions animate, class-based styling applies. Test zoom/pan.

### Phase 6: Visualization Pane + Playback Controls (Day 5-6)

**Goal**: The core UI loop works -- select DS, choose operation, execute, see visualization, play/pause/step.

```
Files:
  ├── src/components/layout/AppLayout.tsx
  ├── src/components/layout/Sidebar.tsx
  ├── src/components/layout/MainContent.tsx
  ├── src/components/layout/SidePanel.tsx
  ├── src/components/sidebar/DataStructureList.tsx
  ├── src/components/sidebar/DSItem.tsx
  ├── src/components/sidebar/OperationPanel.tsx
  ├── src/components/visualization/VisualizationPane.tsx
  ├── src/components/controls/PlaybackControls.tsx
  ├── src/components/controls/SpeedControl.tsx
  ├── src/components/controls/StepProgress.tsx
  ├── src/hooks/usePlayback.ts
  └── src/components/common/Button.tsx, Select.tsx, Slider.tsx, Badge.tsx
```

**Test**: Full manual test: load Array, insert values, step through visualization, hit play, see steps auto-advance. Empty state (no DS loaded) shows placeholder message.

### Phase 7: Explanation + Pseudocode + Complexity Panels (Day 6-7)

**Goal**: Right-side panels show meaningful content that syncs with current step.

```
Files:
  ├── src/components/panels/ExplanationPanel.tsx
  ├── src/components/panels/PseudocodePanel.tsx
  ├── src/components/panels/PseudocodeLine.tsx
  ├── src/components/panels/ComplexityPanel.tsx
  └── src/components/common/Tabs.tsx
```

**Test**: Execute Array "search" for a value. Right panel shows operation pseudocode. Step through: pseudocode line highlight moves in sync. Explanation text updates. Complexity card shows O(n).

### Phase 8: Remaining Linear Plugins (Day 7-9)

**Goal**: Linked List, Stack, Queue plugins fully functional with all operations, visualization, pseudocode, complexity.

```
Files:
  ├── src/plugins/linked-list/*     // insert, delete, search, reverse, traverse
  ├── src/plugins/stack/*            // push, pop, peek, isEmpty, size
  └── src/plugins/queue/*            // enqueue, dequeue, peek, isEmpty, size
```

**Test**: For each plugin: register, load, execute each operation, verify steps make visual sense, verify pseudocode highlights match. Stack and Queue can leverage the Array renderer (vertical layout). Linked List uses arrow SceneNodes for pointers.

### Phase 9: Tree + Heap Plugins (Day 9-11)

**Goal**: BST and Heap plugins working with tree visualization. BST layout handles parent-child positioning. Heap uses array-based tree layout.

```
Files:
  ├── src/plugins/bst/*              // insert, delete, search, findMin, findMax, traverse (in/pre/post/level)
  └── src/plugins/heap/*             // insert, extractMin/Max, heapify, peek
```

**Test**: Insert nodes into BST, step through comparisons. Verify left/right child positioning in tree. Extract from heap, verify bubble-down steps.

### Phase 10: Hash Table Plugin (Day 11-12)

**Goal**: Hash table with collision handling visualization. Shows bucket arrays with linked-list collision chains.

```
Files:
  └── src/plugins/hash-table/*       // put, get, delete, resize, contains
```

**Test**: Insert keys with same hash to force collision. Visualization shows bucket and chain. Verify resize triggers re-hashing steps.

### Phase 11: Graph Plugin + React Flow (Day 12-14)

**Goal**: Graph plugin using React Flow for rendering. BFS/DFS traversal steps shown.

```
Files:
  ├── src/plugins/graph/*            // addVertex, addEdge, removeVertex, removeEdge,
  │                                  //   bfs, dfs, dijkstra, hasCycle, isConnected
  ├── src/core/renderer/FlowRenderer.ts
  └── src/hooks/useFlowRenderer.ts
  ├── src/components/visualization/GraphCanvas.tsx
  └── src/core/SceneGraph.ts         // (add GraphNode/Edge types if needed)
```

**Test**: Add vertices and edges. Run BFS -- see nodes highlight in traversal order. React Flow handles drag, zoom, layout.

### Phase 12: Telemetry Service (Day 14-15)

**Goal**: All operations logged to IndexedDB. Log viewer panel shows recent events. Export works.

```
Files:
  ├── src/services/telemetry/TelemetryBuffer.ts   // implementation
  ├── src/components/panels/LogPanel.tsx
  └── src/store/middleware/telemetryMiddleware.ts  // (already created in Phase 4, wire up here)
```

**Test**: Perform 10 operations. Verify IndexedDB contains telemetry events in `kv_store` table. Open LogPanel -- events listed with timestamps. Click Export -- downloads JSON file.

### Phase 13: Persistence + Sessions (Day 15-16)

**Goal**: Sessions can be saved, loaded, listed, exported. User preferences stored in LocalStorage.

```
Files:
  ├── src/services/persistence/LocalStorageService.ts
  ├── src/services/persistence/IndexedDBService.ts
  ├── src/services/persistence/SessionService.ts
  ├── src/services/service-provider.ts
  ├── src/components/session/SessionPanel.tsx
  └── src/components/session/SessionList.tsx
```

**Test**: Execute Array "sort" with multiple elements. Save session. Reload page. Load session -- visualization restores with steps intact. Export session as JSON -- verify file downloads with correct content.

### Phase 14: Keyboard Shortcuts + Polish (Day 16-17)

**Goal**: Keyboard navigation, responsive layout, loading states, empty states, error boundaries.

```
Files:
  ├── src/hooks/useKeyboardShortcuts.ts
  ├── src/components/visualization/VisualizationTooltip.tsx
  └── Polish existing components
```

### Phase 15: Static Data Files + Lessons (Day 17-18)

**Goal**: Lesson and exercise JSON files loadable into the UI.

```
Files:
  ├── src/data/lessons/array-lessons.json
  ├── src/data/lessons/linked-list-lessons.json
  ├── ... (one per plugin, or combined)
  └── src/data/exercises/*.json
```

---

## Appendices

### A. Dependency Graph Between Phases

```
Phase 1 (Scaffolding)
   │
   ▼
Phase 2 (Core Types)
   │
   ▼
Phase 3 (Registry + Array Plugin) ───────┐
   │                                      │
   ▼                                      │
Phase 4 (Zustand Store) ──────────────────┤
   │                                      │
   ▼                                      │
Phase 5 (D3 Renderer)                     │
   │                                      │
   ▼                                      │
Phase 6 (UI Components + Playback) ◄──────┘
   │
   ▼
Phase 7 (Panels)
   │
   ├──── Phase 12 (Telemetry) ─── Phase 13 (Persistence) ─── Phase 14 (Polish)
   │
   ├──── Phase 8 (Linear Plugins)
   │         │
   │         ▼
   │       Phase 9 (Tree Plugins)
   │         │
   │         ▼
   │       Phase 10 (Hash Table)
   │
   └──── Phase 11 (Graph + React Flow)
```

You can parallelize Phase 8-11 across teammates: each plugin folder is entirely self-contained.

### B. Package Dependencies

```json
{
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "zustand": "^4.5.0",
    "zustand-middleware": "^4.5.0",
    "immer": "^10.1.0",
    "d3": "^7.9.0",
    "@types/d3": "^7.4.0",
    "reactflow": "^11.11.0",
    "@xyflow/react": "^12.3.0"
  },
  "devDependencies": {
    "typescript": "^5.5.0",
    "vite": "^5.4.0",
    "@vitejs/plugin-react": "^4.3.0",
    "tailwindcss": "^3.4.0",
    "@tailwindcss/vite": "^4.0.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0"
  }
}
```

Note: `reactflow` v11 or `@xyflow/react` v12 (the newer package) both work. Use `@xyflow/react` if starting fresh.

### C. Complete Vite Config

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': '/src',
      '@core': '/src/core',
      '@plugins': '/src/plugins',
      '@store': '/src/store',
      '@components': '/src/components',
      '@services': '/src/services',
      '@hooks': '/src/hooks',
      '@utils': '/src/utils',
      '@data': '/src/data',
    },
  },
});
```

### D. Performance Considerations

1. **Scene Graph Diffing**: The D3 renderer should diff the previous SceneNode tree against the new one using node `id` for enter/update/exit selections. This avoids full SVG re-renders.

2. **Snapshot Memory**: Each step stores a `snapshot` via `structuredClone`. For a large BST with 1000 nodes and 100 steps, this could be ~10MB. Mitigation: compress snapshots by only storing the delta, or switch to journal-based replay (Option B from Section 4).

3. **RequestIdleCallback**: Used for telemetry flush to avoid blocking the main thread during animation frames.

4. **Zustand Selector**: Components should use fine-grained selectors (`useStore(s => s.currentStepIndex)`) rather than subscribing to the entire store.

5. **D3/DOM Batching**: Batch all DOM mutations within a single `requestAnimationFrame` callback.

### E. Existing Project State

As of this writing, the project directory at `/Users/ramanans/Desktop/Ramanan-playground/DS_ALGO_VISUALIZATION` contains only `instructions.md` (the specification document). No scaffolding, source files, or configuration files exist yet. The plan above assumes a greenfield project starting from `npm create vite@latest`.


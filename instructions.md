# Frontend-Only Data Structures Visualization Platform

Build a frontend-only, enterprise-style data structures learning platform using React, TypeScript, Vite, Tailwind CSS, Zustand, D3.js, and React Flow.

For now, do not build a backend.

The application must run completely in the browser.

Use local storage and IndexedDB for persistence.

Design the system so that a backend can be added later without rewriting the core.

## Requirements

1. Build a modular visualization engine.
2. Build a plugin system for data structures.
3. Do not hardcode data-structure-specific logic in the core engine.
4. Each data structure should be implemented as a plugin.
5. Every operation must generate step-by-step visualization events.
6. Every state change must be immutable and replayable.
7. Every important action must be logged through a telemetry service.
8. Logging must not block rendering.
9. Use service interfaces so local storage can later be replaced by API services.
10. Support playback controls: play, pause, step forward, step backward, restart, speed control.
11. Support explanation panels, pseudocode highlighting, and complexity display.
12. Store lessons and exercises as static JSON files.
13. Store user progress locally using LocalStorage or IndexedDB.
14. Allow exporting logs and session replay files as JSON.

## Initial Data Structures

Start with:

- Array
- Linked List
- Stack
- Queue
- Hash Table
- Binary Search Tree
- Heap
- Graph

## Architecture

Use the following architecture:

```text
React App
  |
  Visualization Engine
  |
  Plugin System
  |
  Operation Engine
  |
  Step Generator
  |
  State Reducer
  |
  Scene Graph
  |
  Renderer
  |
  Telemetry Logger
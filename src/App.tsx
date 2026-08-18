import { useState, useEffect, useCallback } from 'react';
import { Layout } from './ui/components/Layout';
import { Button } from './ui/components/Button';
import { Panel } from './ui/components/Panel';
import { PlaybackControls } from './ui/components/PlaybackControls';
import { OperationPanel } from './ui/components/OperationPanel';
import { visualizationEngine } from './engine/VisualizationEngine';
import { arrayPlugin } from './plugins/array';
import { LinkedListPlugin } from './plugins/linkedlist/LinkedListPlugin';
import { StackPlugin } from './plugins/stack/StackPlugin';
import { QueuePlugin } from './plugins/queue/QueuePlugin';
import { lessons } from './data/lessons/array-lessons';
import type { DSState, StepEvent } from './types/visualization';
import type { DataStructurePlugin } from './types/plugin';

function App() {
  const [selectedPlugin, setSelectedPlugin] = useState<string>('array');
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [currentState, setCurrentState] = useState<DSState | null>(null);
  const [steps, setSteps] = useState<StepEvent[]>([]);
  const [playbackStatus, setPlaybackStatus] = useState<'idle' | 'playing' | 'paused'>('idle');
  const [speed, setSpeed] = useState<number>(1);
  const [message, setMessage] = useState<string>('Select an operation to begin');

  // Initialize plugin
  useEffect(() => {
    let plugin: DataStructurePlugin;
    switch (selectedPlugin) {
      case 'linkedlist':
        plugin = new LinkedListPlugin() as any;
        break;
      case 'stack':
        plugin = new StackPlugin() as any;
        break;
      case 'queue':
        plugin = new QueuePlugin() as any;
        break;
      default:
        plugin = arrayPlugin;
    }
    
    visualizationEngine.loadPlugin(plugin);
    setCurrentState(visualizationEngine.currentState);
    setSteps([]);
    setCurrentStepIndex(0);
    setPlaybackStatus('idle');
    setMessage('Plugin loaded. Select an operation to begin.');
  }, [selectedPlugin]);

  // Subscribe to engine changes
  useEffect(() => {
    const unsubscribe = visualizationEngine.subscribe(() => {
      setCurrentState(visualizationEngine.currentState);
      setCurrentStepIndex(visualizationEngine.currentStepIndex);
      setSteps(visualizationEngine.steps);
      setPlaybackStatus(visualizationEngine.playbackStatus as 'idle' | 'playing' | 'paused');
      setSpeed(visualizationEngine.speed);
      
      if (visualizationEngine.currentStepIndex >= 0 && visualizationEngine.steps.length > 0) {
        const currentStep = visualizationEngine.steps[visualizationEngine.currentStepIndex];
        setMessage(currentStep.explanation || `Step ${visualizationEngine.currentStepIndex + 1} of ${visualizationEngine.totalSteps}`);
      }
    });

    return unsubscribe;
  }, []);

  // Handle operation execution
  const handleExecuteOperation = useCallback((operationId: string, params: Record<string, unknown>) => {
    visualizationEngine.executeOperation(operationId, params);
    setMessage(`Executing ${operationId}...`);
  }, []);

  // Playback controls
  const handlePlay = useCallback(() => {
    visualizationEngine.play();
  }, []);

  const handlePause = useCallback(() => {
    visualizationEngine.pause();
  }, []);

  const handleStop = useCallback(() => {
    visualizationEngine.restart();
    setMessage('Playback stopped');
  }, []);

  const handleStepForward = useCallback(() => {
    visualizationEngine.stepForward();
  }, []);

  const handleStepBackward = useCallback(() => {
    visualizationEngine.stepBackward();
  }, []);

  const handleSpeedChange = useCallback((newSpeed: number) => {
    visualizationEngine.setSpeed(newSpeed);
  }, []);

  // Get operations for current plugin
  const getOperations = () => {
    const plugin = visualizationEngine.plugin;
    if (!plugin) return [];
    
    return plugin.operations.map((op) => ({
      id: op.id,
      label: op.label,
      description: op.description,
      parameters: op.parameters,
    }));
  };

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-text-primary">
          DS Algo Visualizer
        </h1>
        <div className="flex gap-2">
          <select
            value={selectedPlugin}
            onChange={(e) => setSelectedPlugin(e.target.value)}
            className="px-3 py-2 bg-bg-secondary rounded-lg border border-border-primary text-text-primary"
          >
            <option value="array">Array</option>
            <option value="linkedlist">Linked List</option>
            <option value="stack">Stack</option>
            <option value="queue">Queue</option>
          </select>
          <Button variant="secondary" onClick={() => visualizationEngine.restart()}>
            Reset
          </Button>
        </div>
      </div>

      <div className="flex gap-4 flex-1 overflow-hidden">
        {/* Left Sidebar - Operations */}
        <div className="w-64 flex flex-col gap-4">
          <Panel title="Operations" collapsible>
            <OperationPanel
              operations={getOperations()}
              onExecute={handleExecuteOperation}
            />
          </Panel>

          <Panel title="Lessons" collapsible defaultCollapsed>
            <div className="space-y-2">
              {lessons.map((lesson) => (
                <div key={lesson.id} className="p-2 hover:bg-bg-primary rounded cursor-pointer">
                  <p className="text-sm text-text-primary">{lesson.title}</p>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        {/* Main Visualization Area */}
        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
          {/* Message Bar */}
          <div className="px-4 py-3 bg-bg-secondary rounded-lg border border-border-primary">
            <p className="text-text-primary">{message}</p>
          </div>

          {/* Visualization Canvas */}
          <div className="flex-1 bg-bg-secondary rounded-lg border border-border-primary p-8 overflow-auto">
            <div className="w-full h-full flex items-center justify-center">
              {/* Render based on plugin type */}
              {selectedPlugin === 'array' && currentState?.array && (
                <div className="flex gap-2 flex-wrap">
                  {(currentState.array as number[]).map((value, index) => (
                    <div
                      key={index}
                      className="w-16 h-16 flex items-center justify-center rounded-lg text-xl font-bold bg-bg-primary text-text-primary border-2 border-border-primary relative"
                    >
                      {value}
                      <div className="absolute -bottom-6 text-xs text-text-secondary">
                        {index}
                      </div>
                    </div>
                  ))}
                  {(currentState.array as number[])?.length === 0 && (
                    <p className="text-text-secondary">Empty array</p>
                  )}
                </div>
              )}
              
              {selectedPlugin === 'linkedlist' && currentState?.nodes && (
                <div className="flex items-center gap-2">
                  {(currentState.nodes as any[]).map((node: any, index: number) => (
                    <div key={index} className="flex items-center">
                      <div className="w-16 h-16 flex items-center justify-center rounded-lg bg-bg-primary border-2 border-border-primary text-text-primary font-bold">
                        {node.value}
                      </div>
                      {index < (currentState.nodes as any[]).length - 1 && (
                        <div className="w-8 h-0.5 bg-border-primary mx-2" />
                      )}
                    </div>
                  ))}
                  {(currentState.nodes as any[])?.length === 0 && (
                    <p className="text-text-secondary">Empty linked list</p>
                  )}
                </div>
              )}

              {selectedPlugin === 'stack' && currentState?.elements && (
                <div className="flex flex-col-reverse gap-2">
                  {(currentState.elements as any[]).map((value: any, index: number) => (
                    <div
                      key={index}
                      className="w-32 h-12 flex items-center justify-center rounded bg-bg-primary border-2 border-border-primary text-text-primary font-bold"
                    >
                      {value}
                    </div>
                  ))}
                  {(currentState.elements as any[])?.length === 0 && (
                    <p className="text-text-secondary">Empty stack</p>
                  )}
                </div>
              )}

              {selectedPlugin === 'queue' && currentState?.elements && (
                <div className="flex gap-2">
                  {(currentState.elements as any[]).map((value: any, index: number) => (
                    <div
                      key={index}
                      className="w-32 h-12 flex items-center justify-center rounded bg-bg-primary border-2 border-border-primary text-text-primary font-bold"
                    >
                      {value}
                    </div>
                  ))}
                  {(currentState.elements as any[])?.length === 0 && (
                    <p className="text-text-secondary">Empty queue</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Playback Controls */}
          <PlaybackControls
            playbackState={playbackStatus}
            onPlay={handlePlay}
            onPause={handlePause}
            onStop={handleStop}
            onStepForward={handleStepForward}
            onStepBackward={handleStepBackward}
            speed={speed}
            onSpeedChange={handleSpeedChange}
            currentStep={currentStepIndex}
            totalSteps={steps.length}
          />
        </div>

        {/* Right Sidebar - Info */}
        <div className="w-64 flex flex-col gap-4">
          <Panel title="Info" collapsible>
            <div className="space-y-2 text-sm text-text-secondary">
              <p>Data Structure: <span className="text-text-primary capitalize">{selectedPlugin}</span></p>
              <p>Total Steps: <span className="text-text-primary">{steps.length}</span></p>
              <p>Current Step: <span className="text-text-primary">{currentStepIndex + 1}</span></p>
            </div>
          </Panel>
        </div>
      </div>
    </Layout>
  );
}

export default App;

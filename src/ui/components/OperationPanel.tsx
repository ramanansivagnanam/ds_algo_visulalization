import React from 'react';

interface OperationPanelProps {
  operations: Array<{
    id: string;
    label: string;
    description: string;
    parameters?: Array<{ name: string; type: string }>;
  }>;
  onExecute: (operationId: string, params: Record<string, unknown>) => void;
}

export const OperationPanel: React.FC<OperationPanelProps> = ({
  operations,
  onExecute,
}) => {
  const [selectedOp, setSelectedOp] = React.useState<string | null>(null);
  const [params, setParams] = React.useState<Record<string, unknown>>({});

  const handleExecute = () => {
    if (selectedOp) {
      onExecute(selectedOp, params);
      setParams({});
      setSelectedOp(null);
    }
  };

  return (
    <div className="operation-panel">
      <h3>Operations</h3>
      <div className="operations-list">
        {operations.map((op) => (
          <div key={op.id} className="operation-item">
            <button onClick={() => setSelectedOp(op.id)}>{op.label}</button>
            <p className="operation-description">{op.description}</p>
          </div>
        ))}
      </div>
      {selectedOp && (
        <div className="operation-form">
          <h4>Execute Operation</h4>
          <button onClick={handleExecute}>Execute</button>
          <button onClick={() => setSelectedOp(null)}>Cancel</button>
        </div>
      )}
    </div>
  );
};

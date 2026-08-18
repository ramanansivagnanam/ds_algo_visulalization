import React from 'react';

interface PanelProps {
  title: string;
  children: React.ReactNode;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

export const Panel: React.FC<PanelProps> = ({
  title,
  children,
  collapsible = false,
  defaultCollapsed = false,
}) => {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);

  return (
    <div className="panel">
      <div className="panel-header" onClick={() => collapsible && setIsCollapsed(!isCollapsed)}>
        <h3>{title}</h3>
        {collapsible && <span>{isCollapsed ? '▶' : '▼'}</span>}
      </div>
      {!isCollapsed && <div className="panel-content">{children}</div>}
    </div>
  );
};

import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children, sidebar, header, footer }) => {
  return (
    <div className="app-layout">
      {header && <header className="app-header">{header}</header>}
      <div className="app-body">
        {sidebar && <aside className="app-sidebar">{sidebar}</aside>}
        <main className="app-main">{children}</main>
      </div>
      {footer && <footer className="app-footer">{footer}</footer>}
    </div>
  );
};

import React from 'react';
import Header from './Header';

interface LayoutProps {
  children: React.ReactNode;
}

export const HEADER_HEIGHT = 40; // in pixels

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div>
      <Header />
      <main className="main-content" style={{ 
        paddingTop: `${HEADER_HEIGHT}px`,
        height: '100vh',
        width: '100%'
      }}>
        {children}
      </main>
    </div>
  );
};

export default Layout; 
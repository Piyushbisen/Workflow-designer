import React from 'react';
import { ReactFlowProvider } from 'reactflow';
import { ThemeProvider } from './contexts/ThemeContext';
import { WorkflowProvider } from './contexts/WorkflowContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Canvas from './components/Canvas';
import 'reactflow/dist/style.css';

function App() {
  return (
    <ThemeProvider>
      <WorkflowProvider>
        <ReactFlowProvider>
          <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 transition-colors duration-300">
            <Header />
            <div className="flex-1 flex overflow-hidden">
              <Sidebar />
              <div className="flex-1 relative">
                <Canvas />
              </div>
            </div>
          </div>
        </ReactFlowProvider>
      </WorkflowProvider>
    </ThemeProvider>
  );
}

export default App;
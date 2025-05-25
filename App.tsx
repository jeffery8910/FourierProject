import React, { useState } from 'react';
import { Navigation } from './components/Navigation';
import { FourierVisualization } from './components/FourierVisualization';
import { TutorialContent } from './components/TutorialContent';
import { CSVProcessor } from './components/CSVProcessor';
import { ActiveView } from './types';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ActiveView>(ActiveView.VISUALIZATION);

  const renderView = () => {
    switch (activeView) {
      case ActiveView.VISUALIZATION:
        return <FourierVisualization />;
      case ActiveView.TUTORIAL:
        return <TutorialContent />;
      case ActiveView.CSV_PROCESSOR:
        return <CSVProcessor />;
      default:
        return <FourierVisualization />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      <Navigation activeView={activeView} setActiveView={setActiveView} />
      <main className="flex-grow container mx-auto p-4 md:p-8">
        {renderView()}
      </main>
      <footer className="bg-slate-800 text-center p-4 text-slate-400 text-sm">
        傅立葉轉換探索器 &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
};

export default App;

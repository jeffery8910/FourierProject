import React from 'react';
import { ActiveView } from '../types';
import { TAB_NAMES } from '../constants';
import { Icon } from './common/Icon'; 

interface NavigationProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
}

const NavItem: React.FC<{
  view: ActiveView;
  currentView: ActiveView;
  onClick: (view: ActiveView) => void;
  children: React.ReactNode;
}> = ({ view, currentView, onClick, children }) => {
  const isActive = view === currentView;
  return (
    <button
      onClick={() => onClick(view)}
      className={`px-4 py-3 text-sm md:text-base font-medium transition-colors duration-150 focus:outline-none
        ${isActive
          ? 'border-b-2 border-sky-500 text-sky-400'
          : 'text-slate-400 hover:text-sky-300 border-b-2 border-transparent hover:border-slate-600'
        }`}
      aria-current={isActive ? 'page' : undefined}
    >
      {children}
    </button>
  );
};


export const Navigation: React.FC<NavigationProps> = ({ activeView, setActiveView }) => {
  return (
    <nav className="bg-slate-800 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
                 <img src="https://picsum.photos/seed/logo/40/40" alt="App Logo" className="h-8 w-8 rounded-full mr-3" />
                <span className="font-bold text-xl text-sky-400 hidden sm:block">傅立葉探索器</span>
            </div>
          <div className="flex space-x-1 sm:space-x-2">
            <NavItem view={ActiveView.VISUALIZATION} currentView={activeView} onClick={setActiveView}>
              {TAB_NAMES[ActiveView.VISUALIZATION]}
            </NavItem>
            <NavItem view={ActiveView.TUTORIAL} currentView={activeView} onClick={setActiveView}>
              {TAB_NAMES[ActiveView.TUTORIAL]}
            </NavItem>
            <NavItem view={ActiveView.CSV_PROCESSOR} currentView={activeView} onClick={setActiveView}>
              {TAB_NAMES[ActiveView.CSV_PROCESSOR]}
            </NavItem>
          </div>
        </div>
      </div>
    </nav>
  );
};

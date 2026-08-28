import React from 'react';
import { CardType } from '../types';
import { TOOL_CONFIG } from '../constants';
import { renderToolIcon } from '../icons';

interface SidebarItemProps {
  type: CardType;
  active: boolean;
  isSidebarOpen: boolean;
  onClick: (type: CardType) => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ 
  type, 
  active, 
  isSidebarOpen, 
  onClick 
}) => (
  <button
    onClick={() => onClick(type)}
    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 group relative
      ${active 
        ? 'bg-blue-600 dark:bg-amber-600 text-white shadow-lg shadow-blue-900/20 dark:shadow-amber-900/20' 
        : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-800'
      }`}
  >
    <div className={`flex-shrink-0 ${active ? 'text-white' : TOOL_CONFIG[type].color}`}>
      {renderToolIcon(type, { size: 20 })}
    </div>
    <span className={`text-sm font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ${isSidebarOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>
      {TOOL_CONFIG[type].label}
    </span>
    
    {!isSidebarOpen && (
      <div className="absolute left-14 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap shadow-xl border border-slate-700">
        {TOOL_CONFIG[type].label}
      </div>
    )}
  </button>
);

export default SidebarItem;

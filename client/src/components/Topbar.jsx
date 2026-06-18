import React from 'react';
import { useDnD } from './DnDContext';
import { Play, Save, FolderOpen, LogOut, HelpCircle } from 'lucide-react'

// Topbar component — displays the app title and workflow-level actions
export default ( { onRun, onLoad, onSave, onLogout, onHelp } ) => {
  const [_, setType] = useDnD();

  return (
    <div className="w-20 h-full flex bg-light-cyan-900 flex-1 py-4 justify-between px-6 gap-3 border-b border-gray-700">

      {/* App title */}
      <span className="text-white font-bold text-xl tracking-widest">SYNAPSE</span>

      {/* Workflow action buttons — load existing workflows */}
      <div className="ml-auto flex gap-2">
        <button onClick={onSave} className="bg-blue-500 hover:bg-blue-600 border border-light-cyan-500 text-white p-2 rounded-xl">
          <Save size={14} />
        </button>

        <button onClick={onLoad} className="bg-blue-500 hover:bg-blue-600 border border-light-cyan-500 text-white p-2 rounded-xl">
          <FolderOpen size={14} />
        </button>

        <button onClick={onHelp} className="bg-gray-700 hover:bg-gray-600 border border-light-cyan-500 text-white text-xs px-3 py-1.5 rounded-xl">
          <HelpCircle size={18} />
        </button>

        <button onClick={onLogout} className="bg-light-cyan-100 hover:bg-light-cyan-400 border border-light-cyan-500 text-black text-xs px-3 py-1.5 rounded-xl">
          Log out
        </button>

      </div>
    </div>
  );
};
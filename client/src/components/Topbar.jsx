import React from 'react';
import { useDnD } from './DnDContext';
import { Play, Save, FolderOpen } from 'lucide-react'

// Topbar component — displays the app title and workflow-level actions
export default ( { onRun, onLoad } ) => {
  const [_, setType] = useDnD();

  return (
    <div className="w-20 h-full flex bg-light-cyan-900 flex-1 py-4 justify-between px-6 gap-3 border-b border-gray-700">

      {/* App title */}
      <span className="text-white font-bold text-xl tracking-widest">SYNAPSE</span>

      {/* Workflow action buttons — load existing workflows */}
      <div className="ml-auto flex gap-2">
        <button className="bg-gray-700 hover:bg-gray-600 text-white text-xs px-3 py-1.5 rounded-xl">Saves</button>

        <button onClick={onLoad} className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-xl">
          <FolderOpen size={14} />
        </button>

      </div>
    </div>
  );
};
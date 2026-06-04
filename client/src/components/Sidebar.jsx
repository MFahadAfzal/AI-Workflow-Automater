import React from 'react';
import { useDnD } from './DnDContext';
import { Play } from 'lucide-react'
export default ( { onRun } ) => {
  const [_, setType] = useDnD();

  const onDragStart = (event, nodeType) => {
    setType(nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="w-full h-12 bg-gray-900 flex items-center px-6 gap-3 border-b border-gray-700">
      <span className="text-white font-semibold text-lg mr-4">Synapse</span>

      <div
        className="bg-gray-700 hover:bg-gray-600 text-white text-xs px-3 py-1.5 rounded cursor-grab select-none"
        onDragStart={(event) => onDragStart(event, 'prompt')}
        draggable
      >
        Prompt
      </div>

      <div
        className="bg-gray-700 hover:bg-gray-600 text-white text-xs px-3 py-1.5 rounded cursor-grab select-none"
        onDragStart={(event) => onDragStart(event, 'claude')}
        draggable
      >
        Claude
      </div>

      <div
        className="bg-gray-700 hover:bg-gray-600 text-white text-xs px-3 py-1.5 rounded cursor-grab select-none"
        onDragStart={(event) => onDragStart(event, 'groq')}
        draggable
      >
        Groq
      </div>

      <div
        className="bg-gray-700 hover:bg-gray-600 text-white text-xs px-3 py-1.5 rounded cursor-grab select-none"
        onDragStart={(event) => onDragStart(event, 'result')}
        draggable
      >
        Output Node
      </div>

      <div className="ml-auto flex gap-2">
        <button className="bg-gray-700 hover:bg-gray-600 text-white text-xs px-3 py-1.5 rounded">Save</button>

        <button onClick={onRun} className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded">
          <Play size={14} />
        </button>

      </div>
    </div>
  );
};
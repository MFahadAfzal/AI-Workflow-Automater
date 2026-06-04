import React from 'react';
import { useDnD } from './DnDContext';

export default () => {
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
        onDragStart={(event) => onDragStart(event, 'input')}
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
        onDragStart={(event) => onDragStart(event, 'default')}
        draggable
      >
        Groq
      </div>

      <div
        className="bg-gray-700 hover:bg-gray-600 text-white text-xs px-3 py-1.5 rounded cursor-grab select-none"
        onDragStart={(event) => onDragStart(event, 'output')}
        draggable
      >
        Output Node
      </div>

      <div className="ml-auto flex gap-2">
        <button className="bg-gray-700 hover:bg-gray-600 text-white text-xs px-3 py-1.5 rounded">Save</button>
        <button className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1.5 rounded">Run</button>
      </div>
    </div>
  );
};
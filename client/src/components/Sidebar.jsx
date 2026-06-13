import React from 'react';
import { useDnD } from './DnDContext';
import { Play, Save } from 'lucide-react'

// Sidebar component — contains draggable node types and workflow action buttons
export default ( { onRun, onSave } ) => {
  const [_, setType] = useDnD();

  // Sets the dragged node type in DnD context so Canvas knows what to create on drop
  const onDragStart = (event, nodeType) => {
    setType(nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="w-20 h-full flex flex-col bg-light-cyan-700 flex-1 py-4 justify-between px-6 gap-3 border-b border-gray-700">

      {/* Draggable node type tiles — each sets its type in DnD context on drag start */}
      <div
        className="bg-gray-700 hover:bg-gray-600 flex flex-1 items-center text-white text-l px-3 rounded-xl cursor-grab select-none"
        onDragStart={(event) => onDragStart(event, 'prompt')}
        draggable
      >
        Prompt
      </div>

      <div
        className="bg-gray-700 hover:bg-gray-600 flex flex-1 items-center text-white text-l px-3  rounded-xl cursor-grab select-none"
        onDragStart={(event) => onDragStart(event, 'claude')}
        draggable
      >
        Claude
      </div>

      <div
        className="bg-gray-700 hover:bg-gray-600 flex flex-1 items-center text-white text-l px-3  rounded-xl cursor-grab select-none"
        onDragStart={(event) => onDragStart(event, 'groq')}
        draggable
      >
        Groq
      </div>

      <div
        className="bg-gray-700 hover:bg-gray-600 flex flex-1 items-center text-white text-l px-3  rounded-xl cursor-grab select-none"
        onDragStart={(event) => onDragStart(event, 'result')}
        draggable
      >
        Output Node
      </div>

      {/* Action buttons — save and run the current workflow */}
      <div className="ml-auto flex gap-2">
        <button className="bg-gray-700 hover:bg-gray-600 text-white text-xs px-3 py-1.5 rounded-xl">Saves</button>

        <button onClick={onSave} className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-xl">
          <Save size={14} />
        </button>

        <button onClick={onRun} className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-xl">
          <Play size={14} />
        </button>

      </div>
    </div>
  );
};
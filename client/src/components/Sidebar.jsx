import React from 'react';
import { useDnD } from './DnDContext';
import { Play, Save, MessageSquare, Sparkles, ArrowRight, Trash2 } from 'lucide-react'

// Sidebar component — contains draggable node types and workflow action buttons
export default ( { onRun, onClear } ) => {
  const [_, setType] = useDnD();

  // Sets the dragged node type in DnD context so Canvas knows what to create on drop
  const onDragStart = (event, nodeType) => {
    setType(nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="w-20 h-full flex flex-col bg-light-cyan-700 flex-1 py-4 justify-between px-6 gap-3 border-b border-gray-700 rounded-xl gap-5">

      <div>
        <p className="text-xs font-medium text-gray-100 uppercase tracking-wide">Node types</p>
        <p className="text-xs text-gray-400">Drag onto the canvas</p>
      </div>

      {/* Draggable node type tiles — each sets its type in DnD context on drag start */}
      <div
          className="bg-gray-700 hover:bg-gray-600 border border-light-cyan-500 flex flex-1 items-center gap-3 text-white px-3 rounded-xl cursor-grab select-none"
          onDragStart={(event) => onDragStart(event, 'prompt')}
          draggable
        >
        <MessageSquare size={18} className="text-gray-300" />
        <div>
          <p className="text-sm font-medium">Prompt</p>
          <p className="text-xs text-gray-400">Static input text</p>
        </div>
      </div>

      <div
        className="bg-gray-700 hover:bg-gray-600 border border-light-cyan-500 flex flex-1 items-center gap-3 text-white px-3 rounded-xl cursor-grab select-none"
        onDragStart={(event) => onDragStart(event, 'mistral')}
        draggable
      >
        <Sparkles size={18} className="text-gray-300" />
        <div>
          <p className="text-sm font-medium">Mistral</p>
          <p className="text-xs text-gray-400">AI processing</p>
        </div>
      </div>

      <div
        className="bg-gray-700 hover:bg-gray-600 border border-light-cyan-500 flex flex-1 items-center gap-3 text-white px-3 rounded-xl cursor-grab select-none"
        onDragStart={(event) => onDragStart(event, 'groq')}
        draggable
      >
        <Sparkles size={18} className="text-gray-300" />
        <div>
          <p className="text-sm font-medium">Groq</p>
          <p className="text-xs text-gray-400">AI processing</p>
        </div>
      </div>

      <div
        className="bg-gray-700 hover:bg-gray-600 border border-light-cyan-500 flex flex-1 items-center gap-3 text-white px-3 rounded-xl cursor-grab select-none"
        onDragStart={(event) => onDragStart(event, 'result')}
        draggable
      >
        <ArrowRight size={18} className="text-gray-300" />
        <div>
          <p className="text-sm font-medium">Output</p>
          <p className="text-xs text-gray-400">Final result</p>
        </div>
      </div>

      {/* Action buttons — save and run the current workflow */}
      <div className=" flex gap-2 justify-between">
        <button onClick={onClear} className="bg-gray-700 hover:bg-gray-600 border border-light-cyan-500 text-white p-2 rounded-xl">
          <Trash2 size={18} />
        </button>

        <button onClick={onRun} className="bg-blue-500 hover:bg-blue-600 border border-light-cyan-500 text-white p-2 rounded-xl">
          <Play size={20} />
        </button>

      </div>
    </div>
  );
};
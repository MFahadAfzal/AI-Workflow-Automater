import React from 'react'
import { X } from 'lucide-react'

// Modal explaining how to use Synapse — shown when user clicks the help button
export default ({ onClose }) => {
  const steps = [
    { title: 'Drag a node', desc: 'Pick a node type from the sidebar and drag it onto the canvas' },
    { title: 'Connect nodes', desc: 'Drag from one node\'s handle to another to link them together' },
    { title: 'Run the workflow', desc: 'Click the run button to execute your workflow from start to finish' },
    { title: 'Save your work', desc: 'Click save to store your workflow and load it again later' },
  ]

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-xl p-6 flex flex-col gap-4 w-96">
        <div className="flex items-center justify-between">
          <span className="text-white font-semibold text-lg">How to use Synapse</span>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {steps.map((step, i) => (
            <div key={i} className="flex gap-3 items-start">
              <div className="bg-light-cyan-700 text-white text-xs font-semibold rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">
                {i + 1}
              </div>
              <div>
                <p className="text-white text-sm font-medium">{step.title}</p>
                <p className="text-gray-400 text-xs">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <button onClick={onClose} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm self-end">
          Got it
        </button>
      </div>
    </div>
  )
}
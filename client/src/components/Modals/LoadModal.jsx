import React, { useState }  from 'react'

// Modal for loading a saved workflow
// Displays all of the user's saved workflows and lets them select one to load
export default ({ onConfirm, onCancel, workflowName, setWorkflowName, nameError, data }) => {
    // Tracks which workflow the user has clicked/selected
    const [clicked, setClicked] = useState(null)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-xl p-6 flex flex-col gap-4 w-[500px] h-[90%]">
        <span className="text-white font-semibold text-lg">Your workflows</span>

        {/* If no workflows exist, show empty state. Otherwise render the list */}
        {data.length === 0 
            ? (<p className="text-gray-400 text-sm">You have no workflows yet</p>)
            : <div className='flex flex-wrap gap-3 justify-center overflow-y-auto'>
                {data.map(workflow => (
                    <div
                      key={workflow.id}
                      onClick={() => setClicked(workflow)}
                      className={`w-48 h-28 rounded-xl p-4 flex flex-col justify-between cursor-pointer transition border-2 ${
                        clicked?.id === workflow.id
                          ? 'bg-light-cyan-800 border-light-cyan-400'
                          : 'bg-gray-800 border-transparent hover:bg-gray-700'
                      }`}
                    >
                      <p className="text-white text-sm font-medium truncate">{workflow.name}</p>
                      <p className="text-gray-400 text-xs">Click to select</p>
                    </div>
                ))}
                </div>
        }
        
        {nameError && <span className="text-red-400 text-sm">{nameError}</span>}
        
        <div className="flex gap-2 justify-end mt-auto">
          <button onClick={onCancel} className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm">Cancel</button>
          {/* Pass the selected workflow object back to Canvas on confirm */}
          <button onClick={() => onConfirm(clicked)} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">Load</button>
        </div>
      </div>
    </div>
  )
}
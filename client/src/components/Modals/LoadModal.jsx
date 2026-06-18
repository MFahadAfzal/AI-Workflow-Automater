import React, { useState }  from 'react'

// Modal for loading a saved workflow
// Displays all of the user's saved workflows and lets them select one to load
export default ({ onConfirm, onCancel, workflowName, setWorkflowName, nameError, data }) => {
    // Tracks which workflow the user has clicked/selected
    const [clicked, setClicked] = useState(null)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-xl p-6 flex flex-col gap-4 w-[95%] h-[90%] overflow-y-auto">
        <span className="text-white font-semibold text-lg">Your Workflows</span>

        {/* If no workflows exist, show empty state. Otherwise render the list */}
        {data.length === 0 
            ? (<p>You have no workflows</p>)
            : <div className='flex flex-wrap gap-2'>
                {data.map(workflow => 
                    // Highlight the selected workflow with a lighter background
                    clicked?.id === workflow.id
                    ? (<div className='bg-gray-200 rounded-lg w-2/5' onClick={() => setClicked(workflow)} key={workflow.id}>
                        {workflow.name}
                        </div>)
                    : (<div className='bg-gray-700 rounded-lg w-2/5' onClick={() => setClicked(workflow)} key={workflow.id}>
                        {workflow.name}
                        </div>)
                )}
                </div>
        }
        
        {nameError && <span className="text-red-400 text-sm">{nameError}</span>}
        
        <div className="flex gap-2 justify-end">
          <button onClick={onCancel} className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm">Cancel</button>
          {/* Pass the selected workflow object back to Canvas on confirm */}
          <button onClick={() => onConfirm(clicked)} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">Load</button>
        </div>
      </div>
    </div>
  )
}
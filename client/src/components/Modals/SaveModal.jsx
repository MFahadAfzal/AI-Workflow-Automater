import React from 'react'

// Modal for naming a new workflow before saving
// Only shown on first save — subsequent saves update silently
export default ({ onConfirm, onCancel, workflowName, setWorkflowName, nameError }) => {
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-xl p-6 flex flex-col gap-4 w-80">
        <span className="text-white font-semibold text-lg">Name your workflow</span>
        {/* Controlled input bound to workflowName state in Canvas */}
        <input
          className="bg-gray-700 text-white rounded-lg px-3 py-2 outline-none"
          placeholder="Workflow name"
          value={workflowName}
          onChange={(e) => setWorkflowName(e.target.value)}
        />
        {/* Validation error shown if user tries to save without a name */}
        {nameError && <span className="text-red-400 text-sm">{nameError}</span>}
        <div className="flex gap-2 justify-end">
          <button onClick={onCancel} className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm">Cancel</button>
          <button onClick={onConfirm} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">Save</button>
        </div>
      </div>
    </div>
  )
}
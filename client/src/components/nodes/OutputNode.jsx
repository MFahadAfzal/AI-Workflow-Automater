import { Handle, Position } from '@xyflow/react'

const OutputNode = ({data}) => {
  return (
    <div className="bg-white border-2 border-gray-400 rounded p-3 max-w-64">
      <Handle type="target" position={Position.Left} style={{ background: '#ef4444' }} />
      <div className="text-xs font-medium text-green-600 mb-2">Output</div>
      <div className="text-sm text-gray-700 whitespace-pre-wrap break-words max-h-48 overflow-y-auto min-h-12">
        {data.output || 'Run the workflow to see output here...'}
      </div>
    </div>
  )
}

export default OutputNode
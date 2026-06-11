import { Handle, Position } from '@xyflow/react'



const OutputNode = ({data}) => {
  return (
    <div className="bg-white border-2 border-green-500 rounded p-3 w-64">
      <Handle type="target" position={Position.Left} style={{ background: '#ef4444' }} />
      <div className="text-xs font-medium text-green-600 mb-2">Output</div>
      <div className="text-xs text-black italic max-h-48 overflow-y-auto min-h-12">
        {data.output || 'Run the workflow to see output here...'}
      </div>
    </div>
  )
}

export default OutputNode
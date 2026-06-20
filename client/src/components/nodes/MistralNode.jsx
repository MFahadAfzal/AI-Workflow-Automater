import { Handle, Position } from '@xyflow/react'

const MistralNode = ({ data }) => {
  const borderColor = data?.error ? 'border-red-500' : data?.running ? 'border-green-500' : 'border-orange-400'
  return (
    <div className={`bg-white border-2 ${borderColor} rounded p-3 text-sm max-w-64`}>
      <Handle type="target" position={Position.Left} style={{ background: '#ef4444' }}/>
      <span>Mistral</span>
      <div className="mt-2 text-gray-700 whitespace-pre-wrap break-words max-h-48 overflow-y-auto">
        {data?.response || ''}
      </div>
      <Handle type="source" position={Position.Right} style={{ background: '#22c55e' }}/>
    </div>
  )
}

export default MistralNode
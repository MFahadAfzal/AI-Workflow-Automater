import { Handle, Position } from '@xyflow/react'

const GroqNode = ({ response }) => {
  return (
    <div className="bg-white border-2 border-blue-400 rounded p-3 text-sm">
      <Handle type="target" position={Position.Left} style={{ background: '#ef4444' }}/>
      <span>Groq</span>
      <div className="mt-2 text-gray-700 whitespace-pre-wrap">
        {response?.output || ''}
      </div>
      <Handle type="source" position={Position.Right} style={{ background: '#22c55e' }}/>
    </div>
  )
}

export default GroqNode
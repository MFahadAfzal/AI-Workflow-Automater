import { Handle, Position } from '@xyflow/react'

const MistralNode = () => {
  return (
    <div className="bg-white border-2 border-orange-400 rounded p-3 text-sm">
      <Handle type="target" position={Position.Left} style={{ background: '#ef4444' }}/>
      <span>Mistral</span>
      <Handle type="source" position={Position.Right} style={{ background: '#22c55e' }}/>
    </div>
  )
}

export default MistralNode
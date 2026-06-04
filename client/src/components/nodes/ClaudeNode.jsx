import { Handle, Position } from '@xyflow/react'

const ClaudeNode = () => {
  return (
    <div className="bg-white border border-black rounded p-3 text-sm">
      <Handle type="target" position={Position.Left} />
      <span>Claude</span>
      <Handle type="source" position={Position.Right} />
    </div>
  )
}

export default ClaudeNode
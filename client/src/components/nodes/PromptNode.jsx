import { Handle, Position, useReactFlow } from '@xyflow/react'

const PromptNode = ({ id, data }) => {
  const { updateNodeData } = useReactFlow()

  const onChange = (evt) => {
    updateNodeData(id, { prompt: evt.target.value })
  }


  return (
    <div className="bg-white border-2 border-gray-400 rounded p-3 text-sm">
      <textarea
        className="nodrag w-full text-xs border border-gray-200 rounded p-2 resize-none focus:outline-none focus:ring-1 focus:ring-gray-400"
        rows={4}
        placeholder="Type your prompt here..."
        onChange={onChange}
      />
      <Handle type="source" position={Position.Right} style={{ background: '#22c55e' }}/>
    </div>
  )
}

export default PromptNode
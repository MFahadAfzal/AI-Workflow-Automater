import React, { useCallback, useState, useEffect } from 'react';
import { ReactFlow, ReactFlowProvider, addEdge, applyNodeChanges, applyEdgeChanges, useReactFlow, Background, Panel } from '@xyflow/react';
import { verify } from '../services/api'
import { useNavigate } from 'react-router-dom';

import '@xyflow/react/dist/style.css';

import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import SaveModal from '../components/Modals/SaveModal';
import LoadModal from '../components/Modals/LoadModal';
import HelpModal from '../components/Modals/HelpModal'
import { DnDProvider, useDnD } from '../components/DnDContext';
import MistralNode from '../components/nodes/MistralNode';
import GroqNode from '../components/nodes/GroqNode';
import PromptNode from '../components/nodes/PromptNode';
import OutputNode from '../components/nodes/OutputNode';
import { useWorkflowSocket } from '../hooks/useWorkflowSocket';
import { useWorkflowActions } from '../hooks/useWorkflowActions';

// Maps node type strings to React components so ReactFlow knows how to render each node
const nodeTypes = {
  mistral: MistralNode,
  groq: GroqNode,
  prompt: PromptNode,
  result: OutputNode
}

// UUID-based IDs prevent collisions on counter reset when nodes are deleted and re-added
const getId = () => `dndnode_${crypto.randomUUID()}`

function Canvas() {
  // Help modal stays in Canvas since it's pure UI with no business logic
  const [helpModalOpen, setHelpModalOpen] = useState(false)

  // WebSocket messages drive live node status updates during workflow execution
  const { messages, clearMessages } = useWorkflowSocket();
  const { screenToFlowPosition } = useReactFlow();
  const [type] = useDnD();
  const navigate = useNavigate()

  // All workflow state and handlers live in the hook to keep Canvas focused on rendering
  const {
    nodes,
    setNodes,
    edges,
    setEdges,
    saveModalOpen,
    setSaveModalOpen,
    loadModalOpen,
    setLoadModalOpen,
    workflowName,
    setWorkflowName,
    nameError,
    errorMessage,
    handleRun,
    handleSave,
    handleConfirmSave,
    handleLoad,
    handleConfirmLoad,
    handleDelete,
    handleCreateNewWorkflow,
    handleClear,
    handleLogout
  } = useWorkflowActions({ clearMessages })

  // Redirect to login if the JWT is expired or missing on mount
  useEffect(() => {
    const fetchData = async () => {
      const valid = await verify()
      if (!valid) {
        localStorage.removeItem('token')
        navigate('/')
      }
    }
    fetchData()
  }, [])

  // Apply incoming WebSocket events to the corresponding node's visual state
  useEffect(() => {
    Object.values(messages).forEach(message => {
      if (message.type === 'node_aborted') {
        setNodes(prevNodes => prevNodes.map(n =>
          n.id === message.nodeId
            ? { ...n, data: { ...n.data, error: true, running: false } }
            : n
        ))
      } else if (message.type === 'node_started' || message.type === 'node_complete') {
        setNodes(prevNodes => prevNodes.map(n =>
          n.id === message.nodeId
            ? { ...n, data: {
                ...n.data,
                running: message.type === 'node_started',
                response: message.type === 'node_complete' ? message.content : n.data.response
              }}
            : n
        ))
      } else if (message.type === 'groq' || message.type === 'mistral') {
        setNodes(prevNodes => prevNodes.map(n => n.id === message.nodeId ?
          { ...n, data: { ...n.data, response: message.content } }
          : n))
      }
    })
  }, [messages]);

  // Delegate node/edge change events to ReactFlow's built-in helpers
  const onNodesChange = useCallback(
    (changes) => setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
    [],
  );

  const onEdgesChange = useCallback(
    (changes) => setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
    [],
  );

  // Create a new edge when the user draws a connection between two nodes
  const onConnect = useCallback(
    (params) => setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
    [],
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Convert screen coordinates to canvas coordinates and add the dropped node
  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      if (!type) return;
      const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
      const newNode = { id: getId(), type, position, data: { label: `${type} node` } };
      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition, type],
  );

  return (
    <div className="w-screen h-screen flex flex-col gap-1">
      <div className='flex'>
        <Topbar onRun={handleRun} onLoad={handleLoad} onSave={handleSave} onLogout={handleLogout} onHelp={() => setHelpModalOpen(true)} onNew={handleCreateNewWorkflow} />
      </div>

      <div className="w-screen h-screen flex flex-row">
        <div className='h-full w-[90%] flex-1'>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            onDrop={onDrop}
            onDragOver={onDragOver}
            fitView>
            <Background />
            {/* Color legend so users can identify node types at a glance */}
            <Panel position="bottom-left">
              <div className="bg-white rounded p-2 text-xs flex flex-col gap-1 shadow">
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded border-2 border-orange-400"></div> Mistral</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded border-2 border-blue-400"></div> Groq</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded border-2 border-gray-400"></div> Prompt</div>
              </div>
            </Panel>
          </ReactFlow>
        </div>

        <div className='flex w-[10%] mr-1 mb-2'>
          <Sidebar onRun={handleRun} onClear={handleClear} />
        </div>
      </div>

      {/* First save only — subsequent saves update silently via saveId */}
      {saveModalOpen && (
        <SaveModal
          onConfirm={handleConfirmSave}
          onCancel={() => setSaveModalOpen(false)}
          workflowName={workflowName}
          setWorkflowName={setWorkflowName}
          nameError={nameError}
        />
      )}

      {/* Null when closed, array of workflows when open */}
      {loadModalOpen &&
        <LoadModal
          data={loadModalOpen}
          onCancel={() => setLoadModalOpen(null)}
          onConfirm={handleConfirmLoad}
          onDelete={handleDelete}
        />}

      {helpModalOpen && <HelpModal onClose={() => setHelpModalOpen(false)} />}
    </div>
  );
}

export default () => (
  <ReactFlowProvider>
    <DnDProvider>
      <Canvas />
    </DnDProvider>
  </ReactFlowProvider>
)
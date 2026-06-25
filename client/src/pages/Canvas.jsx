import React, { useRef, useCallback, useState, useEffect } from 'react';
import { ReactFlow, ReactFlowProvider, addEdge, applyNodeChanges, applyEdgeChanges, useReactFlow, Background, Panel } from '@xyflow/react';
import { run, verify, save, load, deleteWorkflow } from '../services/api'
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

// Map node type strings to their corresponding React components
const nodeTypes = {
  mistral: MistralNode,
  groq: GroqNode,
  prompt: PromptNode,
  result: OutputNode
}

// Default nodes loaded on canvas mount so the canvas isn't empty
const initialNodes = [
  { id: '1', type: 'prompt', position: { x: 0, y: 0 }, data: { label: 'Node 1', prompt: 'hello' } },
  { id: '2', type: 'groq', position: { x: 0, y: 100 }, data: { label: 'Node 2' } },
  { id: '3', type: 'result', position: { x: 0, y: 200 }, data: { label: 'Node 3' } }
]

// Default edges connecting the initial nodes
const initialEdges = [{ id: 'e1-2', source: '1', target: '2' },
  { id: 'e2-3', source: '2', target: '3' }
]

// Counter for generating unique node IDs on drag and drop

const getId = () => `dndnode_${crypto.randomUUID()}`


function Canvas() {
  const [nodes, setNodes] = useState(() => {const saved = localStorage.getItem('canvas_nodes'); return saved ? JSON.parse(saved) : initialNodes})

  const [edges, setEdges] = useState(() => {const saved = localStorage.getItem('canvas_edges'); return saved ? JSON.parse(saved) : initialEdges});

  const [errorMessage, setErrorMessage] = useState('')
  // Stores the current save's DB id — null means this workflow hasn't been saved yet
  const [saveId, setSaveId] = useState(null)
  // Opens help screen which explains how to use website
  const [helpModalOpen, setHelpModalOpen] = useState(false)
  // Controls visibility of the save name modal
  const [saveModalOpen, setSaveModalOpen] = useState(false)
  // Stores the loaded workflows array — null when modal is closed, array when open
  const [loadModalOpen, setLoadModalOpen] = useState(null)
  // Controlled input value for the workflow name in the save modal
  const [workflowName, setWorkflowName] = useState('')
  // Validation error message shown in the save modal
  const [nameError, setNameError] = useState('')
  // for Web Socket
  const { messages, clearMessages } = useWorkflowSocket();

  const { screenToFlowPosition, updateNodeData } = useReactFlow();
  const [type] = useDnD();
  const navigate = useNavigate()



  useEffect(() => {
    localStorage.setItem('canvas_nodes', JSON.stringify(nodes))
    localStorage.setItem('canvas_edges', JSON.stringify(edges))
  }, [nodes, edges]);
  // On mount, verify the JWT token is still valid
  // If expired or missing, clear token and redirect to login
  useEffect(() => {
    const fetchData = async() => {
      const valid = await verify()
      if(!valid){
        localStorage.removeItem('token')
        navigate('/')
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    if (messages.type === 'node_aborted') {
      setNodes(prevNodes => prevNodes.map(n => 
        n.id === messages.nodeId 
          ? {...n, data: {...n.data, error: true, running: false}} 
          : n
      ))
    }

    else if (messages.type === 'node_started' || messages.type === 'node_complete') {
      setNodes(prevNodes => prevNodes.map(n => 
        n.id === messages.nodeId 
          ? {...n, data: {
              ...n.data, 
              running: messages.type === 'node_started',
              response: messages.type === 'node_complete' ? messages.content : n.data.response
            }} 
          : n
      ))
    }

    else if (messages.type === 'groq' || messages.type === 'mistral'){ 
      setNodes(prevNodes => prevNodes.map(n => n.id === messages.nodeId ? 
        {...n, data: {...n.data, response: messages.content}} 
        : n))
    }

  }, [messages]);

  // Sync node state with React Flow internal changes (position, selection, etc)
  const onNodesChange = useCallback(
    (changes) => setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
    [],
  );

  // Sync edge state with React Flow internal changes
  const onEdgesChange = useCallback(
    (changes) => setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
    [],
  );

  // Add a new edge when user connects two nodes
  const onConnect = useCallback(
    (params) => setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
    [],
  );

  // Allow dropping by preventing default browser drag behavior
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);
 
  // Handle node drop onto canvas — create new node at drop position
  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
 
      // check if the dropped element is valid
      if (!type) {
        return;
      }
 
      // Convert screen coordinates to React Flow canvas coordinates
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      const newNode = {
        id: getId(),
        type,
        position,
        data: { label: `${type} node` },
      };
 
      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition, type],
  );

  // Send current nodes and edges to the execution engine
  // Results are written back into output nodes via updateNodeData
  const handleRun = async () => {
    try{
      clearMessages()
      setNodes(prevNodes => prevNodes.map(n => ({
        ...n,
        data: { ...n.data, response: '' }
      })))

      const data = await run({ nodes, edges })
      Object.entries(data).forEach(item => {
        const [outputId, outputData] = item
        updateNodeData(outputId, {output: Object.values(outputData).join('\n') })
        clearMessages()
      })
        
    } catch(error){
      setErrorMessage('Unable to Run Workflow')
    }
  }

  // Save current workflow to the database
  // If a saveId exists, update the existing save silently
  // If not, open the modal to name the new workflow
  const handleSave = async () => {
    if (saveId) {
      const {id} = await save({nodes, edges, saveId, name: workflowName})
      setSaveId(id)
    } else {
      setSaveModalOpen(true)
    }
  }

  // Called when user confirms the save name in the modal
  // Validates the name, saves to DB, closes modal and resets name input
  const handleConfirmSave = async () => {
    if (!workflowName.trim()) {
      setNameError('Please enter a name')
      return
    }
    const {id} = await save({nodes, edges, saveId, name: workflowName})
    setSaveId(id)
    setSaveModalOpen(false)
    setWorkflowName('')
  }

  // Fetches all saved workflows for the current user and opens the load modal
  const handleLoad = async() => {
    const loadData = await load()
    setLoadModalOpen(loadData)
  }

  // Called when user selects a workflow in the load modal
  // Replaces canvas state with the loaded workflow and sets saveId for future updates
  const handleConfirmLoad = (workflow) => {
    setNodes(workflow.nodes)
    setEdges(workflow.edges)
    setSaveId(workflow.id)
    setWorkflowName(workflow.name)
    setLoadModalOpen(null)
  }

  const handleDelete = async (workflow) => {
      if (!window.confirm(`Delete "${workflow.name}"?`)) return
      try {
        await deleteWorkflow({ id: workflow.id })
        setLoadModalOpen(prev => prev.filter(w => w.id !== workflow.id))
      } catch (error) {
        // it failed
      }
  }

  const handleCreateNewWorkflow = () =>{
    setSaveId(null)
    setNodes([])
    setEdges([])
  }

  const handleClear = () => {
    if (!window.confirm('Clear the canvas?')) return
    setNodes([])
    setEdges([])
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/')
  }
  
  return (
    <div className="w-screen h-screen flex flex-col gap-1">

        <div className='flex'>
          <Topbar onRun={handleRun} onLoad={handleLoad} onSave={handleSave} onLogout={handleLogout} onHelp={() => setHelpModalOpen(true)} onNew={handleCreateNewWorkflow}/>
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
              
              <Background/>

              {/* Legend showing node type colors */}
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
              <Sidebar onRun={handleRun} onClear={handleClear}/>
            </div>
        
        </div>

        {/* Save name modal — shown on first save only */}
        {saveModalOpen && (
          <SaveModal
            onConfirm={handleConfirmSave}
            onCancel={() => setSaveModalOpen(false)}
            workflowName={workflowName}
            setWorkflowName={setWorkflowName}
            nameError={nameError}
          />
        )}

        {/* Load modal — shown when user clicks load, passes workflow list as data */}
        {loadModalOpen && 
        <LoadModal data={loadModalOpen}
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
      <Canvas>
      </Canvas>
    </DnDProvider>
  </ReactFlowProvider>
)
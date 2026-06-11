import React, { useRef, useCallback, useState, useEffect } from 'react';
import { ReactFlow, ReactFlowProvider, addEdge, applyNodeChanges, applyEdgeChanges, Controls, useReactFlow, Background, Panel } from '@xyflow/react';
import { run, verify, save } from '../services/api'
import { useNavigate } from 'react-router-dom';

import '@xyflow/react/dist/style.css';

import Sidebar from '../components/Sidebar';
import { DnDProvider, useDnD } from '../components/DnDContext';
import ClaudeNode from '../components/nodes/ClaudeNode';
import GroqNode from '../components/nodes/GroqNode';
import PromptNode from '../components/nodes/PromptNode';
import OutputNode from '../components/nodes/OutputNode';

// Map node type strings to their corresponding React components
const nodeTypes = {
  claude: ClaudeNode,
  groq: GroqNode,
  prompt: PromptNode,
  result: OutputNode
}

// Default nodes loaded on canvas mount so the canvas isn't empty
const initialNodes = [
  { id: '1', type: 'prompt', position: { x: 0, y: 0 }, data: { label: 'Node 1', prompt: 'hello' } },
  { id: '2', type: 'groq', position: { x: 0, y: 100 }, data: { label: 'Node 2' } },
  { id: '3', type: 'result', position: { x: 0, y: 200 }, data: { label: 'Node 3' } }
];

// Default edges connecting the initial nodes
const initialEdges = [{ id: 'e1-2', source: '1', target: '2' },
  { id: 'e2-3', source: '2', target: '3' }
];

// Counter for generating unique node IDs on drag and drop
let id = 0;
const getId = () => `dndnode_${id++}`;


function Canvas() {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const [errorMessage, setErrorMessage] = useState('')
  const [saveId, setSaveId] = useState(null)
  const { screenToFlowPosition, updateNodeData } = useReactFlow();
  const [type] = useDnD();
  const navigate = useNavigate()

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

  const onDragStart = (event, nodeType) => {
    setType(nodeType);
    event.dataTransfer.setData('text/plain', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  // Send current nodes and edges to the execution engine
  // Results are written back into output nodes via updateNodeData
  const handleRun = async () => {
    try{
      const data = await run({ nodes, edges })
      Object.entries(data).forEach(item => {
        
        const [outputId, outputData] = item
        updateNodeData(outputId, {output: Object.values(outputData).join('\n') })
      })
        
    } catch(error){
      setErrorMessage('Unable to Run Workflow')
    }
  }

  // Save current workflow to the database
  const handleSave = async () => {
    const {id} = await save({nodes, edges, saveId})
    setSaveId(id)
  }

  return (
    <div className="w-screen h-screen flex flex-col">
        <Sidebar onRun={handleRun} onSave={handleSave}/>
        <div className='h-full w-full flex-1'>
          
          <ReactFlow 
            nodes={nodes} 
            edges={edges} 
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            onDrop={onDrop}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            fitView>
            
            <Background/>

            {/* Legend showing node type colors */}
            <Panel position="bottom-left">
              <div className="bg-white rounded p-2 text-xs flex flex-col gap-1 shadow">
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded border-2 border-orange-400"></div> Claude</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded border-2 border-blue-400"></div> Groq</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded border-2 border-gray-400"></div> Prompt</div>
              </div>
            </Panel>

          </ReactFlow>
          </div>
        
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
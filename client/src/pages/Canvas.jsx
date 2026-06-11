import React, { useRef, useCallback, useState } from 'react';
import { ReactFlow, ReactFlowProvider, addEdge, applyNodeChanges, applyEdgeChanges, Controls, useReactFlow, Background, Panel } from '@xyflow/react';
import { run } from '../services/api'

import '@xyflow/react/dist/style.css';

import Sidebar from '../components/Sidebar';
import { DnDProvider, useDnD } from '../components/DnDContext';
import ClaudeNode from '../components/nodes/ClaudeNode';
import GroqNode from '../components/nodes/GroqNode';
import PromptNode from '../components/nodes/PromptNode';
import OutputNode from '../components/nodes/OutputNode';

const nodeTypes = {
  claude: ClaudeNode,
  groq: GroqNode,
  prompt: PromptNode,
  result: OutputNode
}


const initialNodes = [
  { id: '1', type: 'prompt', position: { x: 0, y: 0 }, data: { label: 'Node 1', prompt: 'hello' } },
  { id: '2', type: 'groq', position: { x: 0, y: 100 }, data: { label: 'Node 2' } },
  { id: '3', type: 'result', position: { x: 0, y: 200 }, data: { label: 'Node 3' } }
];

const initialEdges = [{ id: 'e1-2', source: '1', target: '2' },
  { id: 'e2-3', source: '2', target: '3' }
];

let id = 0;
const getId = () => `dndnode_${id++}`;


function Canvas() {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const [errorMessage, setErrorMessage] = useState('')
  const { screenToFlowPosition, updateNodeData } = useReactFlow();
  const [type] = useDnD();


  const onNodesChange = useCallback(
    (changes) => setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
    [],
  );

  const onEdgesChange = useCallback(
    (changes) => setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
    [],
  );

  const onConnect = useCallback(
    (params) => setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
    [],
  );


  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);
 
  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
 
      // check if the dropped element is valid
      if (!type) {
        return;
      }
 
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

  return (
    <div className="w-screen h-screen flex flex-col">
        <Sidebar onRun={handleRun}/>
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
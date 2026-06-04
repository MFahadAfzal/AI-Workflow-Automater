import React, { useRef, useCallback, useState } from 'react';
import { ReactFlow, ReactFlowProvider, addEdge, applyNodeChanges, applyEdgeChanges, Controls, useReactFlow, Background } from '@xyflow/react';

import '@xyflow/react/dist/style.css';

import Sidebar from '../components/Sidebar';
import { DnDProvider, useDnD } from '../components/DnDContext';
import ClaudeNode from '../components/nodes/ClaudeNode';

const nodeTypes = {
  claude: ClaudeNode,
}


const initialNodes = [
  { id: '1', position: { x: 0, y: 0 }, data: { label: 'Node 1' } },
  { id: '2', position: { x: 0, y: 100 }, data: { label: 'Node 2' } },
];

const initialEdges = [{ id: 'e1-2', source: '1', target: '2' }];

let id = 0;
const getId = () => `dndnode_${id++}`;


function Canvas() {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const { screenToFlowPosition } = useReactFlow();
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

  return (
    <div className="w-screen h-screen ">
        <Sidebar />
        <div className='h-full w-full'>
          
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
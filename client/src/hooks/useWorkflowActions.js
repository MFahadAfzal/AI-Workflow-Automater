import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { run, save, load, deleteWorkflow } from '../services/api'
import { useReactFlow } from '@xyflow/react'

// Fallback canvas state for first-time users with no localStorage data
const initialNodes = [
  { id: '1', type: 'prompt', position: { x: 0, y: 0 }, data: { label: 'Node 1', prompt: 'hello' } },
  { id: '2', type: 'groq', position: { x: 0, y: 100 }, data: { label: 'Node 2' } },
  { id: '3', type: 'result', position: { x: 0, y: 200 }, data: { label: 'Node 3' } }
]

const initialEdges = [
  { id: 'e1-2', source: '1', target: '2' },
  { id: 'e2-3', source: '2', target: '3' }
]

export function useWorkflowActions({ clearMessages }) {
    const navigate = useNavigate()
    const { updateNodeData } = useReactFlow()

    // Seed from localStorage so canvas survives page refresh
    const [nodes, setNodes] = useState(() => {
        const saved = localStorage.getItem('canvas_nodes')
        return saved ? JSON.parse(saved) : initialNodes
    })

    const [edges, setEdges] = useState(() => {
        const saved = localStorage.getItem('canvas_edges')
        return saved ? JSON.parse(saved) : initialEdges
    })

    // null means unsaved — used to determine INSERT vs UPDATE on save
    const [saveId, setSaveId] = useState(null)
    const [workflowName, setWorkflowName] = useState('')
    // Controls whether the name input modal is shown on first save
    const [saveModalOpen, setSaveModalOpen] = useState(false)
    // null when closed, array of workflows when open
    const [loadModalOpen, setLoadModalOpen] = useState(null)
    const [nameError, setNameError] = useState('')
    const [errorMessage, setErrorMessage] = useState('')

    // Keep localStorage in sync whenever nodes or edges change
    useEffect(() => {
        localStorage.setItem('canvas_nodes', JSON.stringify(nodes))
        localStorage.setItem('canvas_edges', JSON.stringify(edges))
    }, [nodes, edges])

    // Clear previous output, reset node responses, run the workflow, then write final results back
    const handleRun = async () => {
        try {
            clearMessages()
            setNodes(prevNodes => prevNodes.map(n => ({
                ...n,
                data: { ...n.data, response: '', error: false }
            })))
            setNodes(prevNodes => prevNodes.map(n => ({
                ...n,
                data: { ...n.data, response: '' }
            })))

            const data = await run({ nodes, edges })
            Object.entries(data).forEach(item => {
                const [outputId, outputData] = item
                updateNodeData(outputId, { output: Object.values(outputData).join('\n') })
            })
        } catch (error) {
            setErrorMessage('Unable to Run Workflow')
        }
    }

    // Silent update if already saved, otherwise open modal to name the workflow
    const handleSave = async () => {
        if (saveId) {
            const { id } = await save({ nodes, edges, saveId, name: workflowName })
            setSaveId(id)
        } else {
            setSaveModalOpen(true)
        }
    }

    // Validates name then saves — sets saveId so future saves go through the update path
    const handleConfirmSave = async () => {
        if (!workflowName.trim()) {
            setNameError('Please enter a name')
            return
        }
        const { id } = await save({ nodes, edges, saveId, name: workflowName })
        setSaveId(id)
        setSaveModalOpen(false)
        setWorkflowName('')
    }

    const handleLoad = async () => {
        const loadData = await load()
        setLoadModalOpen(loadData)
    }

    // Replace canvas state with the selected workflow and set saveId for future updates
    const handleConfirmLoad = (workflow) => {
        clearMessages()
        setNodes(workflow.nodes)
        setEdges(workflow.edges)
        setSaveId(workflow.id)
        setWorkflowName(workflow.name)
        setLoadModalOpen(null)
    }

    // Optimistically removes from the modal list without refetching
    const handleDelete = async (workflow) => {
        if (!window.confirm(`Delete "${workflow.name}"?`)) return
        try {
            await deleteWorkflow({ id: workflow.id })
            setLoadModalOpen(prev => prev.filter(w => w.id !== workflow.id))
        } catch (error) {
            // it failed
        }
    }

    // Resets saveId so the next save triggers an INSERT rather than an UPDATE
    const handleCreateNewWorkflow = () => {
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

    return {
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
    }
}
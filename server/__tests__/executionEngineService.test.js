// Mock aiController without loading the real file
jest.mock('../controllers/aiController', () => ({ aiChat: jest.fn() }))

const executionEngineService = require('../services/executionEngineService')
const aiController = require('../controllers/aiController')

// Stand-in for a real WebSocket connection — only needs a callable .send()
const mockWs = { send: jest.fn() }


// Test #1

test('test - simple prompt to output workflow', async () => {
    const nodes = [
        { id: 'prompt1', type: 'prompt', data: { prompt: 'Hello' } },
        { id: 'result1', type: 'result' }
    ]

    const edges = [
        { source: 'prompt1', target: 'result1' }
    ]
    const result = await executionEngineService.executeWorkflow(nodes, edges, mockWs)
    expect(result).toEqual({ result1: { prompt1: 'Hello' } })
})

// Test #2


test('test - one AI node', async () => {
    // Fake response
    aiController.aiChat.mockResolvedValue("Fake AI response")

    const nodes = [
    { id: 'prompt1', type: 'prompt', data: { prompt: 'Hello' } },
    { id: 'ai1', type: 'groq' },
    { id: 'result1', type: 'result' }
    ]
    const edges = [
    { source: 'prompt1', target: 'ai1' },
    { source: 'ai1', target: 'result1' }
    ]

    const result = await executionEngineService.executeWorkflow(nodes, edges, mockWs)
    expect(result).toEqual({ 
        result1: 
        { ai1: "Fake AI response" } 
    })
})


// Test #3

test('test - multiple dependencies converging on one node', async() =>{
    const nodes = [
        { id: 'prompt1', type: 'prompt', data: { prompt: 'Hello' } },
        { id: 'prompt2', type: 'prompt', data: { prompt: 'World' } },
        { id: 'result1', type: 'result' }
    ]

    const edges = [
        { source: 'prompt1', target: 'result1' },
        { source: 'prompt2', target: 'result1' }
    ]

    const result = await executionEngineService.executeWorkflow(nodes, edges, mockWs)
    expect(result).toEqual({
        result1: {
            prompt1: 'Hello',
            prompt2: 'World'
        }
    })
})

// Test #4

test('test - Cycle detection', async() =>{
    const nodes = [
        { id: 'a', type: 'prompt', data: { prompt: 'Hello' } },
        { id: 'b', type: 'prompt', data: { prompt: 'World' } }
    ]

    const edges = [
        { source: 'a', target: 'b' },
        { source: 'b', target: 'a' }
    ]

    const result = await executionEngineService.executeWorkflow(nodes, edges, mockWs)
    expect(result).toEqual({})
    expect(mockWs.send).toHaveBeenCalledWith(JSON.stringify({ type: "node_aborted", nodeId: 'a' }))
    expect(mockWs.send).toHaveBeenCalledWith(JSON.stringify({ type: "node_aborted", nodeId: 'b' }))
})

// Test #5

test('test - Parallel/Independent branches', async() =>{

    const nodes = [
        { id: 'prompt1', type: 'prompt', data: { prompt: 'Hello' } },
        { id: 'result1', type: 'result' },
        { id: 'prompt2', type: 'prompt', data: { prompt: 'World' } },
        { id: 'result2', type: 'result' }
    ]

    const edges = [
        { source: 'prompt1', target: 'result1' },
        { source: 'prompt2', target: 'result2' }
    ]

    const result = await executionEngineService.executeWorkflow(nodes, edges, mockWs)
    expect(result).toEqual({ result1: { prompt1: 'Hello' }, result2: { prompt2: 'World' }})
})

// Test #6

test('test - Empty graph', async() =>{

    const nodes = []
    const edges = []

    const result = await executionEngineService.executeWorkflow(nodes, edges, mockWs)
    expect(result).toEqual({})
})

// Test #7

test('test- Node-type routing', async() =>{
    aiController.aiChat.mockClear()

    const nodes = [
        { id: 'prompt1', type: 'prompt', data: { prompt: 'Hello' } },
        { id: 'result1', type: 'result' },
        { id: 'ai1', type: 'groq' },
        { id: 'result2', type: 'result' }
    ]

    const edges = [
        { source: 'prompt1', target: 'result1' },
        { source: 'prompt1', target: 'ai1' },
        { source: 'ai1', target: 'result2' }
    ]

    const result = await executionEngineService.executeWorkflow(nodes, edges, mockWs)

    expect(aiController.aiChat).toHaveBeenCalledTimes(1)
    expect(aiController.aiChat).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'ai1' }),
        expect.anything(),
        expect.anything()
    )
})
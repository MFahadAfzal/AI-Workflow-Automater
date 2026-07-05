// services/executionEngineService.js
const { aiChat } = require('../controllers/aiController')

exports.executeWorkflow = async (nodes, edges, ws) => {
    const targets = new Set()
    const sources = new Set()
    const adjacency = {}  // Maps each node to its downstream neighbors
    const inDegree = {}   // Tracks how many unresolved dependencies each node has
    const inputs = {}     // Accumulates outputs from upstream nodes, keyed by nodeId
    const queue = []      // Nodes ready to execute (all dependencies resolved)
    const results = {}    // Final outputs from result nodes, returned to the caller

    // Build the adjacency list and in-degree map from the edge list
    for (const edge of edges) {
        targets.add(edge.target)
        sources.add(edge.source)

        if (!(edge.source in adjacency)) {
            adjacency[edge.source] = [edge.target]
        } else {
            adjacency[edge.source].push(edge.target)
        }

        inDegree[edge.target] = (inDegree[edge.target] || 0) + 1
    }

    const executeNode = async (node) => {
        if (node.type === 'prompt') {
            // Prompt nodes pass their static text downstream as input
            for (const neighborId of adjacency[node.id]) {
                if (!(neighborId in inputs)) {
                    inputs[neighborId] = {}
                }
                inputs[neighborId][node.id] = node.data.prompt
                inDegree[neighborId]--
                // If all dependencies are resolved, the neighbor is ready to run
                if (inDegree[neighborId] === 0) {
                    const newNode = nodes.find(n => n.id === neighborId)
                    queue.push(newNode)
                }
            }
        } else if (node.type === 'mistral' || node.type === 'groq') {
            // AI nodes call the model with accumulated inputs and stream output via WebSocket
            const aiOutput = await aiChat(node, inputs, ws)

            // Pass AI output downstream to dependent nodes
            for (const neighborId of adjacency[node.id]) {
                if (!(neighborId in inputs)) {
                    inputs[neighborId] = {}
                }
                inputs[neighborId][node.id] = aiOutput
                inDegree[neighborId]--
                if (inDegree[neighborId] === 0) {
                    const newNode = nodes.find(n => n.id === neighborId)
                    queue.push(newNode)
                }
            }
        } else {
            // Result nodes collect their inputs as the final output
            results[node.id] = inputs[node.id]
        }
    }

    // Seed the queue with root nodes — nodes that have no incoming edges
    nodes.forEach(node => {
        if (sources.has(node.id) && !targets.has(node.id)) {
            queue.push(node)
        }
    })

    // Process nodes in batches — each batch runs in parallel via Promise.all
    // Kahn's algorithm: nodes only execute once all their dependencies have resolved
    while (queue.length > 0) {
        const batch = [...queue]
        queue.length = 0
        await Promise.all(batch.map(node => executeNode(node)))
    }

    // Any node still with in-degree > 0 was stuck in a cycle and never executed
    nodes.forEach(node => {
        if (inDegree[node.id] > 0) {
            ws.send(JSON.stringify({ type: "node_aborted", nodeId: node.id }))
        }
    })

    return results
}
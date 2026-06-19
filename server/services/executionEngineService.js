// services/executionEngineService.js
const { aiChat } = require('../controllers/aiController')

exports.executeWorkflow = async (nodes, edges, ws) => {
    const targets = new Set()
    const sources = new Set()
    const adjacency = {}
    const inDegree = {}
    const inputs = {}
    const queue = []
    const results = {}

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
            for (const neighborId of adjacency[node.id]) {
                if (!(neighborId in inputs)) {
                    inputs[neighborId] = {}
                }
                inputs[neighborId][node.id] = node.data.prompt
                inDegree[neighborId]--
                if (inDegree[neighborId] === 0) {
                    const newNode = nodes.find(n => n.id === neighborId)
                    queue.push(newNode)
                }
            }
        } else if (node.type === 'mistral' || node.type === 'groq') {
            const aiOutput = await aiChat(node, inputs)

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
            results[node.id] = inputs[node.id]
        }
    }

    nodes.forEach(node => {
        if (sources.has(node.id) && !targets.has(node.id)) {
            queue.push(node)
        }
    })

    while (queue.length > 0) {
        const batch = [...queue]
        queue.length = 0
        await Promise.all(batch.map(node => executeNode(node)))
    }

    return results
}
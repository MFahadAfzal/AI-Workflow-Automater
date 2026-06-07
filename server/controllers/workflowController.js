const db = require('../db/index')
const {aiChat} = require('./aiController')

exports.runWorkflow = async(req, res) => {
    const { nodes, edges } = req.body

    const targets = new Set() // tracks all node ids that are a target of at least one edge
    const sources = new Set() // tracks all node ids that are a source of at least one edge
    const adjacency = {} // maps each node id to the list of node ids it connects to
    const inDegree = {} // tracks how many edges point into each node
    const inputs = {} //stores the inputs a node needs so that when it executes all the inputs are stored in here
    const queue = []


    for (const edge of edges) {

        targets.add(edge.target)
        sources.add(edge.source)

        // build adjacency map - if source not seen before create new array, otherwise append
        if (!(edge.source in adjacency)){
            adjacency[edge.source] = [edge.target]
        } else{
            adjacency[edge.source].push(edge.target)
        }

        // increment the incoming edge count for this target node
        inDegree[edge.target] = (inDegree[edge.target] || 0) + 1
    }

    // start nodes have outgoing edges but no incoming edges. puts those start nodes into the queue
    nodes.forEach(node => {
        if (sources.has(node.id) && !targets.has(node.id)) {
            queue.push(node)
        }
    })

    //starting the workflow
    while (queue.length > 0) {
        const batch = [...queue]  // snapshot current queue
        queue.length = 0          // clear the queue
        await Promise.all(batch.map(node => executeNode(node)))
    }

    const executeNode = async(node) =>{
        if(node.type === 'prompt'){

        }else if (node.type === 'claude' || node.type === 'groq'){
            const aiOutput = await aiChat(node)
            for (const neighborId of adjacency[node.id]) {
                if(!(neighborId in inputs)){
                    inputs[neighborId] = {}
                }
                inputs[neighborId][node.id] = aiOutput
                inDegree[neighborId]--
                if (inDegree[neighborId] === 0){
                    queue.push(neighborId)
                }
            }
        }


    }
}
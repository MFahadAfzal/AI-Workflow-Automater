const db = require('../db/index')
const {aiChat} = require('./aiController')

exports.runWorkflow = async(req, res) => {

    const { nodes, edges } = req.body

    const targets = new Set() // tracks all node ids that are a target of at least one edge
    const sources = new Set() // tracks all node ids that are a source of at least one edge
    const adjacency = {} // maps each node id to the list of node ids it connects to
    const inDegree = {} // tracks how many edges point into each node
    const inputs = {} // stores the inputs a node needs so that when it executes all the inputs are stored in here
    const queue = []
    const results = {} // stores all the outputs

    // build adjacency map, track sources/targets, and calculate inDegree for each node
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

    // executes a single node based on its type and propagates output to neighbors
    const executeNode = async(node) =>{
        if(node.type === 'prompt'){
            // prompt nodes pass their static text directly to all connected neighbors
            for (const neighborId of adjacency[node.id]) {

                // if this neighbor hasn't received any inputs yet, initialize its input storage
                if(!(neighborId in inputs)){
                    inputs[neighborId] = {}
                }

                // store this node's output in the neighbor's input map, keyed by this node's id
                inputs[neighborId][node.id] = node.data.prompt

                // this neighbor has received one more of its required inputs
                inDegree[neighborId]--
                
                // if all inputs have arrived, this neighbor is ready to execute
                if (inDegree[neighborId] === 0){
                    // find the full node object and add it to the queue
                    const newNode = nodes.find(node => node.id === neighborId)
                    queue.push(newNode)
                }
            }

        }else if (node.type === 'claude' || node.type === 'groq'){
            // call the AI API with this node and its inputs, get the response text
            const aiOutput = await aiChat(node, inputs)

            // distribute this node's output to all connected neighbor nodes
            for (const neighborId of adjacency[node.id]) {

                // if this neighbor hasn't received any inputs yet, initialize its input storage
                if(!(neighborId in inputs)){
                    inputs[neighborId] = {}
                }

                // store this node's output in the neighbor's input map, keyed by this node's id
                inputs[neighborId][node.id] = aiOutput

                // this neighbor has received one more of its required inputs
                inDegree[neighborId]--
                
                // if all inputs have arrived, this neighbor is ready to execute
                if (inDegree[neighborId] === 0){
                    // find the full node object and add it to the queue
                    const newNode = nodes.find(node => node.id === neighborId)
                    queue.push(newNode)
                }
            }
        } else{
            // result nodes collect their inputs and store them in the final output map
            results[node.id] = inputs[node.id]
        }

    }

    // start nodes have outgoing edges but no incoming edges — seed the queue with them
    nodes.forEach(node => {
        if (sources.has(node.id) && !targets.has(node.id)) {
            queue.push(node)
        }
    })

    // process nodes in topological order using Kahn's algorithm
    // each iteration drains the queue, executes all ready nodes in parallel, then repeats
    while (queue.length > 0) {
        const batch = [...queue]  // snapshot current queue
        queue.length = 0          // clear the queue
        await Promise.all(batch.map(node => executeNode(node)))
    }

    res.json(results)
}


exports.saveWorkflow = async(req,res) => {
    try{
        let id
        const { nodes, edges, saveId, name } = req.body
        // JSONB columns require stringified JSON
        const formattedNodes = JSON.stringify(nodes)
        const formattedEdges = JSON.stringify(edges)
        // if no saveId exists this is a new workflow, otherwise update the existing one
        if(!saveId){
            id = await db.one('INSERT INTO saves (userId, nodes, edges, name) VALUES ($1, $2, $3, $4) RETURNING id', [req.user.id, formattedNodes, formattedEdges, name])
        }else{
            id = await db.one('UPDATE saves SET nodes=$1, edges=$2 WHERE id=$3 RETURNING id', [formattedNodes, formattedEdges, saveId])
        }
        res.json(id)
    }catch (err) {
        console.log(err)
        res.status(500).json({ error: err.message });
    }
}

exports.loadWorkflow = async(req,res) => {
    try {
        // fetch all workflows belonging to the authenticated user
        const data = await db.any('SELECT * FROM saves WHERE userId=$1;', [req.user.id])
        res.json(data)
    } catch (err) {
        console.log(err)
        res.status(500).json({ error: err.message });
    }
}
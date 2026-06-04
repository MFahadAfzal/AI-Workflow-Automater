const db = require('../db/index')

exports.runWorkflow = async(req, res) => {
    const { nodes, edges } = req.body

    const targets = new Set() //new Set(edges.map(edge => edge.target))
    const sources = new Set() //new Set(edges.map(edge => edge.source))
    const adjacency = {}
    const inDegree = {}

    for (const edge of edges) {

        targets.add(edge.target)
        sources.add(edge.source)

        if (!(edge.source in adjacency)){
            adjacency[edge.source] = [edge.target]
        } else{
            adjacency[edge.source].push(edge.target)
        }
        inDegree[edge.target] = (inDegree[edge.target] || 0) + 1
    }

    const startNodes = nodes.filter(node => 
        sources.has(node.id) && !targets.has(node.id)
    )

    
}
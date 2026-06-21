// controllers/workflowController.js
const db = require('../db/index')
const executionEngineService = require('../services/executionEngineService')
const wsConnections = require('../services/wsConnections')

exports.runWorkflow = async (req, res) => {
    const { nodes, edges } = req.body
    const ws = wsConnections.getClient(req.user.id)
    const results = await executionEngineService.executeWorkflow(nodes, edges, ws)
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

exports.deleteWorkflow = async(req,res) => {
    try {
        // fetch all workflows belonging to the authenticated user
        await db.none('DELETE FROM saves WHERE userId=$1 and id=$2;', [req.user.id, req.body.id])
        res.json({ success: true })
    } catch (err) {
        console.log(err)
        res.status(500).json({ error: err.message });
    }
}
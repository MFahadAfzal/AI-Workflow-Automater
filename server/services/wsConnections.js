// wsConnections.js
const { verifyToken } = require("./jwtService");

const { WebSocketServer } = require('ws')
const clients = new Map()

exports.init = (server) => {
    const wss = new WebSocketServer({ server })
    wss.on('connection', (ws, req) => {
        console.log('new connection attempt')
        const [path, token] = req.url.split('?token=')
        try{
            const decoded = verifyToken(token)
            // get user id from the connection (e.g. from a token in the URL query or initial message)
            console.log('REGISTERED user id:', decoded.id)
            clients.set(decoded.id, ws)
            ws.on('close', () => clients.delete(decoded.id))
        }catch (err){
            console.error('WebSocket auth failed:', err.message)
            ws.close()
        }
        
    })
}

exports.getClient = (userId) => clients.get(userId)
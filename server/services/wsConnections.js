// services/wsConnections.js
const { WebSocketServer } = require('ws')

let wss = null

exports.init = (server) => {
    wss = new WebSocketServer({ server })
}

exports.getClient = () => {
    const clients = Array.from(wss.clients)
    return clients[0]
}
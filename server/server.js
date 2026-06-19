require('dotenv').config({ path: '../.env' })


const express = require('express')
const app = express()
app.use(express.json())

const cors = require('cors')
app.use(cors())

const wsConnections = require('./services/wsConnections')

const authRoutes = require('./routes/auth')
const workflowRoutes = require('./routes/workflow')

const port = process.env.PORT || 3000


app.use('/auth', authRoutes)

app.use('/workflow', workflowRoutes)

app.use((err, req, res, next) => {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
})

const server = app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

wsConnections.init(server)
require('dotenv').config({ path: '../.env' })

const express = require('express')
const app = express()

const cors = require('cors')
app.use(cors())


const authRoutes = require('./routes/auth')


const port = process.env.PORT || 3000

app.use(express.json())
app.use('/auth', authRoutes)

app.use((err, req, res, next) => {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
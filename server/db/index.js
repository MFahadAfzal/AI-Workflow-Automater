const pgp = require('pg-promise')()
require('dotenv').config({ path: '../.env' })

const db = pgp(process.env.DATABASE_URL)

module.exports = db
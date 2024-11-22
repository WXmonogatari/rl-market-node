import mysql from 'mysql'
import dotenv from 'dotenv'

const node_env = process.env.NODE_ENV || 'development'
const config = dotenv.config({ path: `.env.${node_env}` })

const pool = mysql.createPool({
    user: config.parsed.DB_username,
    password: config.parsed.DB_password,
    port: 3306,
    host: config.parsed.DB_URL,
    database: 'market_db',
    multipleStatements: true
})

export default pool
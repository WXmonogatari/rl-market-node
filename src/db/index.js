import mysql from 'mysql'
import dotenv from 'dotenv'

const node_env = process.env.NODE_ENV || 'development'
const config = dotenv.config({ path: `.env.${node_env}` })
console.log('测试部署更新2')
const pool = mysql.createPool({
    user: process.env.DB_username,
    password: process.env.DB_password,
    port: 3306,
    host: process.env.DB_URL,
    database: 'market_db',
    multipleStatements: true
})

export default pool
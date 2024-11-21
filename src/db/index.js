import mysql from 'mysql'
const pool = mysql.createPool({
    user: 'root',
    password: 'Yhx1120.',
    host: '8.138.56.101',
    database: 'market_db',
    multipleStatements: true
})

export default pool
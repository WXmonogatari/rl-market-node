import pool from "./index.js";

const execTranstion = (sqlArr) => {
    return new Promise((resolve, reject) => {
        let promiseArr = []
        pool.getConnection((err, connection) => {
            if (err) reject(err)
            connection.beginTransaction(err => {
                if (err) return('开启事务失败')
                promiseArr = sqlArr.map(({ sql, values }) => {
                    return new Promise((resolve, reject) => {
                        connection.query(sql, values, (e, rows, fields) => {
                            e? reject(e) : resolve({ rows, success: true })
                        })
                    })
                })
                Promise.all(promiseArr).then(res => {
                    connection.commit((error) => {
                        if (error) reject(error)
                    })
                    connection.release()
                    resolve(res)
                }).catch(err => {
                    connection.rollback(() => {
                        console.log('数据操作回滚')
                    })
                    reject(err)
                })
            })
        })
    })
}

export default execTranstion
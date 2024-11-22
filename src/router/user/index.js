import express from "express"
const router = express.Router()
import execTranstion from "../../db/execTranstion.js"
import * as fs from "fs"
import multer from 'multer'
import path from 'path'
import dotenv from "dotenv"

const node_env = process.env.NODE_ENV || 'development'
const config = dotenv.config({ path: `.env.${node_env}` })
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, config.parsed.uploadPath); // 修改为希望保存的文件夹路径
    },
    filename: (req, file, cb) => {
        cb(null, `${file.originalname}`); // 生成唯一文件名
    }
})
const upload = multer({ storage: storage })

// 获取全部留言数据
router.get('/getMessage', (req, res) => {
    const { count, limit } = req.query
    let sqlArr = [
        {
            sql: 'SELECT * FROM message_tb ORDER BY id DESC LIMIT ?, ?',
            values: [Number(count), Number(limit)]
        }
    ]
    execTranstion(sqlArr).then(result => {
        let { rows } = result[0]
        if (rows.length > 0) {
            res.send({
                code: 1,
                message: '数据获取成功',
                data: rows
            })
        } else {
            res.send({
                code: -1,
                message: '没有更多数据',
                data: rows
            })
        }
    }).catch((error) => {
        res.send({
            code: 0,
            message: '数据获取失败'
        })
    })
})

// 创建一条留言
router.post('/createMessage', (req, res) => {
    const { user_id, username, createTime, text, colorIndex } = req.body
    if (!user_id || !username || !createTime || !text) {
        return res.send({
            code: -1,
            message: '用户未登录'
        })
    }

    let sqlArr = [
        {
            sql: 'INSERT INTO message_tb(user_id, username, createTime, text, colorIndex) VALUES (?, ?, ?, ?, ?)',
            values: [user_id, username, createTime, text, colorIndex]
        }
    ]

    execTranstion(sqlArr).then(result => {
        if (result[0].rows.affectedRows > 0) {
            return res.send({
                code: 1,
                message: '创建成功'
            })
        }
    }).catch(() => {
        res.send({
            code: 0,
            message: '创建失败'
        })
    })
})

// 返回一条指定留言
router.get('/getSingleMessage', (req, res) => {
    const { id } = req.query
    let sqlArr = [
        {
            sql: 'SELECT * FROM message_tb WHERE id = ?',
            values: [id]
        }
    ]

    execTranstion(sqlArr).then(result => {
        const data = result[0].rows[0]
        res.send({
            code: 1,
            message: '数据获取成功',
            data
        })
    }).catch(() => {
        res.send({
            code: 0,
            message: '数据获取失败'
        })
    })
})

// 返回一条随机留言
router.get('/getRandomMessage', (req, res) => {
    let sqlArr = [
        {
            sql: 'SELECT * FROM message_tb AS t1 JOIN (SELECT ROUND(RAND()*(SELECT MAX(id) FROM message_tb)) AS id)AS t2 WHERE t1.id>=t2.id ORDER BY t1.id LIMIT 1',
            values: []
        }
    ]

    execTranstion(sqlArr).then(result => {
        const data = result[0].rows[0]
        res.send({
            code: 1,
            message: '数据获取成功',
            data
        })
    }).catch(() => {
        res.send({
            code: 0,
            message: '数据获取失败'
        })
    })
})


// 返回传入用户id的全部留言
router.get('/myMessage', (req, res) => {
    const { id } = req.query
    let sqlArr = [
        {
            sql: 'SELECT * FROM message_tb WHERE user_id = ?',
            values: [id]
        }
    ]

    execTranstion(sqlArr).then(result => {
        const data = result[0].rows
        res.send({
            code: 1,
            message: '数据获取成功',
            data
        })
    }).catch(() => {
        res.send({
            code: 0,
            message: '数据获取失败'
        })
    })
})

// 删除一条留言
router.delete('/deleteMessage/:id/:user_id', (req, res) => {
    const { id, user_id } = req.params
    let sqlArr = [
        {
            sql: 'DELETE FROM message_tb WHERE id = ? AND user_id = ?',
            values: [id, user_id]
        }
    ]

    execTranstion(sqlArr).then(result => {
        if (result[0].rows.affectedRows > 0) {
            res.send({
                code: 1,
                message: '删除成功'
            })
        }
    }).catch(() => {
        res.send({
            code: 0,
            message: '删除失败'
        })
    })
})

// 删除全部留言
router.delete('/deleteAllMessage/:user_id', (req, res) => {
    const { user_id } = req.params
    let sqlArr = [
        {
            sql: 'DELETE FROM message_tb WHERE user_id = ?',
            values: [user_id]
        }
    ]

    execTranstion(sqlArr).then(result => {
        if (result[0].rows.affectedRows > 0) {
            res.send({
                code: 1,
                message: '已全部删除'
            })
        }
    }).catch((error) => {
        console.log(error)
        res.send({
            code: 0,
            message: '删除失败'
        })
    })
})

// 上传用户头像
router.put('/uploadAvatar/:id', upload.single('avatar'), (req, res) => {
    const { id } = req.params
    const { username } = req.body
    const file = req.file
    let oldSource = ''
    let newSource = ''
    let sql = ''
    let values = []

    if (!id) {
        return res.status(400).send({
            code: 0,
            message: '修改失败'
        })
    }
    if (username && file) {
        oldSource = path.join(config.parsed.uploadPath, file.originalname)
        newSource = path.join(config.parsed.uploadPath, `${id}-${username}-${file.originalname}`)
        fs.renameSync(oldSource, newSource)
        sql = 'UPDATE user_tb SET username = ?, avatar = ? WHERE id = ?'
        values = [username, newSource, id]
    } else if (username) {
        sql = 'UPDATE user_tb SET username = ? WHERE id = ?'
        values = [username, id]
    } else if (file) {
        oldSource = path.join(config.parsed.uploadPath, file.originalname)
        newSource = path.join(config.parsed.uploadPath, `${id}-${username}-${file.originalname}`)
        fs.renameSync(oldSource, newSource)
        sql = 'UPDATE user_tb SET avatar = ? WHERE id = ?'
        values = [newSource, id]
    }

    let sqlArr = [
        {
            sql: sql,
            values: values
        }
    ]

    execTranstion(sqlArr).then(result => {
        if (result[0].rows.affectedRows > 0) {
            res.send({
                code: 1,
                message: '修改成功'
            })
        }
    })
})

export default router
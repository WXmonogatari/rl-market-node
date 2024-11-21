import express from 'express'
import cors from "cors"
import dotenv from "dotenv"

const app = express()
const node_env = process.env.NODE_ENV || 'development'
const config = dotenv.config({ path: `.env.${node_env}` })
const port = process.env.PORT
let server = app.listen(port, '0.0.0.0',() => {
    const { address, port } = server.address()
    console.log('访问地址', address , port)
})

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

export default app
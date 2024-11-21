import express from 'express'
import cors from "cors"
const app = express()
export const port = 8023
let server = app.listen(port, () => {
    let host = server.address().address
    let port = server.address().port
    if (host === '::') {
        host = 'localhost:'
    }
    console.log('访问地址', host , port)
})

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

export default app
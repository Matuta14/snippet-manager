import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import cors from 'cors'
import authRouter from './routes/auth'
import snippetsRouter from './routes/snippets'

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

app.get('/health', (req, res) => {
    res.json({ status: 'ok' })
})

app.use('/auth', authRouter)
app.use('/snippets', snippetsRouter)

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
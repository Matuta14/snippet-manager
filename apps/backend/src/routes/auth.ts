import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../lib/prisma'

const router = Router()

// Register
router.post('/register', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            res.status(400).json({ error: 'Email and password are required' })
            return
        }

        const existing = await prisma.user.findUnique({ where: { email } })
        if (existing) {
            res.status(400).json({ error: 'Email already in use' })
            return
        }

        const hashed = await bcrypt.hash(password, 10)
        const user = await prisma.user.create({
            data: { email, password: hashed }
        })

        res.status(201).json({ message: 'User created', userId: user.id })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// Login
router.post('/login', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            res.status(400).json({ error: 'Email and password are required' })
            return
        }

        const user = await prisma.user.findUnique({ where: { email } })
        if (!user) {
            res.status(401).json({ error: 'Invalid credentials' })
            return
        }

        const valid = await bcrypt.compare(password, user.password)
        if (!valid) {
            res.status(401).json({ error: 'Invalid credentials' })
            return
        }

        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET as string,
            { expiresIn: '7d' }
        )

        res.json({ token })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

export default router
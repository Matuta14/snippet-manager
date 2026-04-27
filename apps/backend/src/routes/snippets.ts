import { Router, Response } from 'express'
import { authenticate, AuthRequest } from '../middleware/auth'
import prisma from '../lib/prisma'

const router = Router()

// Apply auth middleware to all snippet routes
router.use(authenticate)

// Get all snippets for logged in user
router.get('/', async (req: AuthRequest, res: Response) => {
    try {
        const snippets = await prisma.snippet.findMany({
            where: { userId: req.userId },
            orderBy: { createdAt: 'desc' }
        })
        res.json(snippets)
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' })
    }
})

// Get single snippet
router.get('/:id', async (req: AuthRequest, res: Response) => {
    try {
        const snippet = await prisma.snippet.findFirst({
            where: { id: String(req.params.id), userId: req.userId }
        })
        if (!snippet) {
            res.status(404).json({ error: 'Snippet not found' })
            return
        }
        res.json(snippet)
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' })
    }
})

// Create snippet
router.post('/', async (req: AuthRequest, res: Response) => {
    try {
        const { title, content, language, tags, isPublic } = req.body
        if (!title || !content || !language) {
            res.status(400).json({ error: 'Title, content and language are required' })
            return
        }
        const snippet = await prisma.snippet.create({
            data: {
                title,
                content,
                language,
                tags: tags || [],
                isPublic: isPublic || false,
                userId: req.userId!
            }
        })
        res.status(201).json(snippet)
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' })
    }
})

// Update snippet
router.put('/:id', async (req: AuthRequest, res: Response) => {
    try {
        const { title, content, language, tags, isPublic } = req.body
        const snippet = await prisma.snippet.findFirst({
            where: { id: String(req.params.id), userId: req.userId }
        })
        if (!snippet) {
            res.status(404).json({ error: 'Snippet not found' })
            return
        }
        const updated = await prisma.snippet.update({
            where: { id: String(req.params.id) },
            data: { title, content, language, tags, isPublic }
        })
        res.json(updated)
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' })
    }
})

// Delete snippet
router.delete('/:id', async (req: AuthRequest, res: Response) => {
    try {
        const snippet = await prisma.snippet.findFirst({
            where: { id: String(req.params.id), userId: req.userId }
        })
        if (!snippet) {
            res.status(404).json({ error: 'Snippet not found' })
            return
        }
        await prisma.snippet.delete({ where: { id: String(req.params.id) } })
        res.json({ message: 'Snippet deleted' })
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' })
    }
})

export default router
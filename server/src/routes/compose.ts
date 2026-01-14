import { Router, Request, Response } from 'express'
import { generateCompletion, ComposeContext } from '../services/claude'

const router = Router()

interface ComposeRequest {
  currentText: string
  context: ComposeContext
}

router.post('/', async (req: Request<object, object, ComposeRequest>, res: Response) => {
  try {
    const { currentText, context } = req.body

    if (!currentText) {
      res.status(400).json({ error: 'currentText is required' })
      return
    }

    const result = await generateCompletion(currentText, context || {})

    res.json(result)
  } catch (error) {
    console.error('Compose error:', error)
    res.status(500).json({ error: 'Failed to generate completion' })
  }
})

export default router

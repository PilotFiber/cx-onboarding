import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

import composeRouter from './routes/compose'
import suggestionsRouter, { cleanCache } from './routes/suggestions'

const app = express()
const PORT = process.env.PORT || 3001

// Parse allowed origins from environment
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
  'http://localhost:5173',
  'http://localhost:5174',
]

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true)

      if (allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    },
    credentials: true,
  })
)

app.use(express.json())

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  })
})

// API routes
app.use('/api/compose', composeRouter)
app.use('/api/suggestions', suggestionsRouter)

// Error handling middleware
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error('Server error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
)

// Start server
app.listen(PORT, () => {
  console.log(`AI Compose server running on http://localhost:${PORT}`)
  console.log(`Allowed origins: ${allowedOrigins.join(', ')}`)

  // Clean cache periodically (every hour)
  setInterval(cleanCache, 60 * 60 * 1000)
})

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully')
  process.exit(0)
})

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully')
  process.exit(0)
})

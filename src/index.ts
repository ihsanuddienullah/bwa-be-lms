import bodyParser from 'body-parser'
import cors from 'cors'
import { config } from 'dotenv'
import express from 'express'
import authRoutes from './routes/auth-routes'
import courseRoutes from './routes/course-routes'
import globalRoutes from './routes/global-routes'
import paymentRoutes from './routes/payment-routes'
import studentRoutes from './routes/student-routes'
import connectToDatabase from './utils/database'

const app = express()
const port = 3000

config()

connectToDatabase()

app.use(cors())
app.use(bodyParser.json())
app.use(express.static('public'))

app.use((req, _, next) => {
  console.log(`${req.method} ${req.originalUrl}`)
  next()
})

app.get('/', (_, res) => {
  res.send('Hello World!')
})

app.use('/api', globalRoutes)
app.use('/api', authRoutes)
app.use('/api', paymentRoutes)
app.use('/api', courseRoutes)
app.use('/api', studentRoutes)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

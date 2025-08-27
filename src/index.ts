import bodyParser from 'body-parser'
import cors from 'cors'
import { config } from 'dotenv'
import express from 'express'
import authRoutes from './routes/auth-routes'
import globalRoutes from './routes/global-routes'
import paymentRoutes from './routes/payment-routes'
import connectToDatabase from './utils/database'

const app = express()
const port = 3000

config()

connectToDatabase()

app.use(cors())
app.use(bodyParser.json())
app.use(express.static('public'))

app.get('/', (_, res) => {
  res.send('Hello World!')
})

app.use('/api', globalRoutes)
app.use('/api', authRoutes)
app.use('/api', paymentRoutes)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

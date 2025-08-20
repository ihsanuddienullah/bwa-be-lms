import express from 'express'
import { helloWorld } from '../controllers/global-controller'
import { validateRequest } from '../middlewares/validate-request'
import { exampleSchema } from '../utils/schema'

const globalRouter = express.Router()

globalRouter.get('/hello-world', helloWorld)
globalRouter.post('/test-validation', validateRequest(exampleSchema), async (_, res) => {
  return res.json({ message: 'Validation passed' })
})

export default globalRouter

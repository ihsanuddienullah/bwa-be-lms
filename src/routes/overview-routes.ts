import express from 'express'
import { getOverviewStatistic } from '../controllers/overview-controller'
import verifyToken from '../middlewares/verify-token'

const overviewRoutes = express.Router()

overviewRoutes.get('/overview', verifyToken, getOverviewStatistic)

export default overviewRoutes

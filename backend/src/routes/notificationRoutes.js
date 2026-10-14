import express from 'express'
import {
  listNotifications,
  readNotification,
  readAllNotifications,
} from '../controllers/notificationController.js'
import { authenticateToken } from '../middlewares/authenticateToken.js'

const router = express.Router()

router.get('/', authenticateToken, listNotifications)
router.patch('/read-all', authenticateToken, readAllNotifications)
router.patch('/:id/read', authenticateToken, readNotification)

export default router
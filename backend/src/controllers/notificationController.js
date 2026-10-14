import {
  getNotificationsByUserId,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} from '../models/notificationModel.js'

const listNotifications = async (req, res) => {
  try {
    const notifications = await getNotificationsByUserId(req.user.userId)
    const unreadCount = await getUnreadCount(req.user.userId)

    res.json({ notifications, unreadCount })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Failed to load notifications' })
  }
}

const readNotification = async (req, res) => {
  try {
    await markAsRead(Number(req.params.id), req.user.userId)
    res.json({ success: true })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Failed to update notification' })
  }
}

const readAllNotifications = async (req, res) => {
  try {
    await markAllAsRead(req.user.userId)
    res.json({ success: true })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Failed to update notifications' })
  }
}

export { listNotifications, readNotification, readAllNotifications }
import sql from 'mssql'
import { connectDB } from '../config/db.js'

// Create a notification (pass a transaction to include it in an existing one)
const createNotification = async (
  { userId, type, title, message, link = null },
  transaction = null
) => {
  const pool = await connectDB()
  const request = transaction ? new sql.Request(transaction) : pool.request()

  request.input('UserId', sql.UniqueIdentifier, userId)
  request.input('Type', sql.VarChar, type)
  request.input('Title', sql.NVarChar, title)
  request.input('Message', sql.NVarChar, message)
  request.input('Link', sql.VarChar, link)

  await request.query(`
    INSERT INTO Notifications (userId, type, title, message, link)
    VALUES (@UserId, @Type, @Title, @Message, @Link)
  `)
}

const getNotificationsByUserId = async userId => {
  const pool = await connectDB()
  const request = pool.request()

  request.input('UserId', sql.UniqueIdentifier, userId)

  const result = await request.query(`
    SELECT TOP 50 notificationId, type, title, message, link, isRead, createdAt
    FROM Notifications
    WHERE userId = @UserId
    ORDER BY createdAt DESC
  `)

  return result.recordset
}

const getUnreadCount = async userId => {
  const pool = await connectDB()
  const request = pool.request()

  request.input('UserId', sql.UniqueIdentifier, userId)

  const result = await request.query(`
    SELECT COUNT(*) AS count
    FROM Notifications
    WHERE userId = @UserId AND isRead = 0
  `)

  return result.recordset[0].count
}

// Scoped by userId so users can only touch their own notifications
const markAsRead = async (notificationId, userId) => {
  const pool = await connectDB()
  const request = pool.request()

  request.input('NotificationId', sql.Int, notificationId)
  request.input('UserId', sql.UniqueIdentifier, userId)

  await request.query(`
    UPDATE Notifications
    SET isRead = 1
    WHERE notificationId = @NotificationId AND userId = @UserId
  `)
}

const markAllAsRead = async userId => {
  const pool = await connectDB()
  const request = pool.request()

  request.input('UserId', sql.UniqueIdentifier, userId)

  await request.query(`
    UPDATE Notifications SET isRead = 1
    WHERE userId = @UserId AND isRead = 0
  `)
}

export {
  createNotification,
  getNotificationsByUserId,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
}
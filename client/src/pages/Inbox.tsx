import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../services/notifications'
import type { Notification } from '../services/notifications'

function Inbox() {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      const data = await fetchNotifications()
      setNotifications(data.notifications)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleOpen = async (n: Notification) => {
    if (!n.isRead) {
      await markNotificationRead(n.notificationId)
      setNotifications(prev =>
        prev.map(x => (x.notificationId === n.notificationId ? { ...x, isRead: true } : x))
      )
    }

    if (n.link) navigate(n.link)
  }

  const handleMarkAll = async () => {
    await markAllNotificationsRead()
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
  }

  return (
    <div style={{ padding: '2rem', maxWidth: 800, margin: '0 auto' }}>
      <h1>Inbox</h1>

      <button onClick={handleMarkAll}>Mark all as read</button>

      {loading && <p>Loading...</p>}
      {!loading && notifications.length === 0 && <p>No notifications.</p>}

      {notifications.map(n => (
        <div
          key={n.notificationId}
          onClick={() => handleOpen(n)}
          style={{
            cursor: 'pointer',
            padding: '1rem',
            marginTop: '0.75rem',
            borderRadius: 8,
            fontWeight: n.isRead ? 400 : 600,
            background: n.isRead ? 'transparent' : 'rgba(255,255,255,0.06)',
          }}
        >
          <div>{n.title}</div>
          <div>{n.message}</div>
          <small>{new Date(n.createdAt).toLocaleString()}</small>
        </div>
      ))}
    </div>
  )
}

export default Inbox
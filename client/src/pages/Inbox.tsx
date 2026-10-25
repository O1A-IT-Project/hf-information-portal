import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import styles from './Inbox.module.css'

import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../services/notifications'
import type { Notification } from '../services/notifications'

// ============================================================
// Inbox Dummy Data
// ============================================================
const DUMMY: Notification[] = [
  {
    notificationId: 1,
    type: 'role_approved',
    title: 'Your account was approved',
    message: 'You now have access to create and send surveys. [SAMPLE]',
    link: '/profile',
    isRead: false,
    createdAt: new Date().toISOString(),
  },
  {
    notificationId: 2,
    type: 'survey',
    title: 'New survey available: Employee Wellness 2025',
    message: 'A new survey has been published in your organisation. It closes in 7 days — make sure to submit your response before then. [SAMPLE]',
    link: '/survey',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    notificationId: 3,
    type: 'survey',
    title: 'Reminder: finish your draft',
    message: 'You have an unfinished survey draft waiting. [SAMPLE]',
    link: null,
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
  },
]

function Inbox() {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      // const data = await fetchNotifications()
      // setNotifications(data.notifications)
      setNotifications(DUMMY)
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
        prev.map(x =>
          x.notificationId === n.notificationId ? { ...x, isRead: true } : x
        )
      )
    }
    if (n.link) navigate(n.link)
  }

  const handleMarkAll = async () => {
    await markAllNotificationsRead()
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
  }

  const hasUnread = notifications.some(n => !n.isRead)

  return (
    <div className={styles.inboxContainer}>
      <div className={styles.inboxHeader}>
        <h1 className={styles.inboxTitle}>Inbox</h1>
        <button
          className={styles.markAllButton}
          onClick={handleMarkAll}
          disabled={!hasUnread}
        >
          Mark all as read
        </button>
        <Link 
          to="/profile" 
          className={styles.markAllButton}
          style={{ display: 'inline-block', textAlign: 'center', textDecoration: 'none' }}
        >
          Return to Profile
        </Link>
      </div>

      {loading && <p className={styles.inboxEmpty}>Loading...</p>}

      {!loading && notifications.length === 0 && (
        <p className={styles.inboxEmpty}>No notifications.</p>
      )}

      {!loading && notifications.length > 0 && (
        <div className={styles.notificationList}>
          {notifications.map(n => (
            <div
              key={n.notificationId}
              onClick={() => handleOpen(n)}
              className={`${styles.notificationItem} ${
                !n.isRead ? styles.notificationUnread : ''
              }`}
            >
              {/* Left: icon based on type */}
              <div className={styles.notificationIcon}>
                {n.type === 'role_approved' ? '✓' : '🔔'}
              </div>

              {/* Middle: content */}
              <div className={styles.notificationContent}>
                <p className={styles.notificationTitle}>{n.title}</p>
                <p className={styles.notificationMessage}>{n.message}</p>
                <span className={styles.notificationTime}>
                  {new Date(n.createdAt).toLocaleString()}
                </span>
              </div>

              {/* Right: unread dot */}
              {!n.isRead && <span className={styles.notificationDot} />}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Inbox
import axios from 'axios'

const API = 'http://localhost:3000/api/notifications'

export type Notification = {
  notificationId: number
  type: string
  title: string
  message: string
  link: string | null
  isRead: boolean
  createdAt: string
}

export const fetchNotifications = async () => {
  const res = await axios.get<{ notifications: Notification[]; unreadCount: number }>(API, {
    withCredentials: true,
  })
  return res.data
}

export const markNotificationRead = (id: number) =>
  axios.patch(`${API}/${id}/read`, null, { withCredentials: true })

export const markAllNotificationsRead = () =>
  axios.patch(`${API}/read-all`, null, { withCredentials: true })
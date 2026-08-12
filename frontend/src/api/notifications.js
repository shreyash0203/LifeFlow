import api from "./axios";

// Get all notifications
export const getNotifications = async () => {
  const response = await api.get("/notifications");
  return response.data;
};

// Mark one notification as read
export const markNotificationAsRead = async (id) => {
  const response = await api.patch(`/notifications/${id}/read`);
  return response.data;
};

// Delete one notification
export const deleteNotification = async (id) => {
  const response = await api.delete(`/notifications/${id}`);
  return response.data;
};






